# SUCA Project Structure

This document outlines the organization of the SUCA web application codebase.

## Root Directory

```
SUCA-web/
├── src/                    # Source code
├── public/                 # Static assets
├── dist/                   # Build output
├── node_modules/           # Dependencies
├── .env                    # Environment variables (local)
├── .env.example            # Environment variables template
├── index.html              # Entry HTML file
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest test configuration
├── tsconfig.json           # TypeScript base config
├── tsconfig.app.json       # TypeScript app config
├── tsconfig.node.json      # TypeScript Node config
├── eslint.config.js        # ESLint configuration
├── README.md               # Project documentation
├── TESTING.md              # Test coverage documentation
└── SETUP_SUMMARY.md        # Setup notes
```

## Source Code Structure (`src/`)

### Application Entry Point
- `main.tsx` - React application entry point, renders App component
- `App.tsx` - Root component with theme provider
- `App.css` - Global application styles
- `index.css` - Base CSS styles
- `firebase.ts` - Firebase initialization and authentication utilities

### Components (`src/components/`)

#### Router
- `AppRouter.tsx` - React Router configuration with all application routes

#### Common Components (`src/components/common/`)
- `LoginModal.tsx` / `LoginModal.css` - Login modal dialog
- `TranslationInput.tsx` / `TranslationInput.css` - Input field with word suggestions

#### Layout Components (`src/components/layout/`)
- `Header.tsx` / `Header.css` - Navigation header with logo and menu
- `Footer.tsx` / `Footer.css` - Site footer with links and copyright

### Pages (`src/pages/`)

Each page is organized in its own directory with related components and styles.

#### Home (`src/pages/Home/`)
- `HomePage.tsx` / `HomePage.css` - Landing page

#### About (`src/pages/About/`)
- `AboutPage.tsx` - About SUCA page

#### Features (`src/pages/Features/`)
- `FeaturesPage.tsx` - Features overview page

#### Dictionary (`src/pages/Dictionary/`)
- `DictionaryPage.tsx` - JMdict dictionary search with word lookup, examples, and deck integration

#### Flashcard (`src/pages/Flashcard/`)
- `FlashcardPage.tsx` - Deck management dashboard
- `AddDeckPage.tsx` - Create new deck
- `EditDeckPage.tsx` - Edit existing deck
- `StudyPage.tsx` - FSRS-based flashcard study session
- `BrowsePublicDecksPage.tsx` - Browse public decks
- `ViewPublicDeckCardsPage.tsx` - View cards in a public deck

#### Login (`src/pages/Login/`)
- `LoginPage.tsx` - Login page (redirects to Google sign-in)

#### Contact (`src/pages/Contact/`)
- Contact form page (Firestore-backed with rate limiting)

#### Data Source (`src/pages/DataSource/`)
- `DataSourcePage.tsx` - JMdict attribution and licensing information

#### Help (`src/pages/Help/`)
- Help and documentation page

#### Terms (`src/pages/Terms/`)
- Terms of service page

#### Profile Test (`src/pages/ProfileTest/`)
- User profile testing page

### Configuration (`src/config/`)
- `api.ts` - API base URL configuration

### Context (`src/context/`)
- `AuthContext.tsx` - Authentication context provider
- `authContextValue.ts` - Authentication context value types
- `ThemeContext.tsx` - Theme (light/dark mode) context provider

### Hooks (`src/hooks/`)
- `useAuth.ts` - Authentication hook
- `useTheme.ts` - Theme management hook
- `useTranslation.ts` - Translation functionality hook
- `useWordSuggestions.ts` - Word suggestion hook for input fields

### Services (`src/services/`)
- `apiService.ts` - Axios-based API client with Firebase token injection
- `wordRecommendationService.ts` - Word suggestion service (N5-N1 vocabulary)

### Types (`src/types/`)
- `theme.ts` - Theme-related TypeScript types
- `translation.ts` - Translation and word suggestion types

### Utilities (`src/utils/`)
- `romajiToKana.ts` - Romaji to hiragana conversion utility

### Styles (`src/styles/`)
- `theme.css` - Theme variables and global theme styles

### Assets (`src/assets/`)
- Static assets (images, icons, etc.)

### Tests (`src/test/`)
- `romajiToKana.test.ts` - Tests for romaji conversion (15 tests)
- `wordRecommendationService.test.ts` - Tests for word suggestions (13 tests)
- `Header.test.tsx` - Tests for Header component (3 tests)
- `Footer.test.tsx` - Tests for Footer component (4 tests)
- `useAuth.test.tsx` - Tests for authentication hook (2 tests)
- `contactRateLimiting.test.ts` - Tests for contact rate limiting (6 tests)
- `setup.ts` - Vitest test setup with jsdom and cleanup

## Key Technologies

### Frontend Stack
- **React 19.1.1** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.7** - Build tool and dev server
- **React Router 7.9.3** - Client-side routing

### Backend Integration
- **Axios 1.12.2** - HTTP client for backend API
- **Firebase 12.4.0** - Authentication, Firestore, Analytics

### Testing & Quality
- **Vitest 4.0.15** - Test framework
- **React Testing Library 16.1.0** - Component testing
- **ESLint 9.36.0** - Code linting

### Features & Libraries
- **FSRS** - Spaced repetition algorithm for flashcards
- **JMdict** - Japanese dictionary data (180,000+ entries)

## Data Flow

### Authentication Flow
1. User clicks Google sign-in → Firebase Authentication
2. `AuthContext` provides user state throughout app
3. `apiService` injects Firebase token in API requests

### Dictionary Flow
1. User searches → `DictionaryPage` calls `apiService.search()`
2. Backend queries JMdict data → returns results
3. User can add words to decks → `apiService.addCardToDeck()`

### Flashcard Flow
1. User creates deck → `apiService.createDeck()`
2. User studies → `StudyPage` fetches due cards
3. User reviews cards → FSRS algorithm calculates next review
4. `apiService.reviewCard()` updates card state

### Word Suggestions Flow
1. User types in `TranslationInput`
2. `useWordSuggestions` hook filters `WordRecommendationService` vocabulary
3. Suggestions displayed based on input type (hiragana/katakana/kanji/romaji/English)

## Environment Variables

Required in `.env`:
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_DATABASE_URL` - Firebase database URL
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID
- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:8000/api`)

## Build & Development

### Development
```bash
npm run dev          # Start dev server (default: http://localhost:5173)
```

### Production Build
```bash
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

### Linting
```bash
npm run lint         # Run ESLint
```

## Routing Structure

- `/` - Home page
- `/about` - About page
- `/features` - Features overview
- `/dictionary` - Dictionary search
- `/flashcard` - Deck management
- `/flashcard/add` - Create new deck
- `/flashcard/edit/:deckId` - Edit deck
- `/flashcard/study/:deckId` - Study session
- `/flashcard/browse` - Browse public decks
- `/flashcard/public/:deckId/cards` - View public deck cards
- `/login` - Login page
- `/contact` - Contact form
- `/datasource` - Data attribution
- `/help` - Help documentation
- `/terms` - Terms of service
- `/profile-test` - Profile testing
