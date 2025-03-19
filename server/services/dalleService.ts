import { UserProfile } from "@shared/schema";

interface ImageGenerationParams {
  userProfile: UserProfile;
  pageText: string;
  character: string;
  environment: string;
  theme: string;
  pageNumber: number;
}

export class DalleService {
  private apiKey: string;
  private maxRetries: number = 3;
  private baseUrl: string = "https://api.openai.com/v1/images/generations";

  constructor() {
    this.apiKey = process.env.DALLE_API_KEY || "";
    if (!this.apiKey) {
      console.error("DALLE_API_KEY environment variable is not set");
    }
  }

  /**
   * Generates an image using DALL-E API with retry mechanism
   */
  async generateImage(params: ImageGenerationParams): Promise<string> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.maxRetries) {
      try {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const imageUrl = await this.callDalleApi(params);
        return imageUrl;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`DALL-E API attempt ${attempt + 1} failed:`, lastError);
        attempt++;
      }
    }

    throw (
      lastError || new Error("Failed to generate image after multiple attempts")
    );
  }

  /**
   * Makes the actual API call to DALL-E
   */
  private async callDalleApi(params: ImageGenerationParams): Promise<string> {
    const prompt = this.createPrompt(params);

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DALL-E API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0 || !data.data[0].url) {
      throw new Error("Invalid response format from DALL-E API");
    }

    return data.data[0].url;
  }

  /**
   * Creates a detailed prompt for the DALL-E API
   */
  private createPrompt(params: ImageGenerationParams): string {
    const { userProfile, pageText, character, environment, theme, pageNumber } =
      params;

    return `Create a charming, high-quality children's book illustration for a bedtime story with NO TEXT OR WORDS visible in the image.

The scene depicts: "${pageText}"

The main character is a ${userProfile.age}-year-old ${userProfile.gender.toLowerCase()} named ${userProfile.name} with ${userProfile.hairColor.toLowerCase()} ${userProfile.hairType.toLowerCase()} hair and ${userProfile.skinTone.toLowerCase()} skin tone. The character is portrayed as a ${character} in a ${environment} setting.

The illustration should:
- Have a warm, soothing color palette suitable for bedtime
- Be in a gentle, child-friendly cartoon style
- Convey the theme of "${theme}"
- Be highly detailed but not overwhelming
- Include soft lighting and a dreamy quality
- Be appropriate for young children
- IMPORTANT: Contain NO text, words, or lettering of any kind

Use a style that's appropriate for children's books with soft edges and friendly characters. This is page ${pageNumber} of a bedtime story, so the image should match the mood of the text.`;
  }
}

export const dalleService = new DalleService();
