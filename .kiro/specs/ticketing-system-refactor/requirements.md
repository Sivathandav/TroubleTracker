# Ticketing System Refactor - Requirements Document

## Introduction

This document outlines the requirements for refactoring the Hubly CRM application into a comprehensive ticketing/chat support system with specific role-based access controls and workflow requirements.

## Glossary

- **System**: The Hubly Ticketing/Chat Support Platform
- **Admin**: Single administrator with full system access
- **Team Member**: Support staff who handle assigned tickets
- **External User**: Visitors who raise queries via chat widget
- **Ticket**: A customer support query/conversation thread
- **Chat Widget**: Floating interface for external users to submit queries
- **Missed Chat**: Ticket with no reply within configurable threshold (default: X minutes)

## Requirements

### Requirement 1: User Role Management

**User Story:** As a system administrator, I want distinct user roles with specific permissions, so that access control is properly enforced.

#### Acceptance Criteria

1. THE System SHALL support exactly three user roles: Admin, Team Member, and External User
2. THE System SHALL allow only one Admin account to exist
3. WHEN a Team Member attempts admin functions, THE System SHALL deny access
4. THE System SHALL NOT require External Users to create accounts
5. THE System SHALL allow Admin to create Team Member accounts with default password equal to email address

### Requirement 2: Landing Page with Chat Widget

**User Story:** As an External User, I want to access a landing page with a floating chat widget, so that I can submit support queries without registration.

#### Acceptance Criteria

1. THE System SHALL display a landing page with hero section built using HTML/CSS
2. THE System SHALL provide Login and Sign Up buttons for Admin/Team Members only
3. THE System SHALL display a floating chat widget in bottom-right corner on all public pages
4. WHEN the chat widget is closed, THE System SHALL show a chat icon with optional toast popup
5. WHEN External User clicks chat icon, THE System SHALL change icon to 'X' and open chat box
6. THE System SHALL display welcome message and form requesting Name, Email, and Phone
7. WHEN External User submits contact form, THE System SHALL create a new ticket
8. THE System SHALL include non-functional placeholder links for Terms of Use and Privacy Policy

### Requirement 3: Authentication System

**User Story:** As an Admin or Team Member, I want to securely log in to the system, so that I can access my dashboard and assigned tickets.

#### Acceptance Criteria

1. THE System SHALL provide login page accessible only to Admin and Team Members
2. THE System SHALL validate email format during login
3. THE System SHALL require passwords with minimum 6 characters including uppercase and lowercase
4. WHEN login credentials are invalid, THE System SHALL display concise error message
5. THE System SHALL use JWT or session-based authentication
6. THE System SHALL redirect authenticated users to Dashboard
7. THE System SHALL allow Admin to register new Team Members via Sign Up page
8. THE System SHALL NOT allow External Users to access Sign Up page

### Requirement 4: Dashboard with Ticket Management

**User Story:** As an Admin or Team Member, I want to view and manage tickets from a central dashboard, so that I can efficiently handle customer queries.

#### Acceptance Criteria

1. THE System SHALL display sidebar navigation with: Dashboard, Chat Center, Analytics, Chatbot Customization, Teams, Profile/Settings
2. THE System SHALL provide ticket search bar accepting Ticket ID
3. THE System SHALL display scrollable list of tickets with overflow-y scroll (not pagination)
4. THE System SHALL show ticket status, assigned team member, user info, and last message for each ticket
5. WHEN ticket is resolved, THE System SHALL display resolution time and ticket details
6. WHEN ticket is unresolved, THE System SHALL display last message and user details
7. THE System SHALL allow searching across all, resolved, or unresolved tickets

### Requirement 5: Ticket Assignment Workflow

**User Story:** As an Admin, I want to assign incoming tickets to team members, so that workload is distributed and queries are handled efficiently.

#### Acceptance Criteria

1. WHEN new ticket is created, THE System SHALL assign it to Admin's queue by default
2. THE System SHALL allow Admin to assign or reassign tickets to Team Members
3. WHEN Admin attempts to reassign ticket, THE System SHALL display confirmation popup with Cancel option
4. WHEN ticket is assigned to Team Member, THE System SHALL terminate Admin's chat access
5. THE System SHALL allow Admin to view assignment details but not chat contents after assignment
6. THE System SHALL allow only assigned Team Member to reply to ticket
7. THE System SHALL prevent unassigned Team Members from accessing ticket chat

### Requirement 6: Chat Center

**User Story:** As a Team Member, I want to view and respond to my assigned tickets, so that I can provide customer support.

#### Acceptance Criteria

1. THE System SHALL display list of active tickets grouped by status (unresolved/resolved)
2. THE System SHALL allow Team Members to view only their assigned tickets
3. THE System SHALL allow Admin to view all tickets and assignment details
4. WHEN Team Member opens assigned ticket, THE System SHALL fetch latest messages from backend
5. THE System SHALL update chat messages via polling/fetch (not real-time sockets)
6. THE System SHALL allow only ticket owner (assigned team member) to send replies
7. THE System SHALL display user contact information and ticket history

