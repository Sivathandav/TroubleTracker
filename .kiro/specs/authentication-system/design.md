# Authentication System Design Document

## Overview

The Authentication System is built using a JWT-based authentication approach with secure password hashing. The system consists of frontend React components for login and signup interfaces, backend Express.js API endpoints for authentication operations, and MongoDB for user data persistence. The design ensures that only the first admin can signup, while subsequent users are created through team management, and enforces automatic session termination on password changes.

## Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄─────► │  Express Backend │ ◄─────► │  MongoDB        │
│  (Auth Pages)   │  HTTP   │  (Auth API)      │         │  (Users)        │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Component Architecture

**Frontend:**
- Login Page Component
- Signup Page Component
- Protected Route Wrapper Component
- Auth Context Provider (for global auth state)
- Auth Service (API calls)

**Backend:**
- Auth Routes (`/api/auth/login`, `/api/auth/signup`)
- Auth Controller (business logic)
- Auth Middleware (token verification)
- User Model (MongoDB schema)

### Technology Stack

- **Frontend**: React JS, React Router, Vanilla CSS/CSS Modules
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **HTTP Client**: fetch API or axios

## Components and Interfaces

### Frontend Components

#### 1. Login Component (`/login`)

**Purpose**: Authenticate existing users

**State Management**:
```javascript
{
  email: string,
  password: string,
  error: string | null,
  loading: boolean
}
```

**UI Elements** (from Figma):
- Email input field
- Password input field
- Login button
- Link to signup page (conditional - only if no admin exists)
- Error message display

**Behavior**:
- Form validation on submit
- API call to `/api/auth/login`
- Store JWT token in localStorage
- Redirect to dashboard on success
- Display error message on failure

#### 2. Signup Component (`/signup`)

**Purpose**: Create the first admin account

**State Management**:
```javascript
{
  name: string,
  email: string,
  password: string,
  error: string | null,
  loading: boolean
}
```

**UI Elements** (from Figma):
- Name input field
- Email input field
- Password input field
- Signup button
- Link to login page
- Error message display

**Behavior**:
- Check if admin exists on component mount
- Redirect to login if admin exists
- Form validation on submit
- API call to `/api/auth/signup`
- Redirect to login page on success
- Display error message on failure

#### 3. ProtectedRoute Component

**Purpose**: Wrap protected routes and enforce authentication

**Props**:
```javascript
{
  children: ReactNode,
  requiredRole?: 'admin' | 'team_member'
}
```

**Behavior**:
- Check for valid JWT token in localStorage
- Verify token with backend on mount
- Redirect to login if unauthenticated
- Render children if authenticated
- Optional role-based access control

#### 4. AuthContext Provider

**Purpose**: Manage global authentication state

**Context Value**:
```javascript
{
  user: { id, name, email, role } | null,
  token: string | null,
  login: (email, password) => Promise<void>,
  logout: () => void,
  isAuthenticated: boolean,
  loading: boolean
}
```

### Backend API Endpoints

#### 1. POST `/api/auth/signup`

**Purpose**: Create the first admin account

**Request Body**:
```javascript
{
  name: string,      // required, min 2 chars
  email: string,     // required, valid email format
  password: string   // required, min 6 chars
}
```

**Response** (Success - 201):
```javascript
{
  success: true,
  message: "Admin account created successfully",
  user: {
    id: string,
    name: string,
    email: string,
    role: "admin"
  }
}
```

**Response** (Error - 400):
```javascript
{
  success: false,
  message: "Email already exists" | "Admin account already exists"
}
```

**Business Logic**:
1. Check if any admin exists in database
2. If admin exists, return error
3. Validate input data
4. Check if email already exists
5. Hash password using bcrypt (salt rounds: 10)
6. Create user with role "admin"
7. Return success response (no token - user must login)

#### 2. POST `/api/auth/login`

**Purpose**: Authenticate existing users

**Request Body**:
```javascript
{
  email: string,     // required
  password: string   // required
}
```

**Response** (Success - 200):
```javascript
{
  success: true,
  token: string,     // JWT token
  user: {
    id: string,
    name: string,
    email: string,
    role: "admin" | "team_member"
  }
}
```

**Response** (Error - 401):
```javascript
{
  success: false,
  message: "Invalid credentials"
}
```

**Business Logic**:
1. Find user by email
2. If user not found, return "Invalid credentials"
3. Compare password with hashed password using bcrypt
4. If password invalid, return "Invalid credentials"
5. Generate JWT token with payload: { userId, email, role }
6. Token expiration: 7 days
7. Return token and user data

#### 3. GET `/api/auth/verify`

**Purpose**: Verify JWT token validity

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (Success - 200):
```javascript
{
  success: true,
  user: {
    id: string,
    name: string,
    email: string,
    role: string
  }
}
```

**Response** (Error - 401):
```javascript
{
  success: false,
  message: "Invalid or expired token"
}
```

#### 4. GET `/api/auth/check-admin`

**Purpose**: Check if admin account exists

**Response** (200):
```javascript
{
  adminExists: boolean
}
```

**Business Logic**:
1. Query database for user with role "admin"
2. Return true if found, false otherwise

### Backend Middleware

#### Auth Middleware (`authMiddleware.js`)

**Purpose**: Verify JWT token for protected routes

**Implementation**:
```javascript
// Pseudo-code
function authMiddleware(req, res, next) {
  // Extract token from Authorization header
  // Verify token using jwt.verify()
  // If valid, attach user data to req.user
  // If invalid, return 401 error
  // Call next() if valid
}
```

