# Implementation Plan: Analytics Dashboard

- [ ] 1. Set up backend analytics controller and routes
  - Create analyticsController.js with endpoint handlers
  - Implement GET /api/analytics endpoint with date range and groupBy parameters
  - Implement GET /api/analytics/missed endpoint for drilldown
  - Implement GET /api/analytics/reply-distribution endpoint
  - Add proper error handling and validation
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ]* 1.1 Write property tests for analytics calculations
  - **Property 1: Missed Chat Consistency**
  - **Validates: Requirements 1.1**

- [ ]* 1.2 Write property tests for reply time bounds
  - **Property 2: Reply Time Bounds**
  - **Validates: Requirements 2.1**

- [ ]* 1.3 Write property tests for resolved percentage
  - **Property 3: Resolved Percentage Range**
  - **Validates: Requirements 3.1**

- [ ]* 1.4 Write property tests for total chats accuracy
  - **Property 4: Total Chats Accuracy**
  - **Validates: Requirements 4.1**

- [ ] 2. Implement Analytics component structure
  - Create Analytics.jsx component with state management
  - Implement time window selection state
  - Add loading and error state management
  - Implement data fetching with useEffect
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 3. Implement Missed Chats line chart
  - Install and configure Chart.js or Recharts
  - Create chart component with spline/curved line
  - Implement green line styling (#00D907)
  - Add white data points with dark borders
  - Implement hover tooltip with week label and count
  - Add vertical dotted guide line on hover
  - Implement click handler for drilldown
  - Add keyboard accessibility (focus, Enter key)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3_

- [ ]* 3.1 Write property test for chart data consistency
  - **Property 5: Time Window Consistency**
  - **Validates: Requirements 5.3**

- [ ] 4. Implement Average Reply Time metric block
  - Create metric block component
  - Format reply time as human-readable (mins/secs)
  - Display in large green text (#00D907)
  - Add hover tooltip explaining calculation
  - Handle zero case (display "0 secs")
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Implement Resolved Tickets donut chart
  - Create donut chart component
  - Display percentage in center
  - Use green (#00D907) for filled portion
  - Use light grey (#F7F7F8) for background ring
  - Add hover tooltip with absolute numbers
  - Implement click handler for filtered list
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Implement Total Chats metric block
  - Create metric block component
  - Display large green number (#00D907)
  - Add descriptive text
  - Implement click handler to open chat list
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Implement time window selector
  - Create dropdown/menu component
  - Add options: Last 10 weeks, Last 4 weeks, Last 6 months, Custom range
  - Implement date picker for custom range
  - Trigger analytics refresh on selection
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implement loading and error states
  - Create skeleton loader components
  - Display skeleton during data fetch
  - Show error message with retry button on failure
  - Display "No data" message when appropriate
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Implement accessibility features
  - Add keyboard navigation support
  - Make chart points focusable
  - Add aria-labels to interactive elements
  - Implement screen reader data table fallback
  - Test with keyboard navigation
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 10. Style Analytics component
  - Create Analytics.module.css with all styling
  - Implement color palette (#00D907, #184E7F, #F7F7F8, etc.)
  - Add responsive design for different viewports
  - Implement proper spacing and typography
  - Add subtle shadows and rounded corners
  - _Requirements: All_

- [ ] 11. Implement drilldown functionality
  - Create missed chats drilldown modal/drawer
  - Fetch and display tickets missed in selected week
  - Create reply distribution modal
  - Implement filtered ticket list view
  - _Requirements: 1.3, 3.4, 4.3_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 12.1 Write unit tests for analytics calculations
  - Test date range calculations
  - Test metric formatting functions
  - Test error handling
  - _Requirements: All_

- [ ]* 12.2 Write unit tests for Analytics component
  - Test component rendering
  - Test state management
  - Test data fetching
  - Test time window selection
  - _Requirements: All_

- [ ] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