### Requirement 7: Analytics Dashboard

**User Story:** As an Admin, I want to view analytics and metrics, so that I can monitor team performance and identify issues.

#### Acceptance Criteria

1. THE System SHALL display chart showing missed chat count by week for last 10 weeks
2. THE System SHALL calculate and display average reply time across all tickets
3. THE System SHALL display resolution percentage (resolved tickets / total tickets)
4. THE System SHALL define missed chat as ticket with no reply within configurable threshold
5. THE System SHALL store missed chat threshold in settings (default: X minutes)
6. THE System SHALL use external chart library (Chart.js or Recharts) for visualizations
7. THE System SHALL compute analytics dynamically from ticket data

### Requirement 8: Chatbot Customization

**User Story:** As an Admin, I want to customize the chat widget appearance, so that it matches our brand identity.

#### Acceptance Criteria

1. THE System SHALL provide color pickers for header, input, and background colors
2. THE System SHALL display live preview of chat widget with selected colors
3. THE System SHALL allow Admin to customize welcome messages
4. THE System SHALL save customization settings to database
5. THE System SHALL apply customization to all chat widgets immediately after save

### Requirement 9: Team Management

**User Story:** As an Admin, I want to manage team members, so that I can control who has access to the system.

#### Acceptance Criteria

1. THE System SHALL provide Admin-only Teams page
2. THE System SHALL allow Admin to add team members with fields: name, email, role='member'
3. THE System SHALL set default password equal to email address for new team members
4. THE System SHALL allow Admin to delete team members
5. THE System SHALL prevent deletion or editing of Admin account
6. THE System SHALL allow Team Members to self-edit profile (name, password only)
7. WHEN user changes password, THE System SHALL log them out and redirect to login page
8. THE System SHALL prevent Team Members from accessing team management functions

### Requirement 10: Backend API Structure

**User Story:** As a developer, I want well-defined API endpoints, so that frontend and backend communicate efficiently.

#### Acceptance Criteria

1. THE System SHALL provide POST /auth/login endpoint for authentication
2. THE System SHALL provide POST /auth/register endpoint for Admin to create Team Members
3. THE System SHALL provide POST /tickets/create endpoint for External Users to submit queries
4. THE System SHALL provide GET /tickets/:id endpoint to retrieve ticket details
5. THE System SHALL provide PUT /tickets/:id/assign endpoint for Admin to assign tickets
6. THE System SHALL provide POST /tickets/:id/messages endpoint to add replies
7. THE System SHALL provide PUT /tickets/:id/resolve endpoint to mark tickets as resolved
8. THE System SHALL provide GET /users/team endpoint for Admin to manage team members
9. THE System SHALL provide PUT /profile/edit endpoint for users to update their profile
10. THE System SHALL provide GET /analytics endpoint to retrieve statistics
11. THE System SHALL provide GET/PUT /customization endpoint to manage chat widget appearance

### Requirement 11: Data Models

**User Story:** As a developer, I want consistent data models, so that data integrity is maintained.

#### Acceptance Criteria

1. THE System SHALL implement User schema with: id, name, email, passwordHash, role, phone
2. THE System SHALL implement Ticket schema with: ticketId, userContactInfo, assignedTo, status, createdAt, resolvedAt, messages[]
3. THE System SHALL implement Message schema with: sender, body, timestamp
4. THE System SHALL implement Customization schema with: headerColor, backgroundColor, inputColor, welcomeMessages
5. THE System SHALL compute Analytics data dynamically (not stored as separate schema)

### Requirement 12: No Real-Time Implementation

**User Story:** As a developer, I want to avoid WebSocket complexity, so that the system remains simple and maintainable.

#### Acceptance Criteria

1. THE System SHALL NOT use socket.io or WebSocket connections
2. THE System SHALL update chat messages via HTTP fetch requests
3. WHEN Team Member opens ticket, THE System SHALL fetch latest messages from backend
4. THE System SHALL refresh message list on component reload or periodic refresh
5. THE System SHALL NOT provide real-time message notifications

### Requirement 13: Deployment Requirements

**User Story:** As a developer, I want clear deployment guidelines, so that the application can be hosted reliably.

#### Acceptance Criteria

1. THE System SHALL deploy React frontend on Vercel or equivalent SPA host
2. THE System SHALL deploy Express backend on Render (not Vercel)
3. THE System SHALL NOT mix frontend and backend deployment on same platform
4. THE System SHALL include README with admin credentials and deployed links
5. THE System SHALL use MongoDB Atlas for database hosting
6. THE System SHALL use environment variables for sensitive configuration

### Requirement 14: Code Quality Standards

**User Story:** As a developer, I want consistent code standards, so that the codebase is maintainable.

#### Acceptance Criteria

1. THE System SHALL use CSS Modules or raw CSS (NO Tailwind CSS)
2. THE System SHALL build UI elements with HTML/CSS (not image exports)
3. THE System SHALL use GitHub for version control
4. THE System SHALL include comprehensive README documentation
5. THE System SHALL implement only specified validations (no over-engineering)
6. THE System SHALL handle edge cases simply without complex logic
