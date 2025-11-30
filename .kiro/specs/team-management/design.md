# Design Document: Team Management

## Overview

The Team Management feature provides administrators with tools to manage team members and enables all users to manage their own profiles. The system enforces role-based access control, distinguishing between admin and member roles. Admins can add, edit, and delete team members, while members can only view the roster and edit their own profile information.

## Architecture

The Team Management system follows a client-server architecture with the following layers:

1. **Frontend (React)**: Components for team roster display, member management forms, and profile editing
2. **Backend (Node.js/Express)**: RESTful API endpoints for user management operations
3. **Database (MongoDB)**: Persistent storage of user data with role-based access control

### Data Flow

```
User Action → React Component → API Request → Express Controller → MongoDB → Response → UI Update
```

## Components and Interfaces

### Frontend Components

#### 1. Teams Component (Admin View)
- **Location**: `client/src/components/Teams/Teams.jsx`
- **Responsibilities**:
  - Display team roster in table format
  - Provide add member functionality
  - Handle member deletion with confirmation
  - Support search and sorting
  - Enforce admin-only access

#### 2. Settings Component (Profile Management)
- **Location**: `client/src/components/Settings/Settings.jsx`
- **Responsibilities**:
  - Display user profile information
  - Allow editing of first name, last name, phone, and designation
  - Prevent email modification
  - Handle password changes with logout redirect
  - Display notification preferences

#### 3. Team Roster View (Member View)
- **Location**: `client/src/components/Teams/Teams.jsx` (read-only mode)
- **Responsibilities**:
  - Display team members in read-only format
  - Support sorting by name and email
  - Prevent access to add/edit/delete functions

### Backend API Endpoints

#### User Management Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/team` | Fetch all team members | Bearer Token |
| POST | `/users/team` | Add new team member | Bearer Token (Admin) |
| PUT | `/users/team/:id` | Edit team member | Bearer Token (Admin) |
| DELETE | `/users/team/:id` | Delete team member | Bearer Token (Admin) |
| PUT | `/users/profile` | Update own profile | Bearer Token |
| PUT | `/users/password` | Change password | Bearer Token |

## Data Models

### User Schema (MongoDB)

```javascript
{
  _id: ObjectId,
  name: String (required, min 2 chars),
  email: String (required, unique, immutable),
  password: String (required, hashed, min 6 chars),
  role: String (enum: ['admin', 'team_member']),
  phone: String (optional),
  designation: String (optional),
  firstName: String (optional),
  lastName: String (optional),
  createdAt: Date (default: now)
}
```

### Request/Response Formats

#### Add Team Member Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "team_member"
}
```

#### Update Profile Request
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "designation": "Support Agent"
}
```

#### Change Password Request
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Admin Account Protection
*For any* team member with admin role, the system SHALL prevent deletion and editing of that account through the UI.
**Validates: Requirements 1.5, 1.7, 4.1**

### Property 2: Email Uniqueness
*For any* new team member addition, if an email already exists in the system, the system SHALL reject the addition and display an error message.
**Validates: Requirements 1.3**

### Property 3: Default Password Assignment
*For any* newly added team member, the system SHALL set the default password to the user's email address.
**Validates: Requirements 1.2**

### Property 4: Email Immutability
*For any* user attempting to modify their email address, the system SHALL prevent the change and display a message indicating email cannot be modified.
**Validates: Requirements 3.2**

### Property 5: Password Change Logout
*For any* user who changes their password, the system SHALL log them out and redirect them to the login page.
**Validates: Requirements 3.4, 3.5**

### Property 6: Role-Based Access Control
*For any* non-admin user attempting to access team management functions (add, edit, delete), the system SHALL prevent the action and display an error message.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 7: Member Self-Edit
*For any* member accessing their own profile, the system SHALL allow editing of first name, last name, phone, and designation fields.
**Validates: Requirements 3.1**

### Property 8: Team Roster Visibility
*For any* member viewing the team roster, the system SHALL display all team members' information (name, email, role, designation) in read-only format.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 9: Sorting Consistency
*For any* team roster display, sorting by name or email SHALL maintain consistent ordering across multiple sort operations.
**Validates: Requirements 2.4, 2.5**

## Error Handling

### Frontend Error Handling
- Display user-friendly error messages for failed API requests
- Validate form inputs before submission
- Show confirmation dialogs for destructive actions (delete)
- Handle network timeouts gracefully

### Backend Error Handling
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)
- Provide descriptive error messages
- Log errors for debugging
- Validate all inputs on the server side

### Common Error Scenarios
1. **Duplicate Email**: Return 400 with message "Email already exists"
2. **Unauthorized Access**: Return 403 with message "Insufficient permissions"
3. **Invalid Password**: Return 401 with message "Current password is incorrect"
4. **Admin Deletion Attempt**: Return 403 with message "Cannot delete admin account"
5. **Missing Required Fields**: Return 400 with message "Required fields missing"

## Testing Strategy

### Unit Testing
- Test individual functions for profile updates, password changes, and validation
- Test role-based access control logic
- Test email uniqueness validation
- Test password hashing and comparison

### Property-Based Testing
- **Property 1 (Admin Protection)**: Generate random users with admin role and verify deletion/edit attempts fail
- **Property 2 (Email Uniqueness)**: Generate duplicate emails and verify rejection
- **Property 3 (Default Password)**: Generate new users and verify password equals email
- **Property 4 (Email Immutability)**: Generate profile update requests with email changes and verify rejection
- **Property 5 (Password Change Logout)**: Verify logout occurs after password change
- **Property 6 (RBAC)**: Generate non-admin users and verify team management functions are blocked
- **Property 7 (Member Self-Edit)**: Generate profile updates and verify allowed fields are editable
- **Property 8 (Roster Visibility)**: Generate team rosters and verify all members are visible to all users
- **Property 9 (Sorting)**: Generate unsorted rosters and verify sorting produces consistent results

### Testing Framework
- **Unit Tests**: Jest with React Testing Library
- **Property-Based Tests**: fast-check (JavaScript)
- **Minimum Iterations**: 100 per property-based test

### Test Coverage Goals
- All API endpoints tested
- All error scenarios covered
- All role-based access control paths tested
- All form validations tested

