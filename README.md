# Art of Living Feedback Form OCR System

This project is an automated feedback form processing system that uses OCR (Optical Character Recognition) to extract information from handwritten feedback forms. It's built using React for the frontend and Node.js for the backend, with Firebase for storage and Google Sheets for data management.

## Features

- Image upload and processing
- OCR using Google's Gemini API
- Data storage in Firebase
- Data export to Google Sheets
- CSV export functionality
- Responsive web interface
- Print-friendly design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account
- Google Cloud account
- Gemini API access

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aolOcr.git
cd aolOcr
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

1. Create a `.env` file in the `backend` directory with the following variables:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", "project_id": "your-project-id", "private_key_id": "your-private-key-id", "private_key": "your-private-key", "client_email": "your-client-email", "client_id": "your-client-id", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "your-cert-url"}
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key

# Google Sheets Configuration
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-private-key

# Server Configuration
PORT=3001
```

### 4. Firebase Setup

1. Create a new Firebase project
2. Enable Firestore and Storage
3. Create a service account and download the credentials
4. Update the `.env` file with your Firebase credentials

### 5. Google Cloud Setup

1. Create a new Google Cloud project
2. Enable the Gemini API
3. Create API credentials
4. Update the `.env` file with your Gemini API key

### 6. Google Sheets Setup

1. Create a new Google Sheet
2. Share it with your service account email
3. Copy the Sheet ID from the URL
4. Update the `.env` file with your Sheet ID and service account credentials

### 7. Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
aolOcr/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.tsx
│   │   │   └── FeedbackTable.tsx
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
└── README.md
```

## API Endpoints

### POST /api/upload
Upload and process a feedback form image
- Content-Type: multipart/form-data
- Body: image file

### GET /api/feedback
Retrieve all feedback entries
- Response: Array of feedback objects

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for OCR capabilities
- Firebase for storage and database
- Material-UI for the frontend components
- React Query for data fetching