**Usage**: Apply to all protected routes

## Data Models

### User Model (MongoDB Schema)

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    immutable: true  // Prevents email changes
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'team_member'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- Unique index on `email`
- Index on `role` for admin queries

**Pre-save Hook**:
- Hash password before saving (only if password is modified)

## Error Handling

### Frontend Error Handling

**Validation Errors**:
- Display inline error messages below form fields
- Prevent form submission if validation fails

**API Errors**:
- Display error message from API response
- Handle network errors with generic message
- Clear errors on new form submission

**Error States**:
- "Email already exists" (signup)
- "Invalid credentials" (login)
- "Admin account already exists" (signup)
- "Network error. Please try again."

### Backend Error Handling

**Validation Errors** (400):
- Missing required fields
- Invalid email format
- Password too short
- Email already exists

**Authentication Errors** (401):
- Invalid credentials
- Invalid or expired token
- Missing authorization header

**Server Errors** (500):
- Database connection errors
- Unexpected errors (log and return generic message)

**Error Response Format**:
```javascript
{
  success: false,
  message: string,
  errors?: array  // Optional field-specific errors
}
```

## Security Considerations

### Password Security

1. **Hashing**: Use bcryptjs with salt rounds of 10
2. **Storage**: Never store plain text passwords
3. **Transmission**: Always use HTTPS in production
4. **Validation**: Minimum 6 characters (as per requirements)

### JWT Security

1. **Secret Key**: Store in environment variable (JWT_SECRET)
2. **Expiration**: 7 days
3. **Storage**: localStorage on frontend (consider httpOnly cookies for production)
4. **Verification**: Verify on every protected route

### Session Management

1. **Logout on Password Change**: 
   - Invalidate token by changing user's password hash
   - Frontend clears localStorage and redirects to login
   - Consider token versioning for multi-device support

2. **Token Invalidation**:
   - On password change, all existing tokens become invalid
   - Frontend must handle 401 responses and redirect to login

### Email Immutability

1. **Database Level**: Use `immutable: true` in Mongoose schema
2. **API Level**: Exclude email from update operations
3. **Validation**: Reject any requests attempting to modify email

## Testing Strategy

### Frontend Testing

**Unit Tests**:
- Form validation logic
- Auth context state management
- API service functions

**Integration Tests**:
- Login flow (form submission → API call → redirect)
- Signup flow (form submission → API call → redirect)
- Protected route access (authenticated vs unauthenticated)
- Error handling (display error messages)

**Manual Testing**:
- UI matches Figma design exactly
- Responsive layout
- Form field validation
- Error message display
- Navigation flows

### Backend Testing

**Unit Tests**:
- Password hashing function
- JWT token generation and verification
- Input validation

**Integration Tests**:
- POST `/api/auth/signup` - success and error cases
- POST `/api/auth/login` - success and error cases
- GET `/api/auth/verify` - valid and invalid tokens
- GET `/api/auth/check-admin` - admin exists and doesn't exist

**Edge Cases**:
- Duplicate email signup
- Login with wrong password
- Login with non-existent email
- Signup when admin already exists
- Invalid JWT token
- Expired JWT token
- Missing authorization header

### End-to-End Testing

1. **First Admin Signup Flow**:
   - Access signup page
   - Create admin account
   - Verify redirect to login
   - Login with new credentials
   - Verify dashboard access

2. **Subsequent Signup Attempt**:
   - Access signup page
   - Verify redirect to login (admin exists)

3. **Password Change Flow**:
   - Login as user
   - Change password
   - Verify automatic logout
   - Login with new password

4. **Protected Route Access**:
   - Access protected route without token
   - Verify redirect to login
   - Login and access protected route
   - Verify successful access

## Implementation Notes

### Frontend Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Login.module.css
│   │   ├── Signup.jsx
│   │   └── Signup.module.css
│   └── common/
│       └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
├── services/
│   └── authService.js
├── utils/
│   └── validation.js
└── App.jsx
```

### Backend Structure

```
server/
├── models/
│   └── User.js
├── controllers/
│   └── authController.js
├── routes/
│   └── authRoutes.js
├── middleware/
│   └── authMiddleware.js
├── utils/
│   └── generateToken.js
├── config/
│   └── db.js
└── server.js
```

### Environment Variables

**Backend** (`.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hubly-crm
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
NODE_ENV=development
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Deployment Considerations (Render)

**Backend**:
- Set environment variables in Render dashboard
- Use MongoDB Atlas for production database
- Enable CORS for frontend domain
- Use HTTPS

**Frontend**:
- Build optimized production bundle
- Configure API URL for production
- Deploy as static site

### CSS Styling Guidelines

1. **Extract from Figma**:
   - Colors (primary, secondary, error, text, background)
   - Typography (font family, sizes, weights)
   - Spacing (margins, padding)
   - Border radius, shadows

2. **CSS Modules**:
   - One module per component
   - Use semantic class names
   - Follow BEM naming convention

3. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints as per Figma design
   - Test on multiple screen sizes

4. **Form Styling**:
   - Input field states (default, focus, error)
   - Button states (default, hover, active, disabled)
   - Error message styling
   - Loading states

## Dependencies

### Frontend

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x"
}
```

### Backend

```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "dotenv": "^16.x",
  "cors": "^2.x",
  "express-validator": "^7.x"
}
```

### Dev Dependencies

```json
{
  "nodemon": "^3.x",
  "concurrently": "^8.x"
}
```
