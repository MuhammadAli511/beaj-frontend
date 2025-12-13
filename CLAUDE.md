# CLAUDE.md - Beaj Frontend Admin Dashboard

## Project Overview

**Beaj** is an EdTech platform delivering educational content via WhatsApp chatbot. This React frontend serves as the **admin dashboard** for managing courses, lessons, user data, analytics, and WhatsApp bot interactions.

### Purpose
- Manage educational courses, weeks, lessons, and content
- Monitor WhatsApp chatbot activity and user progress
- Handle user analytics and feedback
- Verify payments and manage course purchases
- Test AI services (speech-to-text)

## Tech Stack

- **Framework**: React 18 with Create React App
- **Routing**: React Router DOM v6 (HashRouter)
- **State Management**: React Context API (SidebarContext)
- **Styling**: CSS Modules (`.module.css` per component)
- **Charts**: Chart.js with react-chartjs-2
- **Rich Text Editor**: Jodit React
- **CSV Handling**: PapaParse, react-csv-downloader
- **Notifications**: react-toastify
- **Loading States**: react-loader-spinner (TailSpin)

## Project Structure

```
src/
├── App.jsx                 # Main app with routing
├── index.jsx               # Entry point
├── components/             # Reusable UI components
│   ├── Navbar/            
│   ├── Sidebar/           
│   ├── ProtectedRoute.jsx  # Role-based route guard
│   ├── SidebarContext.jsx  # Sidebar state management
│   └── ErrorBoundary/     
├── pages/                  # Feature pages
│   ├── Auth/Login          # Authentication
│   ├── Dashboard/          # Main dashboard with stats
│   ├── ContentManager/     # Course/lesson CRUD
│   │   ├── Category/       # Course categories
│   │   ├── Course/         # Course management
│   │   ├── CourseWeek/     # Week management
│   │   ├── Lesson/         # Lesson management (complex)
│   │   ├── Alias/          # Activity aliases
│   │   └── Constant/       # WhatsApp constants
│   ├── Analytics/          # User analytics & charts
│   ├── WhatsappLogs/       # Bot conversation logs
│   ├── UserProgress/       # Student progress tracking
│   └── AIServices/         # Speech-to-text testing
├── helper/index.js         # ALL API calls (centralized)
├── utils/
│   ├── xssProtection.js    # Secure localStorage wrapper
│   ├── jwtUtils.js         # Token handling
│   └── errorHandler.js     
└── constants/
    ├── courseFilters.js    # Course filtering logic
    └── prompt.js           # AI prompts
```

## Architecture Patterns

### API Layer
All API calls are centralized in `src/helper/index.js`. Pattern:

```javascript
export const apiFunction = async (params) => {
    const response = await fetch(`${API_URL}/endpoint`, {
        method: "POST",
        headers: getHeaders(),  // Includes JWT auth
        body: JSON.stringify(params),
    });
    const data = await response.json();
    return { status: response.status, data };
};
```

- File uploads use FormData (no Content-Type header)
- JWT token retrieved via `secureStorage.getItem('token')`
- Always return `{ status, data }` object

### Component Pattern
Each page/component follows this structure:

```jsx
import styles from "./ComponentName.module.css";
import { Navbar, Sidebar } from "../../components";
import { useSidebar } from "../../components/SidebarContext";

const ComponentName = () => {
    const { isSidebarOpen } = useSidebar();
    // State and effects...
    
    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                {/* Page content */}
            </div>
        </div>
    );
};
```

### Authentication & Authorization
- JWT-based authentication stored in localStorage via `secureStorage`
- Role-based access control via `ProtectedRoute` component
- Roles: `admin`, `facilitator`, `kid-lesson-creator`, `teacher-lesson-creator`
- Token validation uses `getRoleFromToken()` and `isTokenExpired()`

## Key Domain Concepts

### Course Hierarchy
```
Category → Course → CourseWeek → Lesson → Activities/Questions
```

### Lesson Types
- **Read**: Text-based lessons
- **Watch**: Video content
- **Listen**: Audio content  
- **Speak**: Speaking practice with questions
- **MCQs**: Multiple choice questions

### Activity Types (Speak lessons)
- WatchAndSpeak, ListenAndSpeak, SpeakingPractice
- ConversationalAgencyBot, ConversationalMonologueBot
- FeedbackAudio, WatchAndAudio, WatchAndImage
- AssessmentWatchAndSpeak

### User Roles & Permissions
```javascript
// Admin: Full access to all features
// Facilitator: Dashboard, logs, analytics, user data
// kid-lesson-creator: Kids category content only
// teacher-lesson-creator: Teachers category content only
```

## Environment Variables

```
REACT_APP_API_URL        # Backend API URL
REACT_APP_PROD_API_URL   # Production API (for migrations)
REACT_APP_ENVIRONMENT    # DEV or PROD (controls logging)
```

## Development Commands

```bash
npm start      # Development server (localhost:3000)
npm run build  # Production build
npm test       # Run tests
```

## Code Style Guidelines

### File Naming
- Components: `PascalCase.jsx` with matching `PascalCase.module.css`
- Utilities: `camelCase.js`
- Index files export from directories

### CSS Modules
- Use `styles.className` for all styling
- Component-specific styles only
- Class names use `snake_case`

### State Management
- Use `useState` for component state
- Use `useEffect` with proper dependency arrays
- Loading states: `[data, setData]`, `[loading, setLoading]`, `[error, setError]`

### Error Handling
- Wrap API calls in try/catch
- Only log errors in DEV environment: `if (process.env.REACT_APP_ENVIRONMENT === 'DEV')`
- Display user-friendly error messages via toast or inline

### Security
- Use `secureStorage` instead of raw `localStorage`
- Validate inputs for XSS patterns via `xssProtection.js`
- Never expose tokens or sensitive data in logs

## Common Tasks

### Adding a New Page
1. Create folder in `src/pages/NewPage/`
2. Add `NewPage.jsx` and `NewPage.module.css`
3. Export from `src/pages/index.js`
4. Add route in `App.jsx` with `ProtectedRoute` and `allowedRoles`
5. Add menu item in `Sidebar.jsx` with role restrictions

### Adding an API Call
1. Add function to `src/helper/index.js`
2. Follow existing pattern: `{ status, data }` return format
3. Use `getHeaders()` for authenticated requests
4. Use FormData for file uploads

### Working with Lessons
Lessons are complex with multiple activity types. Key files:
- `ManageLesson/ManageLesson.jsx` - Main lesson management
- `LessonTypes/` - Type-specific edit components
- `createLessonFunctions.js` - Lesson creation utilities

## Important Notes

- HashRouter is used (`/#/path`) for compatibility
- Course filtering excludes archived courses (see `courseFilters.js`)
- Some features are commented out in Sidebar (Add Users, Purchase Course, etc.)
- WhatsApp bot communication happens via backend API
- Content can be migrated between courses and tested via WhatsApp

## Related Files
- See @package.json for dependencies
- See @.gitignore for ignored files
- Agent configs in @.claude/agents/ for specialized tasks
