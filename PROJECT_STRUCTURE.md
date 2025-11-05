# SUCA App - Project Structure Guide

This guide explains the file organization for the SUCA Japanese language learning application.

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   │   └── TranslationInput.tsx  # Main translation/search input with suggestions
│   ├── layout/          # Layout components
│   │   └── Header.tsx   # App header with navigation and theme toggle
│   └── AppRouter.tsx    # Main routing component
├── pages/               # Page components (route-level)
│   ├── Home/
│   │   ├── HomePage.tsx # Main landing page
│   │   └── HomePage.css
│   ├── About/
│   │   └── AboutPage.tsx
│   └── Features/
│       └── FeaturesPage.tsx
├── hooks/               # Custom React hooks
│   ├── useTheme.ts     # Theme management hook
│   └── useWordSuggestions.ts  # Word recommendation hook
├── context/             # React Context providers
│   └── ThemeContext.tsx # Light/dark theme context
├── services/            # API calls and business logic
│   └── wordRecommendationService.ts  # Word suggestion service
├── types/               # TypeScript type definitions
│   ├── theme.ts        # Theme-related types
│   └── translation.ts  # Translation and word types
├── styles/              # Global styles and themes
│   └── theme.css       # CSS variables for light/dark themes
├── assets/              # Static assets
│   └── react.svg
├── utils/               # Utility functions (future)
└── index.ts            # Export barrel file
```

## 🎨 Features Implemented

### Theme System
- **Light/Dark Mode**: Automatic system preference detection
- **Theme Toggle**: Button in header to switch themes
- **Persistent Preferences**: Saves theme choice to localStorage
- **CSS Variables**: Centralized theming with CSS custom properties

### Word Recommendations
- **Real-time Suggestions**: As-you-type word recommendations
- **Multiple Search Types**: Supports hiragana, katakana, kanji, and romaji
- **JLPT Level Indicators**: Shows difficulty levels (N5-N1)
- **Smart Filtering**: Searches across word, reading, and meaning
- **Responsive Dropdown**: Clean suggestion interface

### Navigation
- **React Router**: Client-side routing for SPA experience
- **Responsive Header**: Works on desktop and mobile
- **Clean URLs**: Proper route structure for different pages

### UI Components
- **Translation Input**: Dual-mode (translate/search) with suggestions
- **Hero Section**: Eye-catching landing page design
- **Feature Cards**: Preview of app capabilities
- **Responsive Design**: Mobile-first approach

## 🚀 Getting Started

1. **Development Server**:
   ```bash
   npm run dev
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## 🛠 Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS Variables** - Theming system
- **ESLint** - Code linting

## 📱 Responsive Design

The application is designed mobile-first with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🎯 Future Enhancements

Based on this structure, you can easily add:

1. **Authentication Pages**: `src/pages/Auth/`
2. **Dashboard**: `src/pages/Dashboard/`
3. **Lessons**: `src/pages/Lessons/`
4. **Profile**: `src/pages/Profile/`
5. **API Integration**: `src/services/api.ts`
6. **State Management**: `src/store/` (Redux/Zustand)
7. **Testing**: `src/__tests__/`
8. **Utilities**: `src/utils/`

## 🏗 Architecture Benefits

- **Scalable**: Easy to add new features and pages
- **Maintainable**: Clear separation of concerns
- **Reusable**: Components can be shared across pages
- **Type-Safe**: Full TypeScript coverage
- **Performance**: Tree-shaking and code splitting ready
- **Developer Experience**: Clear file organization and imports