# Ticketing System Refactor - Design Document

## Overview

This document outlines the technical design for refactoring the Hubly CRM into a ticketing/chat support system with role-based access control, ticket assignment workflow, and fetch-based (non-real-time) chat updates.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Landing Page   │
│  + Chat Widget  │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
    ┌────▼─────┐   ┌───▼────────┐
    │  Public  │   │   Auth     │
    │  Routes  │   │  Routes    │
    └──────────┘   └────┬───────┘
                        │
                   ┌────▼──────────┐
                   │   Dashboard   │
                   │   (Protected) │
                   └───────────────┘
```

### Component Hierarchy

```
App
├── Landing (Public)
│   └── FloatingChatWidget
├── Login (Public)
├── Signup (Admin/Team Only)
└── Protected Routes
    ├── Dashboard
    ├── ChatCenter
    ├── Analytics
    ├── ChatbotCustomization
    ├── Teams (Admin Only)
    └── Settings
```

## Components and Interfaces

### 1. Floating Chat Widget Component

**Purpose:** Allow external users to submit support queries without registration

**Props:**
- `isOpen`: boolean
- `onToggle`: function
- `customization`: object (colors, welcome message)

**State:**
- `step`: 'initial' | 'form' | 'chat'
- `formData`: { name, email, phone }
- `messages`: array
- `currentMessage`: string

**Key Methods:**
- `handleSubmitContact()`: Create ticket with user info
- `handleSendMessage()`: Add message to ticket
- `fetchMessages()`: Poll for new messages

**UI Structure:**
```
┌─────────────────────────┐
│  Chat Widget (Closed)   │
│  [💬 Icon] [Toast]      │
└─────────────────────────┘

┌─────────────────────────┐
│  Chat Widget (Open)     │
│  ┌───────────────────┐  │
│  │ Header      [X]   │  │
│  ├───────────────────┤  │
│  │ Welcome Message   │  │
│  │                   │  │
│  │ [Name Input]      │  │
│  │ [Email Input]     │  │
│  │ [Phone Input]     │  │
│  │                   │  │
│  │ [Submit Button]   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 2. Dashboard Component (Refactored)

**Purpose:** Display and manage tickets with search and filtering

**Key Features:**
- Ticket search by ID
- Scrollable ticket list (overflow-y)
- Status indicators
- Assignment information
- Quick actions

**Data Flow:**
```
Dashboard → API → GET /tickets?status=all
         ← Tickets Array
         → Render List
```

### 3. Chat Center Component (Refactored)

**Purpose:** Handle ticket conversations with assignment workflow

**Admin View:**
- See all tickets
- Assign/reassign tickets
- View assignment details only (no chat access after assignment)

**Team Member View:**
- See only assigned tickets
- Reply to tickets
- Mark as resolved

**Assignment Flow:**
```
1. Admin clicks "Assign"
2. Show confirmation modal
3. Select team member
4. Confirm → API call
5. Admin loses chat access
6. Team member gains access
```

### 4. Analytics Component (Enhanced)

**Charts Required:**
1. **Missed Chats by Week** (Bar Chart)
   - X-axis: Last 10 weeks
   - Y-axis: Count of missed chats
   - Data: Computed from tickets with no reply within threshold

2. **Average Reply Time** (Metric Card)
   - Calculate: (Sum of first reply times) / (Total tickets)
   - Display in hours/minutes

3. **Resolution Percentage** (Metric Card)
   - Calculate: (Resolved tickets / Total tickets) × 100
   - Display as percentage

**Data Structure:**
```javascript
{
  missedChatsByWeek: [
    { week: 'Week 1', count: 5 },
    { week: 'Week 2', count: 3 },
    // ... 10 weeks
  ],
  avgReplyTime: '2.5h',
  resolutionPercentage: 85.6
}
```

### 5. Chatbot Customization Component

**Purpose:** Allow admin to customize chat widget appearance

**Features:**
- Color pickers (header, background, input)
- Welcome message editor
- Live preview
- Save/Reset buttons

**Customization Schema:**
```javascript
{
  colors: {
    header: '#184E7F',
    background: '#FFFFFF',
    input: '#F3F4F6'
  },
  welcomeMessage: 'Hello! How can I help you today?',
  greetingMessage: 'Welcome to Hubly Support'
}
```

### 6. Teams Component (Admin Only)

**Purpose:** Manage team member accounts

**Features:**
- Add team member (name, email, auto-password)
- Edit own profile only
- Delete team members (except admin)
- View team list

**Restrictions:**
- Admin cannot be deleted
- Admin cannot be edited by others
- Team members can only self-edit
- Password change triggers logout

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (enum: ['admin', 'member']),
  phone: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket Model
