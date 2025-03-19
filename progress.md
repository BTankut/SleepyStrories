# SleepyStories - Project Progress

**Last Updated:** March 19, 2025 at 7:15 PM

## Project Overview

SleepyStories is a full-stack application that generates personalized bedtime stories for children using advanced AI technologies:

- **Gemini AI** for story text generation
- **DALL-E** for image generation
- **Google Cloud Text-to-Speech** for audio narration

The application allows users to create profiles for children, customize story elements, and save favorite stories for later listening.

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **API Integrations**: Google Gemini AI, OpenAI DALL-E, Google Cloud TTS
- **Storage**: In-memory storage (MemStorage implementation)

## Project Structure

```
├── client/                  # Frontend code
│   ├── src/                 # Source files
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Shadcn UI components
│   │   │   └── ...          # Application-specific components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   │   ├── AppContext.tsx  # App-wide context (language, themes)
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   └── main.tsx         # Entry point
├── server/                  # Backend code
│   ├── services/            # Service integrations
│   │   ├── dalleService.ts  # DALL-E image generation
│   │   ├── geminiService.ts # Gemini text generation
│   │   └── ttsService.ts    # Google Cloud TTS
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Data storage implementation
│   └── index.ts             # Server entry point
├── shared/                  # Shared TypeScript definitions
│   └── schema.ts            # Data models and schemas
└── ...                      # Configuration files
```

## Key Features

- **User Profiles**: Create and manage child profiles with customizable attributes
- **Story Generation**: Create personalized stories with customizable characters, environments, and themes
- **Multi-language Support**: Full support for English and Turkish interfaces
- **Theme Customization**: Four pastel color themes (Blue, Green, Pink, Cream)
- **Dark Mode**: Toggle between light and dark display modes
- **Audio Narration**: Text-to-speech conversion for listening to stories
- **Favorites**: Save and manage favorite stories for later access

## How to Run

1. The project uses a workflow named 'Start application' that runs `npm run dev`
2. This starts the Express server on port 5000, which also serves the frontend
3. Visit the application at the specified URL in your browser

## Recent Changes and Improvements

### March 19, 2025 (7:15 PM)
- Fixed favorites functionality in StoryReader component
- Added navigation buttons for returning to main menu from stories
- Updated application name consistency to "Sleepy Stories" across all interfaces
- Added proper child voice options for both Turkish and English languages
- Enhanced voice selection system to use direct Google TTS API voice IDs
- Implemented alternative child voices for better personalization options
- Added translations for new voice options in both languages
- Fixed proper story data passing to favorites system
- Improved multilingual support throughout the application interface

### March 19, 2025 (5:15 PM)
- Fixed audio narration issues to correctly play the audio for the current page
- Enhanced image containers with properly styled rounded-corner cards and shadows
- Improved page navigation in StoryReader with better state management
- Added comprehensive error handling and debugging to TTS service
- Implemented static file serving configuration for audio files
- Fixed cross-origin issues with audio playback
- Added audio element dynamic source management
- Optimized audio loading during page transitions
- Improved UI consistency with better styling of image containers

### March 19, 2025 (3:40 PM)
- Added language switching capabilities (Turkish/English)
- Implemented theme selection with four pastel color options
- Added dark/light mode support
- Enhanced favorite story deletion functionality
- Replaced icons with modern Lucide icon set
- Implemented internationalization across all components
- Fixed UI/UX consistency issues with proper styling

### Previous Updates
- Set up initial API integration with Gemini for story generation
- Implemented DALL-E image generation with rate limiting
- Created Google Cloud TTS integration for audio narration
- Established basic data models and storage system
- Implemented the core user interface components

## Environment Variables and Secrets

The application requires the following environment variables:
- `DALLE_API_KEY` - OpenAI API key for DALL-E image generation
- `GEMINI_API_KEY` - Google API key for Gemini text generation
- Google Cloud credentials for Text-to-Speech service

## Next Steps

Potential improvements for future development:
- Database persistence with PostgreSQL
- User authentication system
- Enhanced story customization options
- Better mobile responsiveness
- Animation and transition improvements
- Social sharing capabilities
- More language options
- Download stories as PDF or audio files
- More sophisticated error handling with recovery options
- Additional voice types and voice effect options
- Age-appropriate content filtering and adjustment
- Parent controls and usage monitoring
- User feedback and story rating system

---

This document serves as a quick reference for the project, its structure, and recent development activities.