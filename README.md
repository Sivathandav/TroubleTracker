# Hubly CRM

A full-stack CRM application built with MERN stack (MongoDB, Express.js, React.js, Node.js).

## Project Structure

```
hubly-crm/
├── client/          # React frontend
├── server/          # Express backend
└── README.md
```

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Vanilla CSS / CSS Modules
- Poppins font

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

## Features

### Authentication System
- Admin signup (first user only)
- Login for admin and team members
- JWT-based authentication
- Secure password hashing
- Protected routes
- Auto-logout on password change

### Dashboard
- Ticket metrics
- Search functionality
- Pagination

### Contact Center
- Chat management
- Ticket assignment
- Status tracking

### Analytics
- Performance metrics
- Visual charts

### Team Management
- Add/edit/delete team members
- Role management

### Chat Bot Settings
- Customizable chat widget
- Configuration options

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set environment variables
5. Deploy

### Frontend (Render/Netlify/Vercel)
1. Build production bundle: `npm run build`
2. Deploy build folder
3. Set production API URL

## License

MIT
