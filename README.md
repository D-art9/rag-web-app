# RAG Web Application

## Overview
The Retrieval-Augmented Generation (RAG) web application is designed to facilitate user interactions with a language model by integrating transcript extraction from YouTube videos and leveraging a vector database for efficient information retrieval. This application consists of a frontend built with React and a backend powered by Node.js.

## Project Structure
The project is organized into two main directories: `frontend` and `backend`. Each directory contains its own source files, configuration files, and dependencies.

```
rag-web-app
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── services
│   │   ├── hooks
│   │   ├── types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend
│   ├── src
│   │   ├── api
│   │   ├── rag
│   │   ├── transcripts
│   │   ├── vectordb
│   │   ├── services
│   │   ├── config
│   │   ├── types
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install the dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Backend Setup
1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Install the dependencies:
   ```
   npm install
   ```
3. Start the backend server:
   ```
   npm run start
   ```

## Usage Guidelines
- Users can upload YouTube video URLs through the frontend, which will trigger transcript extraction.
- The application allows users to interact with a chat interface to ask questions related to the extracted transcripts.
- Search functionality is available to retrieve relevant information based on user queries.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.