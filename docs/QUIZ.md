# Quiz Catalog

This document contains the quiz definitions and templates for the gamification system. Each quiz is designed to be agent-specific and drive engagement and lead segmentation.

---

## 1. Heritage Agent Quiz

**ID:** `quiz_heritage_legends`

```json
{
  "title": "LTFC Legends Quiz",
  "difficulty": "medium",
  "pointsBase": 30,
  "pointsPerfectBonus": 10,
  "questions": {
    "q1": {
      "question": "In what year was LTFC established?",
      "type": "multiple-choice",
      "options": [
        { "label": "1885", "value": "1885", "isCorrect": true },
        { "label": "1875", "value": "1875" },
        { "label": "1895", "value": "1895" }
      ],
      "points": 10,
      "segmentationTag": "heritage_fan"
    },
    "q2": {
      "question": "How important is LTFC history to your fan identity?",
      "type": "multiple-choice",
      "options": [
        {
          "label": "Everything – I live for this!",
          "value": "devoted",
          "segmentationTag": "heritage_superfan"
        },
        {
          "label": "Very important",
          "value": "committed",
          "segmentationTag": "heritage_fan"
        },
        {
          "label": "Somewhat",
          "value": "casual",
          "segmentationTag": "casual_supporter"
        }
      ],
      "points": 20
    }
  }
}
```

---

## 2. Youth Agent Quiz

**ID:** `quiz_family_day_planner`

```json
{
  "title": "Family Match Day Planner",
  "difficulty": "easy",
  "pointsBase": 25,
  "pointsPerfectBonus": 5,
  "questions": {
    "q1": {
      "question": "What's the youngest child in your group?",
      "type": "multiple-choice",
      "options": [
        {
          "label": "Under 5",
          "value": "under5",
          "segmentationTag": "young_family"
        },
        {
          "label": "5-11",
          "value": "school",
          "segmentationTag": "school_age_family"
        },
        { "label": "12-18", "value": "teen", "segmentationTag": "teen_family" },
        { "label": "No kids", "value": "nochildren" }
      ],
      "points": 15,
      "segmentationTag": "family_supporter"
    },
    "q2": {
      "question": "Would youth coaching insights interest you?",
      "type": "true-false",
      "points": 10,
      "segmentationTag": "academy_interest"
    }
  }
}
```

---

## 3. Business Intelligence Agent Quiz

**ID:** `quiz_hospitality_vision`

```json
{
  "title": "Your Dream Hospitality Experience",
  "difficulty": "medium",
  "pointsBase": 40,
  "pointsPerfectBonus": 15,
  "questions": {
    "q1": {
      "question": "How many corporate guests would you typically host?",
      "type": "multiple-choice",
      "options": [
        {
          "label": "2-5",
          "value": "small",
          "segmentationTag": "small_corporate"
        },
        {
          "label": "6-15",
          "value": "medium",
          "segmentationTag": "medium_corporate"
        },
        {
          "label": "15+",
          "value": "large",
          "segmentationTag": "enterprise_prospect"
        }
      ],
      "points": 20,
      "segmentationTag": "corporate_prospect"
    },
    "q2": {
      "question": "What's your hospitality budget per person?",
      "type": "multiple-choice",
      "options": [
        {
          "label": "£50-150",
          "value": "standard",
          "segmentationTag": "standard_hospitality"
        },
        {
          "label": "£150-300",
          "value": "premium",
          "segmentationTag": "premium_hospitality"
        },
        {
          "label": "£300+",
          "value": "luxury",
          "segmentationTag": "luxury_hospitality"
        }
      ],
      "points": 20
    }
  }
}
```

---

## 4. Future Quiz Templates

Additional quizzes can be created following the same structure. Key fields:

- **ID**: Unique identifier (e.g., `quiz_*_*`)
- **Title**: User-facing quiz name
- **Difficulty**: `easy`, `medium`, or `hard`
- **pointsBase**: Base points awarded for completion
- **pointsPerfectBonus**: Bonus points for perfect score
- **questions**: Object with question definitions
  - **type**: `multiple-choice`, `true-false`, or `text-input`
  - **isCorrect**: Mark the correct answer for scoring
  - **segmentationTag**: Tag assigned when this answer is selected
  - **points**: Points for this individual question

---

## 5. Reward Catalog Template

The reward catalogue is organised by tier and includes digital, merchandise, experience, and hospitality offerings.

### Bronze Tier (0-100 pts)

```json
[
  {
    "id": "reward_match_guide_digital",
    "title": "Digital Match Guide",
    "pointsCost": 10,
    "tier": "bronze",
    "category": "digital",
    "description": "PDF guide with team stats, player history, arena insights"
  },
  {
    "id": "reward_pre_match_tips",
    "title": "Pre-Match Tactics Email Series",
    "pointsCost": 15,
    "tier": "bronze",
    "category": "digital",
    "description": "Weekly email with coaching insights and match analysis"
  }
]
```

### Silver Tier (100-250 pts)

```json
[
  {
    "id": "reward_vintage_shirt",
    "title": "LTFC Vintage Merchandise",
    "pointsCost": 150,
    "tier": "silver",
    "category": "merchandise",
    "description": "Limited-edition retro LTFC shirt",
    "quantity": 50
  },
  {
    "id": "reward_stadium_tour",
    "title": "Stadium Tour Experience",
    "pointsCost": 200,
    "tier": "silver",
    "category": "experience",
    "description": "Guided Kenilworth Road tour + VIP lounge access"
  }
]
```

### Gold Tier (250+ pts)

```json
[
  {
    "id": "reward_hospitality_package",
    "title": "VIP Hospitality Package",
    "pointsCost": 500,
    "tier": "gold",
    "category": "hospitality",
    "description": "Premium seating + 3-course meal + meet & greet"
  },
  {
    "id": "reward_season_ticket_discount",
    "title": "20% Season Ticket Discount",
    "pointsCost": 750,
    "tier": "gold",
    "category": "experience",
    "description": "20% off next season's ticket purchase + VIP benefits"
  }
]
```
