# Product Requirements Document (PRD)

## Feature: Agentic AI Match-Day Itinerary Planner – Core Codebase

### 1. Problem Statement, Solution & User Needs

**Problem:**
Planning a matchday isn't just buying a ticket. You need to figure out how you're getting there, where you're eating beforehand, where you're staying if it's an away trip, what the weather's going to be like and how you get home afterwards. For a lot of supporters, especially families or first-timers, that's genuinely overwhelming. As a group of managers, we identified this as a real gap in the supporter experience. There was no centralised, intelligent tool helping fans navigate matchday planning. Everything was scattered: Google Maps here, a Facebook group there, word of mouth. As a team, we decided to focus our project on building an itinerary planning experience that works for every type of supporter.

**Solution:**
When a supporter lands on the app, the first thing they see is a short intake form. It's friendly and conversational. You tell the app where you're travelling from, when the match is, how many people are in your group, what kind of support you need such as transport, food, or accommodation and any accessibility requirements.

Once you submit that form, a chat screen appears. This is where the magic happens. The app processes your details in real time using Relevance AI, routing your request through our multi-agent system. You can watch as the agents work through your plan and a final personalised itinerary is generated and presented to you.

You'll see a step-by-step timeline: recommended departure times, travel routes, pub suggestions near the stadium, weather for matchday and local heritage about the area itself. Everything is tailored to that supporter's specific profile. A family with young kids gets a different plan to a group of mates coming in from London.

And once your itinerary is ready, you have full control over what you do with it. You can save the form for later, send the itinerary directly as an email, or download it as a calendar file straight to your mobile phone, so your entire matchday plan sits right there in your diary.

**User Needs:**

- Effortless, end-to-end itinerary planning for match days
- Personalisation based on origin, group size, budget, preferences and accessibility
- Reliable recommendations for transport, accommodation and activities
- Real-time, context-aware suggestions such as weather, community tips
- Ability to save, export and share itineraries

### 2. Feature Specifications & Scope

**Scope:**

- Multi-agent AI system for generating personalized itineraries
- Intake form for user trip details and preferences
- Modular UI with real-time feedback and itinerary rendering
- Support for multiple languages and accessibility
- Draft saving, export (email, download) and sharing features
- Community-driven tips and recommendations
- Extensible architecture for future agent types like weather, youth, business intelligence

**Out of Scope:**

- Payment processing
- Third-party booking integrations (beyond links)
- Non-sports travel scenarios

### 3. Success Metrics & Acceptance Criteria

**Success Metrics:**

- % of users who complete and export an itinerary
- User satisfaction (feedback, NPS)
- Reduction in planning time vs. manual methods
- Engagement with community tips and agent features

**Acceptance Criteria:**

- Users can submit trip details and receive a complete, personalised itinerary
- Itinerary includes transport, accommodation, activities and tips
- Users can save, export and share itineraries
- System supports multiple languages and accessibility needs
- Modular agents can be extended for new features

### 4. User Experience Requirements

- Simple, guided intake form with clear progress
- Responsive, accessible UI (WCAG 2.1 AA)
- Clear feedback during agent processing like loading, errors
- Intuitive itinerary presentation with actionable sections
- Easy access to save, export and share options
- Support for mobile and desktop devices

### 5. Technical Considerations (High-Level)

- Modular, component-based frontend (Preact, Signals)
- Multi-agent architecture for itinerary generation
- Internationalisation (i18n) and localisation support
- Secure, privacy-respecting data handling
- Extensible for new agent types and integrations
- Automated testing and CI/CD for reliability
