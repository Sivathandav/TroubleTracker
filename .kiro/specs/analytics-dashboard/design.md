# Design Document: Analytics Dashboard

## Overview

The Analytics Dashboard provides a comprehensive view of support team performance through key metrics and trends. It displays missed chats trends, average reply time, resolved ticket percentage, and total chat volume. The design emphasizes clarity with a clean layout, prominent green accent color (#00D907) for key metrics, and interactive charts for deeper insights.

## Architecture

The Analytics Dashboard follows a client-server architecture:

1. **Frontend (React)**: Displays metrics, charts, and interactive elements
2. **Backend (Node.js/Express)**: Calculates analytics from ticket data
3. **Database (MongoDB)**: Stores ticket and chat data

### Data Flow

```
User selects time window → Frontend requests /api/analytics → Backend calculates metrics → 
Frontend renders charts and metrics → User interacts with data points → Drilldown data fetched
```

## Components and Interfaces

### Frontend Components

#### 1. Analytics Page
- **Location**: `client/src/components/Analytics/Analytics.jsx`
- **Responsibilities**:
  - Fetch analytics data on mount and time window change
  - Render missed chats chart
  - Display metric blocks (reply time, resolved %, total chats)
  - Handle time window selection
  - Manage loading and error states

#### 2. Missed Chats Chart
- **Type**: Line chart (spline/curved)
- **Data**: Weekly missed chat counts
- **Interactions**: Hover tooltip, click drilldown, keyboard focus
- **Styling**: Green line (#00D907), white data points with dark borders

#### 3. Metric Blocks
- **Average Reply Time**: Formatted time display with tooltip
- **Resolved Tickets**: Donut chart with percentage overlay
- **Total Chats**: Large green number display

### Backend API Endpoints

#### Main Analytics Endpoint
```
GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=week
```

Response:
```json
{
  "period": { "from": "2025-10-01", "to": "2025-12-09" },
  "missedChatsByWeek": [
    { "weekLabel": "Week 1", "weekStart": "2025-10-01", "count": 13 },
    { "weekLabel": "Week 2", "weekStart": "2025-10-08", "count": 9 }
  ],
  "avgReplyTimeSeconds": 37,
  "resolvedPercent": 80.0,
  "totalChats": 122,
  "detailedStats": {
    "totalTickets": 150,
    "resolvedTickets": 120,
    "missedTickets": 18
  }
}
```

#### Drilldown Endpoints
- `GET /api/analytics/missed?weekStart=YYYY-MM-DD` - Missed tickets for week
- `GET /api/analytics/reply-distribution?from=...&to=...` - Reply time histogram

## Data Models

### Missed Chat Calculation
```
For each ticket:
  - Find first user message timestamp (t_user)
  - Find earliest agent message after t_user (t_agent)
  - If no t_agent OR (t_agent - t_user) > threshold → mark as missed
  - Aggregate by week
```

### Average Reply Time Calculation
```
avgReplyTime = sum(replyInterval_i for all i where agentReply exists) / N
where i iterates over user messages that received agent replies
```

### Resolved Percentage Calculation
```
resolvedPercent = (num_resolved_tickets / total_tickets) * 100
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Missed Chat Consistency
*For any* time period, the sum of missed chats across all weeks SHALL equal the total missed tickets for that period.
**Validates: Requirements 1.1**

### Property 2: Reply Time Bounds
*For any* set of reply intervals, the average reply time SHALL be greater than or equal to zero and less than or equal to the maximum interval.
**Validates: Requirements 2.1**

### Property 3: Resolved Percentage Range
*For any* ticket set, the resolved percentage SHALL be between 0 and 100 (inclusive).
**Validates: Requirements 3.1**

### Property 4: Total Chats Accuracy
*For any* time period, the total chats count SHALL match the count of unique tickets in that period.
**Validates: Requirements 4.1**

### Property 5: Time Window Consistency
*For any* time window change, all metrics SHALL be recalculated and updated consistently.
**Validates: Requirements 5.3**

## Error Handling

### Frontend Error Handling
- Display user-friendly error messages
- Show retry button on failed requests
- Display skeleton loaders during data fetch
- Handle empty data gracefully

### Backend Error Handling
- Return appropriate HTTP status codes
- Validate date range parameters
- Handle missing or invalid data
- Log errors for debugging

### Common Error Scenarios
1. **Invalid Date Range**: Return 400 with message "Invalid date range"
2. **No Data**: Return 200 with empty arrays
3. **Server Error**: Return 500 with message "Failed to load analytics"

## Testing Strategy

### Unit Testing
- Test date range calculations
- Test metric calculations (average, percentage, totals)
- Test data formatting functions
- Test error handling

### Property-Based Testing
- Property 1: Missed chat sum consistency
- Property 2: Reply time bounds validation
- Property 3: Resolved percentage range validation
- Property 4: Total chats accuracy
- Property 5: Time window consistency

### Testing Framework
- **Unit Tests**: Jest
- **Property-Based Tests**: fast-check
- **Minimum Iterations**: 100 per property test

## UI/UX Details

### Color Palette
- Primary Green: #00D907 (metrics, chart line)
- Accent Blue: #184E7F (navigation)
- Light Surface: #F7F7F8, #EAEAEA
- Text Grey: #6A6B70, #424242
- White: #FFFFFF
- Black: #000000 (tooltips)

### Chart Styling
- Line stroke: 2.5-4px, #00D907
- Data points: white fill, black stroke (1.5px)
- Grid lines: very light grey (#F7F7F8)
- Tooltip: black background, white text, rounded corners, subtle shadow

### Spacing
- Padding: 24px horizontal, 20px vertical for metric blocks
- Gap between sections: 32px
- Chart height: responsive, minimum 300px

### Typography
- Header: 28px, #6A6B70
- Metric labels: 12px, #6B7280
- Metric values: 24px, #00D907
- Tooltip: 12px, #FFFFFF
