# SleepyStories

A multilingual storytelling platform that empowers users to create personalized, multimedia narratives through advanced AI technologies. SleepyStories combines generative AI, text-to-speech, and image generation to provide an immersive storytelling experience for children.

## Features

- **Personalized Stories**: Create stories featuring customized characters based on user profiles
- **AI-Generated Content**: Utilizes Gemini AI to generate engaging story narratives
- **Visual Storytelling**: DALL-E generated images that bring stories to life
- **Audio Narration**: Google Cloud Text-to-Speech for high-quality narration
- **Multilingual Support**: Create and experience stories in multiple languages (English and Turkish)
- **Mobile-Responsive Design**: Optimized viewing experience across all devices
- **Theme Customization**: Choose from various app themes to personalize the experience
- **Favorites System**: Save and revisit favorite stories

## Technology Stack

### Frontend
- React with TypeScript
- TanStack React Query for data fetching
- Tailwind CSS for styling
- Shadcn UI component library
- Wouter for routing

### Backend
- Node.js with Express
- Zod for validation
- Drizzle ORM for database interactions

### AI & External Services
- Google Gemini for story generation
- DALL-E for image creation
- Google Cloud Text-to-Speech for audio narration

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- NPM or Yarn
- API keys for Google Cloud and OpenAI

### Installation

1. Clone the repository
   ```
   git clone https://github.com/BTankut/SleepyStrories.git
   cd SleepyStrories
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_APPLICATION_CREDENTIALS=path_to_google_credentials_json
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Special thanks to the AI providers whose technology makes this application possible
- Inspired by the importance of personalized storytelling in children's development