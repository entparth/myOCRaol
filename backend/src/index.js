import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Debug logging
console.log('Environment variables loaded:');
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GOOGLE_SHEET_ID exists:', !!process.env.GOOGLE_SHEET_ID);
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL exists:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
console.log('Firebase Service Account project_id:', serviceAccount.project_id);

if (!serviceAccount.project_id) {
  console.error('Firebase service account configuration is missing or invalid');
  process.exit(1);
}

let bucket;
let db;

try {
  const firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  console.log('Firebase Admin initialized successfully');
  
  // Initialize Firestore
  db = getFirestore(firebaseApp);
  console.log('Firestore initialized');
  
  // Initialize Storage
  bucket = getStorage(firebaseApp).bucket();
  console.log('Storage bucket initialized');
} catch (error) {
  console.error('Error initializing Firebase services:', error);
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Add root route handler
app.get('/', (req, res) => {
  res.json({ message: 'AOL OCR Backend Server is running' });
});

// Upload and process image
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Received file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    if (!bucket) {
      throw new Error('Storage bucket not initialized');
    }

    const uid = uuidv4();
    console.log('Generated UID:', uid);
    const fileName = `forms/${uid}-${req.file.originalname}`;
    
    try {
      // Firebase Storage Upload
      try {
        console.log('Starting file upload to Firebase Storage...');
        const fileBuffer = req.file.buffer;
        const file = bucket.file(fileName);
        await file.save(fileBuffer);
        console.log('File uploaded to Firebase Storage successfully');
        
        const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });
        console.log('Generated signed URL for file:', url);
      } catch (firebaseError) {
        console.error('Firebase Storage error:', {
          code: firebaseError.code,
          message: firebaseError.message,
          stack: firebaseError.stack
        });
        throw new Error(`Firebase Storage error: ${firebaseError.message}`);
      }

      // Gemini API Processing
      let parsedData;
      try {
        console.log('Starting Gemini API processing...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const prompt = `Please analyze this feedback form image and extract the following information in a structured format:
        - Program name and date
        - Room number and accommodation details
        - Name of participant
        - Program experience ratings
        - Suggestions
        - Overall ashram experience ratings
        - Volunteer preferences
        - Contribution interests
        Please format the response as a JSON object with these exact keys:
        {
          "Program": "string",
          "Program Date": "string",
          "Name": "string",
          "Room No": "string",
          "Program Experience": {
            "How satisfied are you?": "string",
            "How were you feeling before the program?": "string",
            "How were you feeling after the program?": "string",
            "How likely would you recommend this program?": "string"
          },
          "Suggestions": "string",
          "Overall Ashram Experience": {
            "Housing?": "string",
            "Hygiene and cleanliness?": "string",
            "Dining Experience?": "string",
            "Program arrangements?": "string"
          },
          "Volunteer Preferences": "string",
          "Contribution Interests": "string"
        }`;

        console.log('Sending request to Gemini API...');
        const result = await model.generateContent([prompt, { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } }]);
        const response = await result.response;
        console.log('Received response from Gemini API');
        
        if (!response || !response.text) {
          console.error('Invalid response from Gemini API:', response);
          throw new Error('Invalid response from Gemini API');
        }

        const responseText = response.text();
        console.log('Raw Gemini API response:', responseText);

        try {
          parsedData = JSON.parse(responseText);
          console.log('Successfully parsed Gemini API response');

          // Validate required fields
          const requiredFields = ['Program', 'Program Date', 'Name', 'Room No'];
          const missingFields = requiredFields.filter(field => !parsedData[field]);
          
          if (missingFields.length > 0) {
            console.error('Missing required fields in parsed data:', missingFields);
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
          }

          // Ensure nested objects exist
          if (!parsedData['Program Experience']) {
            parsedData['Program Experience'] = {};
          }
          if (!parsedData['Overall Ashram Experience']) {
            parsedData['Overall Ashram Experience'] = {};
          }

        } catch (parseError) {
          console.error('Error parsing Gemini API response:', parseError);
          console.log('Raw response:', responseText);
          throw new Error(`Failed to parse Gemini API response: ${parseError.message}`);
        }
      } catch (geminiError) {
        console.error('Gemini API error:', {
          message: geminiError.message,
          stack: geminiError.stack,
          response: geminiError.response?.data
        });
        throw new Error(`Gemini API error: ${geminiError.message}`);
      }

      // Add metadata
      parsedData.uid = uid;
      parsedData.imageUrl = url;
      parsedData.uploadedAt = new Date().toISOString();

      console.log('Data to be saved:', JSON.stringify(parsedData, null, 2));

      // Firestore Save
      try {
        console.log('Saving data to Firestore...');
        await db.collection('feedback').doc(uid).set(parsedData);
        console.log('Data saved to Firestore successfully');
      } catch (firestoreError) {
        console.error('Firestore error:', {
          code: firestoreError.code,
          message: firestoreError.message,
          stack: firestoreError.stack
        });
        throw new Error(`Firestore error: ${firestoreError.message}`);
      }

      // Google Sheets Update
      try {
        console.log('Updating Google Sheet...');
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        await doc.useServiceAccountAuth({
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.addRow({
          UID: uid,
          Program: parsedData.Program,
          'Program Date': parsedData['Program Date'],
          Name: parsedData.Name,
          'Room No': parsedData['Room No'],
          'Image URL': url,
          // Add other fields as needed
        });
        console.log('Google Sheet updated successfully');
      } catch (sheetsError) {
        console.error('Google Sheets error:', {
          message: sheetsError.message,
          stack: sheetsError.stack
        });
        throw new Error(`Google Sheets error: ${sheetsError.message}`);
      }

      res.json({
        success: true,
        data: parsedData
      });
    } catch (storageError) {
      console.error('Storage operation error:', {
        code: storageError.code,
        message: storageError.message,
        details: storageError.details,
        stack: storageError.stack
      });

      if (storageError.code === 404) {
        return res.status(503).json({
          error: 'Storage service not available',
          message: 'Please ensure Firebase Storage is enabled and bucket is created',
          details: storageError.message
        });
      }

      throw storageError;
    }
  } catch (error) {
    console.error('Error processing upload:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to process upload',
      details: error.message,
      code: error.code
    });
  }
});

// Get all feedback entries
app.get('/api/feedback', async (req, res) => {
  try {
    console.log('Attempting to fetch feedback from Firestore...');
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    try {
      // First check if the collection exists
      const collections = await db.listCollections();
      const collectionExists = collections.some(col => col.id === 'feedback');
      
      if (!collectionExists) {
        console.log('Feedback collection does not exist yet. Creating empty collection...');
        // Create an empty collection
        await db.collection('feedback').doc('init').set({ timestamp: new Date() });
        return res.json([]);
      }

      const snapshot = await db.collection('feedback')
        .orderBy('uploadedAt', 'desc')
        .get();
      
      const feedback = [];
      snapshot.forEach(doc => {
        feedback.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Successfully fetched ${feedback.length} feedback entries`);
      res.json(feedback);
    } catch (firestoreError) {
      console.error('Firestore operation error:', {
        code: firestoreError.code,
        message: firestoreError.message,
        details: firestoreError.details
      });

      // Check for specific Firestore errors
      if (firestoreError.code === 5) {
        return res.status(503).json({
          error: 'Firestore service not available',
          message: 'Please ensure Firestore API is enabled and database is created',
          details: firestoreError.message
        });
      }

      throw firestoreError; // Re-throw other errors
    }
  } catch (error) {
    console.error('Detailed error fetching feedback:', {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack
    });
    
    // Send a more informative error response
    res.status(500).json({ 
      error: 'Failed to fetch feedback',
      details: error.message,
      code: error.code
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 