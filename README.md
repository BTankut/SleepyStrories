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

## Güvenlik Uyarısı / Security Notice

Bu uygulama üç farklı API servisi kullanmaktadır ve bu servislere ait kimlik bilgilerinin güvenli bir şekilde saklanması gerekmektedir. Lütfen API anahtarlarınızı veya kimlik bilgilerinizi asla doğrudan kod içerisinde saklamayın veya GitHub'a göndermeyin.

This application uses three different API services, and the credentials for these services must be stored securely. Please never store your API keys or credentials directly in the code or push them to GitHub.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- NPM or Yarn
- API keys for the following services:
  - OpenAI (DALL-E) - [Get API Key](https://platform.openai.com/account/api-keys)
  - Google Gemini - [Get API Key](https://ai.google.dev/)
  - Google Cloud (Text-to-Speech) - [Create Service Account](https://console.cloud.google.com/apis/credentials)

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

3. Set up Google Cloud credentials
   - Create a service account in the Google Cloud Console and download the JSON key file
   - Place the JSON key file in a secure location on your system (recommended location: `.google-cloud/google-credentials.json` in the project root)
   - **IMPORTANT**: Make sure this file is in your `.gitignore` to prevent accidental exposure

4. Set up environment variables
   - Copy the `.env.example` file to create a new `.env` file:
   ```
   cp .env.example .env
   ```
   - Edit the `.env` file and add your API keys:
   ```
   # Required API Keys
   DALLE_API_KEY=your_dalle_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Path to Google Cloud credentials file (absolute path recommended)
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-credentials.json
   ```

5. Verify your application directory
   Make sure your application structure includes these directories:
   ```
   mkdir -p dist/public/audio
   ```
   This is where the audio files will be generated and stored.

6. Start the development server
   ```
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5000`

## Troubleshooting

### Google TTS Service Issues
If you encounter errors with the Text-to-Speech service:
- Ensure your service account has the "Cloud Text-to-Speech API" enabled
- Check that the path to your credentials file in the `.env` file is correct and absolute
- Verify the JSON credentials file is valid and not corrupted

### DALL-E Image Generation Issues
- Confirm your OpenAI API key has sufficient credits
- Check if the API key has proper permissions for DALL-E image generation

### Gemini Story Generation Issues
- Verify your Gemini API key is active and properly set in the `.env` file

## Security Best Practices

1. **Environment Variables**:
   - All API keys must be stored as environment variables
   - Never hardcode API keys in the application code

2. **Credential Files**:
   - Google Cloud credentials JSON file should be stored outside the source code
   - Add all credential files to `.gitignore`

3. **Repository Hygiene**:
   - Regularly audit the repository for accidentally committed credentials
   - Consider using git-secrets or similar tools to prevent credential leaks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Special thanks to the AI providers whose technology makes this application possible
- Inspired by the importance of personalized storytelling in children's development