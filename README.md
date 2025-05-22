# Art of Living Feedback Dashboard

A modern web application for digitizing and managing Art of Living feedback forms using Google Gemini API for OCR, Firebase for storage, and Google Sheets for data management.

## Features

- Upload and process handwritten feedback forms
- Extract form data using Google Gemini API
- Store images in Firebase Storage
- Save structured data in Firestore and Google Sheets
- Real-time dashboard with form data
- Mobile-friendly interface

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Storage: Firebase Storage & Firestore
- OCR: Google Gemini API
- Data Management: Google Sheets API
- UI Framework: Material UI
- State Management: React Query

## Prerequisites

1. Node.js (v18 or later)
2. npm or yarn
3. Firebase account and project
4. Google Cloud project with Gemini API enabled
5. Google Service Account with necessary permissions

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aol-ocr-dashboard
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   # Firebase Configuration
   FIREBASE_SERVICE_ACCOUNT=<your-service-account-json>
   FIREBASE_STORAGE_BUCKET=<your-bucket-name>

   # Google Gemini API
   GEMINI_API_KEY=<your-api-key>

   # Google Sheets
   GOOGLE_SHEET_ID=<your-sheet-id>
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<your-service-account-email>
   GOOGLE_PRIVATE_KEY=<your-private-key>

   # Server Configuration
   PORT=3000
   ```

4. Start the development servers:
   ```bash
   npm start
   ```

   This will start both the frontend (port 5173) and backend (port 3000) servers.

## Project Structure

```
aol-ocr-dashboard/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx        # Main app component
│   │   └── ...
│   └── package.json
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── index.js      # Server entry point
│   │   └── ...
│   └── package.json
└── package.json          # Root package.json
```

## Configuration Guide

### Firebase Setup

1. Create a new Firebase project
2. Enable Storage and Firestore
3. Create a service account and download the credentials
4. Add the credentials to your `.env` file

### Google Gemini API

1. Enable the Gemini API in your Google Cloud project
2. Create an API key
3. Add the API key to your `.env` file

### Google Sheets Setup

1. Create a new Google Sheet
2. Share it with your service account email
3. Copy the Sheet ID from the URL
4. Add the Sheet ID to your `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. # myOCRaol
