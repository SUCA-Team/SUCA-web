# SUCA

SUCA is a web-based Japanese language learning platform that combines a comprehensive dictionary with an intelligent flashcard system. The application helps learners of all levels study Japanese vocabulary effectively through spaced repetition and immediate access to detailed word information.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Testing](#testing)
- [Data Attribution](#data-attribution)
- [Project Structure](#project-structure)

## Features

### Dictionary

The dictionary feature is powered by JMdict/EDICT, containing over 180,000 Japanese word entries with comprehensive information.

**Search Capabilities:**
- **Multiple input types**: Search using hiragana, katakana, kanji, romaji, or English
- **Intelligent suggestions**: Real-time word suggestions as you type, supporting all input methods
- **Comprehensive results**: Each entry includes:
  - Word in kanji (if applicable) with furigana readings
  - Multiple meanings and definitions
  - Part-of-speech information
  - Usage examples with English translations
  - Common word indicators for frequently used vocabulary

**Integration Features:**
- **Direct deck addition**: Add any searched word directly to your flashcard decks
- **Flexible card creation**: Customize front and back of cards when adding from dictionary
- **Batch operations**: Create multiple cards from search results

### Flashcards

An intelligent spaced repetition system designed to optimize your learning efficiency.

**Deck Management:**
- **Create custom decks**: Organize vocabulary by topic, difficulty, or personal preference
- **Public/private decks**: Share your decks with the community or keep them private
- **Deck editing**: Modify deck names, descriptions, and visibility settings
- **Browse community decks**: Discover and copy decks created by other learners
- **Import/export**: Transfer decks between accounts or backup your progress

**Study System:**
- **FSRS algorithm**: Uses the Free Spaced Repetition Scheduler for scientifically-optimized review intervals
- **Due card tracking**: Automatic calculation of which cards need review
- **Review scheduling**: Cards are scheduled based on your performance (Again, Hard, Good, Easy)
- **Manual review mode**: Study cards on your own schedule without affecting FSRS scheduling
- **Session-based study**: Complete focused study sessions with progress tracking

**Card Operations:**
- **Bulk actions**: Select and manage multiple cards simultaneously
- **Card editing**: Modify card content, front/back text anytime
- **Card deletion**: Remove individual cards or entire decks
- **Progress tracking**: View statistics on cards due, studied, and mastered

### Authentication

Secure user management powered by Firebase Authentication.

**Features:**
- **Google Sign-In**: Quick and secure authentication using your Google account
- **Persistent sessions**: Stay logged in across browser sessions
- **User-specific data**: All decks and progress are tied to your account
- **Secure API access**: Firebase tokens automatically injected into backend requests

### Contact Form

Built-in communication channel for user feedback and support.

**Features:**
- **Firestore integration**: Messages stored securely in Firebase Firestore
- **Rate limiting**: 60-second cooldown prevents spam submissions
- **Client-side validation**: Immediate feedback on form completion

## Tech Stack

### Frontend Framework
- **React 19.1.1**: Modern UI library with hooks and functional components
- **TypeScript 5.9.3**: Static type checking for improved code quality and developer experience
- **React Router 7.9.3**: Declarative routing for single-page application navigation

### Build & Development Tools
- **Vite 7.1.7**: Lightning-fast development server with Hot Module Replacement (HMR)
- **ESLint 9.36.0**: Code linting with flat config for maintaining code quality
- **TypeScript ESLint**: Type-aware linting rules for TypeScript code

### Authentication & Database
- **Firebase 12.4.0**: 
  - **Authentication**: Google OAuth sign-in
  - **Firestore**: NoSQL database for contact messages
  - **Analytics**: User interaction tracking

### Testing Framework
- **Vitest 4.0.15**: Fast unit test framework powered by Vite
- **React Testing Library 16.1.0**: Component testing utilities
- **jsdom**: DOM implementation for testing environment
- **Test Coverage**: 45+ tests across utilities, services, components, and hooks

### Key Libraries & Algorithms
- **FSRS (Free Spaced Repetition Scheduler)**: Scientific algorithm for optimal flashcard review scheduling
- **JMdict/EDICT**: Comprehensive Japanese-English dictionary database (180,000+ entries)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

You will also need:
- A **Firebase project** set up with Authentication and Firestore enabled
- The **SUCA backend API** running (see backend repository for setup instructions)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/SUCA-Team/SUCA-web.git
cd SUCA-web
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, TypeScript, Vite, Firebase, and testing dependencies.

#### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` in your text editor and fill in your Firebase credentials. You can find these in your Firebase Console under Project Settings:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
```

**Important Notes:**
- Never commit your `.env` file to version control (it's already in `.gitignore`)
- The `VITE_` prefix is required for Vite to expose variables to the client
- Ensure your Firebase project has Google Authentication enabled
- Update `VITE_API_BASE_URL` if your backend runs on a different port or domain

#### 4. Set Up Firebase

In your Firebase Console:

1. **Enable Google Authentication:**
   - Go to Authentication → Sign-in method
   - Enable Google as a sign-in provider
   - Add authorized domains (localhost for development)

2. **Create Firestore Database:**
   - Go to Firestore Database
   - Create database in production or test mode
   - Set up security rules as needed

3. **Enable Analytics (optional):**
   - Go to Analytics
   - Enable Google Analytics for your project

#### 5. Start the Backend API
[SUCA API](https://github.com/SUCA-Team/SUCA-api) must be running for the frontend to function correctly. Follow the instructions in the backend repository to set it up locally.
Make sure the SUCA backend API is running and set the `VITE_API_BASE_URL` environment variable accordingly.

#### 6. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or another port if 5173 is in use). The dev server includes:
- Hot Module Replacement (HMR) for instant updates
- TypeScript type checking
- Fast refresh for React components

## Usage Guide

### Dictionary Search

1. **Navigate to Dictionary**: Click "DICTIONARY" in the header or visit `/dictionary`
2. **Enter your search**: Type in any of these formats:
   - Japanese: こんにちは, ハンバーガー, 勉強
   - Romaji: konnichiwa, hanbaagaa, benkyou
   - English: hello, hamburger, study
3. **View results**: Browse definitions, readings, examples
4. **Add to deck**: Click the "Add to Deck" button to save words for study

### Creating and Studying Flashcards

**Create a Deck:**
1. Go to Flashcards page (`/flashcard`)
2. Click "Create New Deck"
3. Enter deck name, description, and choose public/private visibility
4. Click "Create Deck"

**Add Cards:**
- From dictionary: Search a word → "Add to Deck" → Select deck
- Manually: Open deck → "Add Card" → Enter front/back text

**Study Cards:**
1. Open a deck from the Flashcards page
2. Click "Study" button
3. Review each card and rate your recall:
   - **Again**: Didn't remember (card scheduled sooner)
   - **Hard**: Difficult to recall (slightly longer interval)
   - **Good**: Recalled correctly (standard interval)
   - **Easy**: Very easy to recall (much longer interval)
4. The FSRS algorithm automatically schedules your next review

**Browse Public Decks:**
1. Click "Browse Public Decks"
2. Search or browse available decks
3. Click "Copy to My Decks" to add to your collection

### Managing Your Account

**Sign In:**
- Click "Login" in the header
- Select "Sign in with Google"
- Authorize SUCA to access your Google account

**Sign Out:**
- Click your profile icon in the header
- Select "Sign Out"

## Development

### Available Scripts

#### Development Server
```bash
npm run dev
```
Starts the Vite development server with HMR on `http://localhost:5173`. Changes to source files will be reflected immediately in the browser.

#### Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist/` directory. This command:
- Compiles TypeScript to JavaScript
- Bundles all modules
- Minifies code for production
- Optimizes assets
- Excludes test files from the build

#### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing before deployment. Useful for verifying the build works correctly.

### Development Workflow

**Making Changes:**
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes in `src/`
3. Test your changes: `npm test`
4. Lint your code: `npm run lint`
5. Commit with clear messages
6. Push and create a pull request

**Code Organization:**
- **Components**: Place reusable UI components in `src/components/`
- **Pages**: Add new pages in `src/pages/PageName/`
- **Hooks**: Custom hooks go in `src/hooks/`
- **Services**: API calls and business logic in `src/services/`
- **Types**: TypeScript interfaces in `src/types/`
- **Utils**: Helper functions in `src/utils/`

**TypeScript Configuration:**
- `tsconfig.json`: Base TypeScript configuration
- `tsconfig.app.json`: Application code config (excludes tests)
- `tsconfig.node.json`: Node.js tooling config

**ESLint Configuration:**
- Uses flat config format (`eslint.config.js`)
- TypeScript ESLint integration
- React-specific rules
- Run `npm run lint` to check for issues

## Testing

### Running Tests

**Run all tests:**
```bash
npm test
```
Executes the complete test suite using Vitest. Tests run in a jsdom environment simulating a browser.

**Watch mode:**
```bash
npm run test:watch
```
Runs tests in watch mode. Tests automatically re-run when files change. Useful during development.

### Test Coverage

The project includes 45+ tests covering critical functionality:

**Utilities (15 tests):**
- `romajiToKana.test.ts`: Romaji to hiragana conversion
  - Basic character conversion
  - Digraph handling (きゃ, しゅ, etc.)
  - Sokuon (っ) conversion
  - Quote preservation
  - Mixed content handling

**Services (13 tests):**
- `wordRecommendationService.test.ts`: Word suggestion system
  - Hiragana input filtering
  - Katakana input filtering
  - Kanji word matching
  - Romaji conversion and matching
  - English meaning search
  - JLPT level filtering (N5-N1)
  - Random word generation

**Components (7 tests):**
- `Header.test.tsx`: Navigation header rendering
  - Logo display
  - Navigation links
  - Login button
- `Footer.test.tsx`: Footer component
  - Copyright text
  - Footer columns
  - Navigation links

**Hooks (2 tests):**
- `useAuth.test.tsx`: Authentication hook
  - Context provider functionality
  - Loading state management

**Logic (6 tests):**
- `contactRateLimiting.test.ts`: Rate limiting system
  - Submission cooldown enforcement
  - LocalStorage integration
  - Timestamp validation

### Test Configuration

- **Framework**: Vitest 4.0.15
- **Testing Library**: React Testing Library 16.1.0
- **Environment**: jsdom (browser simulation)
- **Setup**: `src/test/setup.ts` configures test environment
- **Config**: `vitest.config.ts` defines test settings

### Writing Tests

Tests are located in `src/test/`. When adding new features:

1. Create a test file: `src/test/yourFeature.test.ts(x)`
2. Import testing utilities:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { render, screen } from '@testing-library/react';
   ```
3. Write descriptive test cases
4. Run tests to verify: `npm test`

See `TESTING.md` for more detailed testing documentation.

### Code Quality

**Linting:**
```bash
npm run lint
```
Runs ESLint to check for code quality issues, TypeScript errors, and style violations. Fix issues before committing.

**Type Checking:**
TypeScript automatically checks types during development. The `npm run build` command includes a full type check.

## Data Attribution

### JMdict/EDICT Dictionary

SUCA's Japanese-English dictionary is powered by the **JMdict/EDICT** project, a comprehensive multilingual Japanese dictionary maintained by the Electronic Dictionary Research and Development Group (EDRDG).

**About JMdict:**
- Over 180,000 Japanese word entries
- Comprehensive vocabulary including common and specialized terms
- Multiple word forms and readings
- Part-of-speech information
- Usage examples and notes
- Regularly updated and maintained

**License:**
The JMdict/EDICT files are the property of the [Electronic Dictionary Research and Development Group](http://www.edrdg.org/), and are used in conformance with the Group's [licence](http://www.edrdg.org/edrdg/licence.html).

**Acknowledgment:**
We are deeply grateful to Professor Jim Breen and the EDRDG for making this invaluable resource freely available to developers and learners worldwide.

For more information, visit the [JMdict Project Page](http://www.edrdg.org/jmdict/j_jmdict.html).

## Project Structure

The codebase is organized for maintainability and scalability:

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Shared components (modals, inputs)
│   └── layout/       # Layout components (header, footer)
├── pages/            # Page components for each route
├── hooks/            # Custom React hooks
├── context/          # React context providers
├── services/         # API calls and business logic
├── utils/            # Helper functions and utilities
├── types/            # TypeScript type definitions
├── test/             # Test files
└── config/           # Configuration files
```

See `PROJECT_STRUCTURE.md` for detailed documentation of the codebase organization, including:
- Complete directory structure
- File descriptions and purposes
- Data flow diagrams
- Routing configuration
- Environment variable requirements

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Lint your code (`npm run lint`)
6. Commit your changes with clear messages
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/SUCA-Team/SUCA-web/issues)
- **Contact**: Use the in-app contact form
- **Documentation**: See `PROJECT_STRUCTURE.md` and `TESTING.md`

## Roadmap

Planned features and improvements:
- Mobile responsive design enhancements
- Additional dictionary filters and search options
- Flashcard statistics and progress visualization
- Offline mode support
- Audio pronunciation for dictionary entries
- Additional language pairs

---

**SUCA** - Study Utility for Comprehensive Acquisition

Built with ❤️ for Japanese language learners worldwide.