```javascript
{
  _id: ObjectId,
  ticketId: String (unique, auto-generated),
  userContactInfo: {
    name: String,
    email: String,
    phone: String
  },
  assignedTo: ObjectId (ref: User, nullable),
  status: String (enum: ['unresolved', 'resolved']),
  messages: [{
    sender: String (name or 'Team'),
    senderType: String (enum: ['user', 'team']),
    body: String,
    timestamp: Date
  }],
  createdAt: Date,
  resolvedAt: Date (nullable),
  firstReplyAt: Date (nullable),
  missedChat: Boolean (computed)
}
```

### Customization Model
```javascript
{
  _id: ObjectId,
  colors: {
    header: String,
    background: String,
    input: String
  },
  welcomeMessage: String,
  greetingMessage: String,
  missedChatThreshold: Number (minutes, default: 5),
  updatedAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin/team member
- `POST /api/auth/register` - Register team member (admin only)
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/verify` - Verify JWT token

### Tickets
- `POST /api/tickets/create` - Create ticket (external user)
- `GET /api/tickets` - Get all tickets (with filters)
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id/assign` - Assign ticket (admin only)
- `POST /api/tickets/:id/messages` - Add message to ticket
- `PUT /api/tickets/:id/resolve` - Mark ticket as resolved
- `GET /api/tickets/search?ticketId=XXX` - Search by ticket ID

### Users/Team
- `GET /api/users/team` - Get all team members (admin only)
- `POST /api/users/team` - Add team member (admin only)
- `DELETE /api/users/team/:id` - Delete team member (admin only)
- `PUT /api/users/profile` - Update own profile
- `PUT /api/users/password` - Change password

### Analytics
- `GET /api/analytics/missed-chats` - Get missed chats by week
- `GET /api/analytics/avg-reply-time` - Get average reply time
- `GET /api/analytics/resolution-rate` - Get resolution percentage
- `GET /api/analytics/dashboard` - Get all analytics data

### Customization
- `GET /api/customization` - Get chat widget customization
- `PUT /api/customization` - Update customization (admin only)

## Error Handling

### Authentication Errors
- 401: Unauthorized (invalid credentials)
- 403: Forbidden (insufficient permissions)
- 404: User not found

### Ticket Errors
- 404: Ticket not found
- 403: Not assigned to this ticket
- 400: Invalid ticket data

### Validation Errors
- 400: Email format invalid
- 400: Password too weak
- 400: Required fields missing

## Security Considerations

1. **JWT Authentication**
   - Store token in httpOnly cookie or localStorage
   - Include role in JWT payload
   - Verify token on protected routes

2. **Role-Based Access Control**
   - Middleware to check user role
   - Admin-only routes protected
   - Team members can only access assigned tickets

3. **Input Validation**
   - Sanitize user inputs
   - Validate email format
   - Check password strength
   - Prevent SQL/NoSQL injection

4. **Rate Limiting**
   - Limit ticket creation (prevent spam)
   - Limit login attempts
   - Throttle API requests

## Performance Optimization

1. **Polling Strategy**
   - Poll every 5 seconds when chat is open
   - Stop polling when chat is closed
   - Use timestamp to fetch only new messages

2. **Pagination**
   - Use overflow-y scroll (not pagination)
   - Load initial 50 tickets
   - Lazy load more on scroll

3. **Caching**
   - Cache customization settings
   - Cache user profile data
   - Invalidate on updates

## Testing Strategy

### Unit Tests
- Component rendering
- Form validation
- API service functions
- Utility functions

### Integration Tests
- Authentication flow
- Ticket creation and assignment
- Message sending and receiving
- Team member management

### E2E Tests
- External user submits query
- Admin assigns ticket
- Team member replies
- Ticket resolution

## Deployment Architecture

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Render        │
│   (Backend)     │
└────────┬────────┘
         │
         │ MongoDB
         │
┌────────▼────────┐
│  MongoDB Atlas  │
│   (Database)    │
└─────────────────┘
```

### Environment Variables

**Frontend (.env)**
```
REACT_APP_API_URL=https://api.hubly.com
REACT_APP_ENV=production
```

**Backend (.env)**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://hubly.com
```

## Migration Plan

### Phase 1: Backend Updates
1. Update User model (add role field)
2. Create Ticket model
3. Create Customization model
4. Implement new API endpoints
5. Add role-based middleware

### Phase 2: Frontend Core
1. Create FloatingChatWidget component
2. Update Landing page
3. Modify authentication flow
4. Update Dashboard for tickets

### Phase 3: Chat & Assignment
1. Refactor Chat Center
2. Implement assignment workflow
3. Add confirmation modals
4. Update permissions

### Phase 4: Analytics & Customization
1. Enhance Analytics page
2. Create Chatbot Customization page
3. Implement color pickers
4. Add live preview

### Phase 5: Team Management
1. Refactor Teams page
2. Add admin-only controls
3. Implement self-edit restrictions
4. Add password change logout

### Phase 6: Testing & Deployment
1. Test all workflows
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Update README with credentials
5. Final testing on production
