# Components Documentation

This document provides detailed information about the key components that make up the Stanford Prison Experiment simulation.

## Core Components

### Timeline Display
The `TimelineDisplay` component shows the progression of the experiment:
- Current day and time
- Visual progress bar showing experiment completion
- Day/night cycle indicators
- Time-based event triggers

### Interaction Feed
The `InteractionFeed` component displays real-time interactions:
- Chronological message display
- Role-based message formatting
- Message grouping by time periods
- Automatic scrolling with new messages
- Load more functionality for historical messages

### Prison Map
The `PrisonMap` component visualizes the facility:
- Interactive layout visualization
- Cell locations and assignments
- Guard stations and patrol routes
- Common areas and restricted zones
- Real-time participant locations

## Monitoring Components

### Stress Indicator
The `StressIndicator` component tracks psychological state:
- Real-time stress level display
- Color-coded severity indicators
- Historical stress patterns
- Individual and group stress metrics

### Incident Log
The `IncidentLog` component records events:
- Categorized incident types:
  - Behavioral changes
  - Conflicts
  - Resistance events
  - Compliance records
- Severity classification
- Timestamp tracking
- Incident descriptions
- Visual status indicators

### Relationship Map
The `RelationshipMap` component shows social dynamics:
- Interactive network visualization
- Relationship types:
  - Authority
  - Conflict
  - Alliance
  - Observation
  - Collaboration
  - Tension
- Filtering options by:
  - Staff relationships
  - Guard shifts
  - Cell groups
  - Individual connections

## Analysis Components

### Data Charts
The `DataCharts` component provides analytics:
- Stress level trends
- Incident frequency
- Behavioral patterns
- Time-based analysis
- Interactive data exploration

### Analytics Dashboard
The `Analytics` component offers insights:
- Total interaction counts
- Pattern frequencies
- Stress analysis by role
- Behavioral trend identification
- Key event highlights