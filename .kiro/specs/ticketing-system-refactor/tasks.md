# Ticketing System Refactor - Implementation Tasks

## Phase 1: Backend Foundation (Priority: Critical)

- [x] 1. Update Database Models
  - [x] 1.1 Modify User model to include role field (admin/member)
  - [x] 1.2 Create Ticket model with all required fields
  - [x] 1.3 Create Customization model for chat widget settings
  - [x] 1.4 Add indexes for performance (ticketId, assignedTo, status)
  - _Requirements: 10, 11_

- [x] 2. Implement Authentication Updates
  - [x] 2.1 Add role-based JWT payload
  - [x] 2.2 Create middleware for admin-only routes
  - [x] 2.3 Create middleware for team member routes
  - [x] 2.4 Update login endpoint to return user role
  - [x] 2.5 Modify register endpoint to be admin-only
  - _Requirements: 3, 10_

- [x] 3. Create Ticket Management APIs
  - [x] 3.1 POST /api/tickets/create - External user ticket creation
  - [x] 3.2 GET /api/tickets - Fetch tickets with filters (status, assignedTo)
  - [x] 3.3 GET /api/tickets/:id - Get single ticket details
  - [x] 3.4 PUT /api/tickets/:id/assign - Admin assigns ticket to team member
  - [x] 3.5 POST /api/tickets/:id/messages - Add message to ticket
  - [x] 3.6 PUT /api/tickets/:id/resolve - Mark ticket as resolved
  - [x] 3.7 GET /api/tickets/search - Search tickets by ticketId
  - _Requirements: 4, 5, 6, 10_

- [x] 4. Create Team Management APIs
  - [x] 4.1 GET /api/users/team - Get all team members (admin only)
  - [x] 4.2 POST /api/users/team - Add team member with email as password
  - [x] 4.3 DELETE /api/users/team/:id - Delete team member (prevent admin deletion)
  - [x] 4.4 PUT /api/users/profile - Update own profile
  - [x] 4.5 PUT /api/users/password - Change password (triggers logout)
  - _Requirements: 9, 10_

- [x] 5. Create Analytics APIs
  - [x] 5.1 GET /api/analytics/missed-chats - Calculate missed chats by week (last 10 weeks)
  - [x] 5.2 GET /api/analytics/avg-reply-time - Calculate average reply time
  - [x] 5.3 GET /api/analytics/resolution-rate - Calculate resolution percentage
  - [x] 5.4 GET /api/analytics/dashboard - Return all analytics data
  - [x] 5.5 Implement missed chat calculation logic (no reply within threshold)
  - _Requirements: 7, 10_

- [x] 6. Create Customization APIs
  - [x] 6.1 GET /api/customization - Get chat widget customization settings
  - [x] 6.2 PUT /api/customization - Update customization (admin only)
  - [x] 6.3 Initialize default customization on first run
  - _Requirements: 8, 10_

## Phase 2: Floating Chat Widget (Priority: Critical)

- [x] 7. Create FloatingChatWidget Component
  - [x] 7.1 Create component structure with open/closed states
  - [x] 7.2 Implement floating icon in bottom-right corner
  - [x] 7.3 Add icon toggle (chat icon ↔ X icon)
  - [x] 7.4 Create optional toast popup for closed state
  - [ ] 7.5 Style widget with CSS modules (no Tailwind)
  - _Requirements: 2_

- [ ] 7.6 Implement Contact Form Step
  - [ ] 7.6.1 Create form with Name, Email, Phone fields
  - [ ] 7.6.2 Add form validation (email format, required fields)
  - [ ] 7.6.3 Display welcome message from customization
  - [ ] 7.6.4 Handle form submission → create ticket
  - [ ] 7.6.5 Transition to chat interface after submission
  - _Requirements: 2_

- [ ] 7.7 Implement Chat Interface
  - [ ] 7.7.1 Display message history
  - [ ] 7.7.2 Create message input field
  - [ ] 7.7.3 Implement send message functionality
  - [ ] 7.7.4 Add polling mechanism (fetch messages every 5 seconds)
  - [ ] 7.7.5 Stop polling when widget is closed
  - [ ] 7.7.6 Apply customization colors (header, background, input)
  - _Requirements: 2, 12_

- [ ] 7.8 Integrate Widget with Landing Page
  - [ ] 7.8.1 Add widget to Landing component
  - [ ] 7.8.2 Fetch customization settings on mount
  - [ ] 7.8.3 Ensure widget persists across page navigation
  - [ ] 7.8.4 Test widget on all public pages
  - _Requirements: 2_

## Phase 3: Landing Page Updates (Priority: High)

