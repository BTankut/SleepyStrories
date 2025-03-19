import { UserProfile } from "@shared/schema";

// Safety factor for word count (1.4x as specified in requirements)
const WORD_COUNT_SAFETY_FACTOR = 1.4;

interface StoryGenerationParams {
  userProfile: UserProfile;
  character: string;
  environment: string;
  theme: string;
  wordCount: number;
  language?: string; // 'tr' veya 'en'
}

export class GeminiService {
  private apiKey: string;
  private maxRetries: number = 3;
  private baseUrl: string = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    if (!this.apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
    }
  }

  /**
   * Generates a story using Gemini API with retry mechanism
   */
  async generateStory(params: StoryGenerationParams): Promise<string> {
    const adjustedWordCount = Math.round(params.wordCount * WORD_COUNT_SAFETY_FACTOR);
    
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.maxRetries) {
      try {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const story = await this.callGeminiApi(params, adjustedWordCount);
        return story;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Gemini API attempt ${attempt + 1} failed:`, lastError);
        attempt++;
      }
    }

    throw lastError || new Error("Failed to generate story after multiple attempts");
  }

  /**
   * Makes the actual API call to Gemini
   */
  private async callGeminiApi(params: StoryGenerationParams, adjustedWordCount: number): Promise<string> {
    const prompt = this.createPrompt(params, adjustedWordCount);
    
    // Use authorization header instead of query parameter for API key
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          stopSequences: [],
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error("Invalid response format from Gemini API");
    }

    return data.candidates[0].content.parts[0].text || "";
  }

  /**
   * Creates a detailed prompt for the Gemini API
   */
  private createPrompt(params: StoryGenerationParams, adjustedWordCount: number): string {
    const { userProfile, character, environment, theme, wordCount, language = 'en' } = params;
    
    // Türkçe için farklı prompt kullan
    if (language === 'tr') {
      return `Lütfen ${userProfile.age} yaşındaki bir ${userProfile.gender.toLowerCase()} çocuk olan ${userProfile.name} için uygun, ilgi çekici bir uyku masalı yaz. Hikaye, uyku öncesi çocuklar için uygun olmalıdır.

HİKAYE PARAMETRELERİ:
- Ana Karakter Türü: ${character}
- Ortam/Çevre: ${environment}
- Tema/Ders: ${theme}
- Hikaye Uzunluğu: Yaklaşık ${adjustedWordCount} kelime
- Karakter Tanımı: ${userProfile.gender}, ${userProfile.age} yaşında, ${userProfile.hairColor} ${userProfile.hairType.toLowerCase()} saçlı, ${userProfile.skinTone} ten tonlu

HİKAYE GEREKSİNİMLERİ:
1. Hikayedeki ana karakter çocuğa (${userProfile.name}) benzemelidir.
2. Hikaye nazik, olumlu ve uyku saati için uygun olmalıdır.
3. Anlatım ilgi çekici olmalı ancak uykuya yardımcı olmak için sona doğru sakinleşmelidir.
4. ${userProfile.age} yaşındaki bir çocuk için uygun basit bir dil kullanın.
5. Temayla ilgili yaşa uygun bir ahlaki ders içermelidir.
6. Hikaye net bir başlangıç, orta ve bitiş yapısı ile tutarlı olmalıdır.
7. Korkutucu, şiddet içeren veya rahatsız edici içeriklerden kaçının.

Lütfen SADECE hikaye metnini sağlayın, ek açıklamalar veya notlar olmadan. Anlatım doğal akmalı ve mantıklı paragraflara bölünmelidir.`;
    } else {
      // İngilizce için orjinal prompt (default)
      return `Please write an engaging, age-appropriate bedtime story for a ${userProfile.age}-year-old ${userProfile.gender.toLowerCase()} named ${userProfile.name}. The story should be suitable for children before sleep.

STORY PARAMETERS:
- Main Character Type: ${character}
- Setting/Environment: ${environment}
- Theme/Lesson: ${theme}
- Story Length: Approximately ${adjustedWordCount} words
- Character Description: ${userProfile.gender}, ${userProfile.age} years old, ${userProfile.hairColor} ${userProfile.hairType.toLowerCase()} hair, ${userProfile.skinTone} skin tone

STORY REQUIREMENTS:
1. The main character in the story should resemble the child (${userProfile.name}).
2. The story should be gentle, positive, and appropriate for bedtime.
3. The narrative should be engaging but wind down toward the end to help with sleep.
4. Use simple language appropriate for a ${userProfile.age}-year-old.
5. Include an age-appropriate moral or lesson related to the theme.
6. The story should be cohesive with clear beginning, middle, and end structure.
7. Avoid any scary, violent, or disturbing content.

Please provide ONLY the story text, without any additional explanations or notes. The narrative should flow naturally and be divided into logical paragraphs.`;
    }
  }

  /**
   * Splits the generated text into pages with appropriate word count per page
   */
  splitTextIntoPages(fullText: string, targetWordsPerPage: { min: number, max: number } = { min: 50, max: 60 }): string[] {
    // Split the text into words
    const words = fullText.split(/\s+/);
    const totalWords = words.length;
    
    // Calculate how many pages we need
    const averageWordsPerPage = (targetWordsPerPage.min + targetWordsPerPage.max) / 2;
    const estimatedPages = Math.ceil(totalWords / averageWordsPerPage);
    
    // If we have too few words for the last page, recalculate
    let pages: string[] = [];
    let wordsPerPage: number;
    
    if (estimatedPages <= 1) {
      // Just one page
      pages.push(fullText);
    } else {
      // Calculate optimal words per page to evenly distribute
      wordsPerPage = Math.ceil(totalWords / estimatedPages);
      
      // Ensure we're in the target range
      if (wordsPerPage < targetWordsPerPage.min) {
        wordsPerPage = targetWordsPerPage.min;
      } else if (wordsPerPage > targetWordsPerPage.max) {
        wordsPerPage = targetWordsPerPage.max;
      }
      
      // Split into pages
      for (let i = 0; i < totalWords; i += wordsPerPage) {
        const pageWords = words.slice(i, i + wordsPerPage);
        pages.push(pageWords.join(' '));
      }
      
      // Check if the last page has too few words
      const lastPageWords = pages[pages.length - 1].split(/\s+/).length;
      if (lastPageWords < targetWordsPerPage.min && pages.length > 1) {
        // Recalculate with evenly distributed words
        const newWordsPerPage = Math.ceil(totalWords / (pages.length - 1));
        
        if (newWordsPerPage <= targetWordsPerPage.max) {
          // Redistribute more evenly
          pages = [];
          for (let i = 0; i < totalWords; i += newWordsPerPage) {
            const pageWords = words.slice(i, i + newWordsPerPage);
            pages.push(pageWords.join(' '));
          }
        } else {
          // Keep the original split but merge the last page with the second-to-last
          const lastPage = pages.pop() || '';
          const secondLastPage = pages.pop() || '';
          pages.push(secondLastPage + ' ' + lastPage);
        }
      }
    }
    
    return pages;
  }
}

export const geminiService = new GeminiService();
