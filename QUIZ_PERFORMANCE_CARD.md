# Quiz Performance Card Implementation

## Overview

Added a beautiful Quiz Performance card with color-coded grade badges, progress bars, and performance indicators to the Profile screen.

## Design Specifications

### Card Theme
- **Border Color**: Blue (#2196F3)
- **Background**: White with shadow
- **Style**: Rounded corners (16px), padding (20px)
- **Elevation**: Shadow with 5px elevation

## Components

### 1. Overall Statistics Section

Two side-by-side stat boxes showing:

#### Left Box - Total Quizzes
- Light blue background (#E3F2FD)
- Blue border (#90CAF9)
- Label: "Total Quizzes"
- Value: Dynamic from `userData.totalQuizzesTaken`

#### Right Box - Average Score
- Light blue background (#E3F2FD)
- Blue border (#90CAF9)
- Label: "Average Score"
- Value: Dynamic from `userData.averageScore` (in green)

### 2. Individual Quiz Results

Each quiz displays:

#### Quiz Header
- **Left Side**:
  - Quiz number (e.g., "Quiz #1")
  - Completion date (formatted)
  
- **Right Side**:
  - Grade badge (A, B, C, D, F with color coding)
  - Rounded badge with white text

#### Score Display
- Format: "Score: 8 / 10"
- Bold, clear typography
- Shows actual score and total

#### Progress Bar
- Height: 14px
- Rounded corners (7px)
- Background: Light gray (#E0E0E0)
- Fill color: Matches grade color
- Width: Based on percentage
- Percentage text displayed on right

#### Performance Indicator
- Emoji-based performance message
- Color-coded text matching grade
- Separated by top border

## Grade Color Coding System

```
A+ → #4CAF50 (Dark Green)
A  → #66BB6A (Green)
B+ → #9CCC65 (Light Green)
B  → #CDDC39 (Lime)
C+ → #FFEB3B (Yellow)
C  → #FFC107 (Amber)
D+ → #FF9800 (Orange)
D  → #FF5722 (Deep Orange)
F  → #F44336 (Red)
```

## Performance Messages

Based on percentage achieved:

| Range | Emoji | Message |
|-------|-------|---------|
| 90-100% | 🌟 | Excellent |
| 80-89% | 🎯 | Very Good |
| 70-79% | 👍 | Good |
| 60-69% | 📈 | Fair |
| Below 60% | 💪 | Needs Improvement |

## API Data Structure

```javascript
{
  "student": {
    "totalQuizzesTaken": 1,
    "averageScore": 80,
    "quizPerformance": [
      {
        "_id": "68decc8648cd7a60b8e9929d",
        "quiz": "6775997382865d4b38fafc3d",
        "score": 8,
        "percentage": 80,
        "grade": "A",
        "completedAt": "2025-10-02T19:03:34.115Z"
      }
    ]
  }
}
```

## Example Display

### Sample Data
```
Total Quizzes: 1
Average Score: 80%

Quiz #1                        [A]
10/2/2025

Score: 8 / 10

[████████████████████░░] 80%

Performance: 🎯 Very Good
```

## Visual Features

### Card Structure
```
┌─────────────────────────────────┐
│   Quiz Performance              │
│                                 │
│  [Total Quizzes] [Avg Score]   │
│      1              80%         │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Quiz #1          [A Badge]│ │
│  │ 10/2/2025                 │ │
│  │ Score: 8 / 10             │ │
│  │ [Progress Bar] 80%        │ │
│  │ Performance: 🎯 Very Good │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

## Styling Details

### Overall Stats Boxes
- Flex direction: Row
- Gap: 10px
- Each box takes 50% width
- Centered content
- Padding: 15px
- Border radius: 12px

### Quiz Result Items
- Margin bottom: 20px
- Padding: 16px
- Background: #F5F5F5
- Border radius: 12px
- Left border: 4px blue accent

### Grade Badge
- Rounded: 20px border radius
- Padding: 8px horizontal, 16px vertical
- White text, bold (700)
- Font size: 18px
- Dynamic background color

### Progress Bar
- Container height: 14px
- Fill animates based on percentage
- Smooth rounded corners
- Color matches grade

## Responsive Features

- Card adapts to screen width
- Text wraps appropriately
- Stats boxes stack responsively
- Progress bars scale proportionally
- Maintains readability on all devices

## Dynamic Calculations

### Total Questions Calculation
```javascript
const totalQuestions = Math.round((item.score || 0) / (percentage / 100)) || 10;
```

### Progress Width
```javascript
width: `${percentage}%`
```

### Grade Color Selection
```javascript
const gradeColors = {
  'A+': '#4CAF50',
  'A': '#66BB6A',
  // ... etc
};
const gradeColor = gradeColors[item.grade] || '#757575';
```

## Integration with Profile

### Card Order
1. Learning Statistics (Blue - Donut Chart)
2. Enrollment Details (Purple - Progress)
3. Enrolled Courses (Orange - Progress)
4. **Quiz Performance (Blue - Grades & Progress)** ← NEW
5. Personal Information

### Conditional Rendering
Only shown when:
```javascript
userData.quizPerformance && userData.quizPerformance.length > 0
```

## Key Features

✅ Color-coded grade badges
✅ Visual progress bars
✅ Performance indicators with emojis
✅ Overall statistics summary
✅ Individual quiz breakdown
✅ Completion dates
✅ Score calculations
✅ Responsive design
✅ Professional appearance
✅ Easy to scan and understand

## Files Modified

- `src/features/screens/Profile.tsx` - Added Quiz Performance card
- `QUIZ_PERFORMANCE_CARD.md` - This documentation

## Future Enhancements

- Add quiz title/name
- Include subject/topic
- Show time taken
- Add retry functionality
- Compare with class average
- Show improvement trends
- Add detailed answer review