- [ ] 8. Refactor Landing Page
  - [ ] 8.1 Remove external user signup functionality
  - [ ] 8.2 Update hero section with HTML/CSS (no image exports)
  - [ ] 8.3 Ensure Login button routes to /login
  - [ ] 8.4 Ensure Sign Up button routes to /signup (admin/team only)
  - [ ] 8.5 Add placeholder links for Terms of Use and Privacy Policy
  - [ ] 8.6 Integrate FloatingChatWidget component
  - _Requirements: 2_

## Phase 4: Authentication Flow Updates (Priority: High)

- [x] 9. Update Login Component
  - [x] 9.1 Add email format validation
  - [x] 9.2 Add password validation (min 6 chars, uppercase, lowercase)
  - [x] 9.3 Display concise error messages
  - [x] 9.4 Store user role in auth context
  - [x] 9.5 Redirect to dashboard after successful login
  - _Requirements: 3_

- [x] 10. Update Signup Component
  - [x] 10.1 Restrict access to admin-only (check role in backend)
  - [x] 10.2 Add validation for email and password
  - [x] 10.3 Remove external user registration flow
  - [x] 10.4 Update UI to reflect team member registration
  - _Requirements: 3_

## Phase 5: Dashboard Refactor (Priority: High)

- [x] 11. Refactor Dashboard Component
  - [x] 11.1 Update sidebar navigation (remove unnecessary items)
  - [x] 11.2 Create ticket search bar (search by ticketId)
  - [x] 11.3 Implement scrollable ticket list (overflow-y, no pagination)
  - [x] 11.4 Display ticket cards with: status, assigned member, user info, last message
  - [x] 11.5 Show resolution time for resolved tickets
  - [x] 11.6 Show last message and user details for unresolved tickets
  - [x] 11.7 Add filter options (all/resolved/unresolved)
  - [x] 11.8 Implement ticket search functionality
  - _Requirements: 4_

## Phase 6: Chat Center Refactor (Priority: Critical)

- [x] 12. Refactor Chat Center Component
  - [x] 12.1 Create separate views for Admin and Team Members
  - [x] 12.2 Implement ticket list grouped by status
  - [x] 12.3 Add role-based ticket filtering (admin sees all, members see assigned)
  - _Requirements: 6_

- [x] 12.4 Implement Ticket Assignment Workflow
  - [x] 12.4.1 Add "Assign" button for admin on unassigned tickets
  - [x] 12.4.2 Create assignment confirmation modal with team member dropdown
  - [x] 12.4.3 Add Cancel button in confirmation modal
  - [x] 12.4.4 Call assign API on confirmation
  - [x] 12.4.5 Terminate admin's chat access after assignment
  - [x] 12.4.6 Show assignment details only (no chat content) for admin
  - [x] 12.4.7 Grant chat access to assigned team member
  - _Requirements: 5, 6_

- [x] 12.5 Implement Chat Interface
  - [x] 12.5.1 Display message history for assigned tickets
  - [x] 12.5.2 Implement fetch-based message updates (poll every 5 seconds)
  - [x] 12.5.3 Add message input and send button
  - [x] 12.5.4 Restrict reply to ticket owner only
  - [x] 12.5.5 Add "Mark as Resolved" button
  - [x] 12.5.6 Display user contact information
  - [x] 12.5.7 Show ticket creation and resolution timestamps
  - _Requirements: 6, 12_

## Phase 7: Analytics Enhancement (Priority: Medium)

- [x] 13. Enhance Analytics Component
  - [x] 13.1 Remove unnecessary metrics and charts
  - [x] 13.2 Implement missed chats by week chart (last 10 weeks)
  - [x] 13.3 Use Chart.js or Recharts for visualization
  - [x] 13.4 Display average reply time metric
  - [x] 13.5 Display resolution percentage metric
  - [x] 13.6 Fetch analytics data from backend API
  - [x] 13.7 Add loading states and error handling
  - _Requirements: 7_

## Phase 8: Chatbot Customization (Priority: Medium)

- [x] 14. Create Chatbot Customization Component
  - [x] 14.1 Create color picker inputs for header, background, input
  - [x] 14.2 Create text input for welcome message
  - [x] 14.3 Create text input for greeting message
  - [x] 14.4 Implement live preview of chat widget
  - [x] 14.5 Add Save and Reset buttons
  - [x] 14.6 Fetch current customization on mount
  - [x] 14.7 Update customization via API on save
  - [x] 14.8 Restrict access to admin only
  - _Requirements: 8_

## Phase 9: Teams Management Refactor (Priority: High)

- [x] 15. Refactor Teams Component
  - [x] 15.1 Restrict entire page to admin only
  - [x] 15.2 Update add team member form (name, email, auto-password)
  - [x] 15.3 Display default password = email address message
  - [x] 15.4 Remove edit functionality for other users
  - [x] 15.5 Prevent admin deletion (hide delete button for admin)
  - [x] 15.6 Prevent admin editing by others
  - [x] 15.7 Update delete confirmation modal
  - _Requirements: 9_

