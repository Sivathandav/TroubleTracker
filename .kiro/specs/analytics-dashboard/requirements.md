# Requirements Document: Analytics Dashboard

## Introduction

The Analytics Dashboard provides team leads and administrators with an at-a-glance view of support performance metrics. It displays key SLA indicators including missed chats trends, average reply time, resolved ticket percentage, and total chat volume to help identify operational issues and monitor team responsiveness.

## Glossary

- **Missed Chat**: A user message that receives no agent reply within the configured threshold (default 5 minutes)
- **Average Reply Time**: Mean time between user message and agent response across all tickets
- **Resolved Tickets**: Percentage of tickets marked as resolved out of total tickets
- **Total Chats**: Total number of chat sessions/tickets for the selected period
- **SLA**: Service Level Agreement - performance standards for response time and resolution
- **Threshold**: Configurable time limit (in minutes) for determining missed chats

## Requirements

### Requirement 1: Missed Chats Trend Chart

**User Story:** As a team lead, I want to see a trend of missed chats over the past 10 weeks, so that I can identify patterns in response failures.

#### Acceptance Criteria

1. WHEN the analytics page loads THEN the system SHALL display a line chart showing missed chats for the past 10 weeks
2. WHEN hovering over a data point THEN the system SHALL display a tooltip with the week label and missed chat count
3. WHEN clicking a data point THEN the system SHALL open a drilldown showing tickets missed that week
4. WHEN the chart is displayed THEN the system SHALL use a smooth curved line with green color (#00D907)
5. WHEN the page is resized THEN the system SHALL responsively adjust chart dimensions

### Requirement 2: Average Reply Time Metric

**User Story:** As an admin, I want to see the average reply time, so that I can monitor team responsiveness.

#### Acceptance Criteria

1. WHEN the analytics page loads THEN the system SHALL display average reply time formatted as human-readable time (e.g., "5 mins 30 secs")
2. WHEN hovering over the metric THEN the system SHALL show a tooltip explaining the calculation method
3. WHEN the metric is zero THEN the system SHALL display "0 secs"
4. WHEN clicking the metric THEN the system SHALL optionally open a distribution modal

### Requirement 3: Resolved Tickets Percentage

**User Story:** As a team lead, I want to see the percentage of resolved tickets, so that I can track resolution performance.

#### Acceptance Criteria

1. WHEN the analytics page loads THEN the system SHALL display a donut chart showing resolved ticket percentage
2. WHEN the donut is displayed THEN the system SHALL show the percentage value in the center
3. WHEN hovering over the donut THEN the system SHALL display absolute numbers (resolved/total)
4. WHEN clicking the donut THEN the system SHALL optionally open a filtered ticket list

### Requirement 4: Total Chats Metric

**User Story:** As an admin, I want to see total chat volume, so that I can understand workload trends.

#### Acceptance Criteria

1. WHEN the analytics page loads THEN the system SHALL display total chat count for the selected period
2. WHEN the metric is displayed THEN the system SHALL show the number in large green text (#00D907)
3. WHEN clicking the metric THEN the system SHALL open the complete chat/ticket list filtered to the period

### Requirement 5: Time Window Selection

**User Story:** As a user, I want to select different time windows, so that I can analyze different periods.

#### Acceptance Criteria

1. WHEN the analytics page loads THEN the system SHALL default to the last 10 weeks
2. WHEN clicking the time window selector THEN the system SHALL display options (10 weeks, 4 weeks, 6 months, custom range)
3. WHEN selecting a time window THEN the system SHALL refresh all metrics for that period
4. WHEN a custom range is selected THEN the system SHALL allow date picker input

### Requirement 6: Data Loading and Error Handling

**User Story:** As a user, I want clear feedback during data loading, so that I understand the page state.

#### Acceptance Criteria

1. WHEN the page is loading THEN the system SHALL display skeleton loaders for all metrics
2. WHEN data fails to load THEN the system SHALL display an error message with a retry button
3. WHEN no data exists for a period THEN the system SHALL display "No data for selected period"
4. WHEN data loads successfully THEN the system SHALL display all metrics with smooth transitions

### Requirement 7: Accessibility

**User Story:** As a user with accessibility needs, I want keyboard navigation and screen reader support, so that I can use the analytics page.

#### Acceptance Criteria

1. WHEN using keyboard navigation THEN the system SHALL allow tabbing through all interactive elements
2. WHEN a data point is focused THEN the system SHALL display the tooltip
3. WHEN Enter is pressed on a focused point THEN the system SHALL trigger the drilldown
4. WHEN the page is read by a screen reader THEN the system SHALL provide a data table fallback
