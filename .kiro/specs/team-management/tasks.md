# Implementation Plan: Team Management

- [x] 1. Update User Model with Additional Fields
  - Add `firstName`, `lastName`, `phone`, and `designation` fields to the User schema
  - Ensure backward compatibility with existing user records
  - Update validation rules for new fields
  - _Requirements: 3.1, 3.2_

- [ ]* 1.1 Write property test for User model fields
  - **Property 4: Email Immutability**
  - **Validates: Requirements 3.2**

- [ ] 2. Implement Backend API Endpoints for Team Management
  - Create POST `/users/team` endpoint to add new team members with email as default password
  - Create PUT `/users/team/:id` endpoint to edit team member details (name, phone, designation)
  - Create DELETE `/users/team/:id` endpoint to delete team members with admin protection
  - Create GET `/users/team` endpoint to fetch all team members
  - Implement role-based access control middleware for all endpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 4.1, 4.2, 4.3, 4.4_

- [ ]* 2.1 Write property test for email uniqueness
  - **Property 2: Email Uniqueness**
  - **Validates: Requirements 1.3**

- [ ]* 2.2 Write property test for default password assignment
  - **Property 3: Default Password Assignment**
  - **Validates: Requirements 1.2**

- [ ]* 2.3 Write property test for admin account protection
  - **Property 1: Admin Account Protection**
  - **Validates: Requirements 1.5, 1.7**

- [ ]* 2.4 Write property test for role-based access control
  - **Property 6: Role-Based Access Control**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 3. Update Profile Management Endpoints
  - Modify PUT `/users/profile` endpoint to accept firstName, lastName, phone, and designation
  - Prevent email modification in profile updates
  - Ensure password changes trigger logout and redirect to login
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for email immutability in profile updates
  - **Property 4: Email Immutability**
  - **Validates: Requirements 3.2**

- [ ]* 3.2 Write property test for password change logout
  - **Property 5: Password Change Logout**
  - **Validates: Requirements 3.4, 3.5**

- [ ]* 3.3 Write property test for member self-edit
  - **Property 7: Member Self-Edit**
  - **Validates: Requirements 3.1**

- [x] 4. Enhance Teams Component for Admin View
  - Update Teams component to display team members with name, email, role, and designation
  - Implement add member modal with form validation
  - Implement edit member functionality with form pre-population
  - Implement delete confirmation dialog
  - Add search functionality to filter team members
  - Add sorting by name and email
  - Enforce admin-only access with redirect for non-admins
  - _Requirements: 1.1, 1.4, 1.6, 2.4, 2.5_

- [ ] 4.1 Write property test for team roster sorting
  - **Property 9: Sorting Consistency**
  - **Validates: Requirements 2.4, 2.5**

- [x] 5. Create Member View for Team Roster
  - Create read-only team roster view for non-admin members
  - Display all team members with name, email, role, and designation
  - Implement sorting by name and email
  - Hide add, edit, and delete options for non-admin users
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 5.1 Write property test for team roster visibility
  - **Property 8: Team Roster Visibility**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 6. Update Settings Component for Profile Management
  - Add firstName, lastName, phone, and designation fields to profile form
  - Implement field validation and error handling
  - Prevent email modification with disabled input and explanatory text
  - Ensure password change triggers logout and redirect
  - Display success message after profile updates
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Implement Error Handling and Validation
  - Add client-side form validation for all inputs
  - Implement error messages for duplicate emails
  - Add error handling for unauthorized access attempts
  - Display confirmation dialogs for destructive actions
  - Handle network errors gracefully
  - _Requirements: 1.3, 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8.1 Write unit tests for team management API endpoints
  - Test add member with valid and invalid data
  - Test edit member with valid and invalid data
  - Test delete member with admin protection
  - Test role-based access control
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 4.1, 4.2, 4.3, 4.4_

- [ ]* 8.2 Write unit tests for profile management
  - Test profile update with valid and invalid data
  - Test email immutability
  - Test password change with logout
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 8.3 Write unit tests for Teams component
  - Test add member modal functionality
  - Test edit member functionality
  - Test delete confirmation dialog
  - Test search and sorting functionality
  - _Requirements: 1.1, 1.4, 1.6, 2.4, 2.5_

- [ ]* 8.4 Write unit tests for Settings component
  - Test profile form rendering
  - Test field validation
  - Test email immutability
  - Test password change flow
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