- [x] 16. Implement Self-Edit Profile
  - [x] 16.1 Create profile edit page for all users
  - [x] 16.2 Allow editing name and password only
  - [x] 16.3 Prevent editing email and role
  - [x] 16.4 Implement password change with logout
  - [x] 16.5 Redirect to login after password change
  - _Requirements: 9_

## Phase 10: Settings/Profile Updates (Priority: Medium)

- [x] 17. Update Settings Component
  - [x] 17.1 Remove team management from settings (move to Teams page)
  - [x] 17.2 Keep profile edit (name, password)
  - [x] 17.3 Add notification preferences
  - [x] 17.4 Implement password change with logout flow
  - _Requirements: 9_

## Phase 11: Testing & Quality Assurance (Priority: High)

- [ ] 18. Backend Testing
  - [ ] 18.1 Test all API endpoints with Postman/Insomnia
  - [ ] 18.2 Test role-based access control
  - [ ] 18.3 Test ticket assignment workflow
  - [ ] 18.4 Test analytics calculations
  - [ ] 18.5 Test customization updates

- [ ] 19. Frontend Testing
  - [ ] 19.1 Test floating chat widget (open/close, form, messages)
  - [ ] 19.2 Test authentication flow (login, signup, logout)
  - [ ] 19.3 Test dashboard (search, filters, ticket display)
  - [ ] 19.4 Test chat center (assignment, messaging, resolution)
  - [ ] 19.5 Test analytics page (charts, metrics)
  - [ ] 19.6 Test chatbot customization (color pickers, preview)
  - [ ] 19.7 Test teams management (add, delete, self-edit)

- [ ] 20. Integration Testing
  - [ ] 20.1 Test complete external user flow (widget → ticket → reply)
  - [ ] 20.2 Test admin workflow (assign → view details)
  - [ ] 20.3 Test team member workflow (receive → reply → resolve)
  - [ ] 20.4 Test password change logout flow
  - [ ] 20.5 Test missed chat calculation

## Phase 12: Deployment (Priority: Critical)

- [ ] 21. Backend Deployment to Render
  - [ ] 21.1 Create Render account and new web service
  - [ ] 21.2 Configure environment variables
  - [ ] 21.3 Set up MongoDB Atlas connection
  - [ ] 21.4 Deploy backend and test endpoints
  - [ ] 21.5 Configure CORS for frontend domain

- [ ] 22. Frontend Deployment to Vercel
  - [ ] 22.1 Create Vercel account and new project
  - [ ] 22.2 Configure environment variables (API URL)
  - [ ] 22.3 Deploy frontend
  - [ ] 22.4 Test all pages and functionality
  - [ ] 22.5 Verify chat widget works on deployed site

- [ ] 23. Documentation
  - [ ] 23.1 Create comprehensive README
  - [ ] 23.2 Include admin login credentials for testing
  - [ ] 23.3 Add deployed frontend URL
  - [ ] 23.4 Add deployed backend API URL
  - [ ] 23.5 Document API endpoints
  - [ ] 23.6 Add setup instructions for local development
  - [ ] 23.7 Include environment variable examples

- [ ] 24. Final Testing on Production
  - [ ] 24.1 Test external user flow on deployed site
  - [ ] 24.2 Test admin login and all admin functions
  - [ ] 24.3 Test team member login and assigned ticket access
  - [ ] 24.4 Verify analytics data accuracy
  - [ ] 24.5 Test chatbot customization changes reflect on widget
  - [ ] 24.6 Verify all role-based restrictions work

## Phase 13: Code Quality & Cleanup (Priority: Low)

- [ ] 25. Code Review and Refactoring
  - [ ] 25.1 Remove unused components and code
  - [ ] 25.2 Ensure all CSS is modules or raw CSS (no Tailwind)
  - [ ] 25.3 Verify no image exports for UI elements (HTML/CSS only)
  - [ ] 25.4 Check for consistent naming conventions
  - [ ] 25.5 Add code comments where necessary

- [ ] 26. Performance Optimization
  - [ ] 26.1 Optimize polling intervals
  - [ ] 26.2 Implement lazy loading for ticket lists
  - [ ] 26.3 Add caching for customization settings
  - [ ] 26.4 Optimize database queries with indexes

## Notes

- Tasks marked with * are optional and can be skipped if time is limited
- All tasks should be completed in order within each phase
- Each task should be tested before moving to the next
- Backend tasks (Phase 1) should be completed before frontend tasks
- Critical priority tasks must be completed for MVP
- Medium/Low priority tasks can be deferred to post-MVP releases
