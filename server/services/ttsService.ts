import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as util from 'util';
import * as crypto from 'crypto';
import * as path from 'path';

interface TTSParams {
  text: string;
  voiceName: string;
  outputPath: string;
}

export class TTSService {
  private client: TextToSpeechClient;
  private maxRetries: number = 3;
  private outputDir: string = path.join(process.cwd(), 'dist', 'public', 'audio');

  constructor() {
    try {
      // Initialize with credentials from environment
      // Check if the GOOGLE_APPLICATION_CREDENTIALS env var is set
      const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      if (googleCredentialsPath && fs.existsSync(googleCredentialsPath)) {
        // Use credentials specified in environment variable
        this.client = new TextToSpeechClient({
          keyFilename: googleCredentialsPath
        });
        console.log("TTSService initialized using GOOGLE_APPLICATION_CREDENTIALS environment variable");
      } else {
        // Fall back to default credentials if available
        this.client = new TextToSpeechClient();
        console.log("TTSService initialized using default credentials");
      }
      
      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to initialize Google TTS client:", error);
      throw error;
    }
  }

  /**
   * Converts text to speech using Google Cloud TTS with retry mechanism
   */
  async convertTextToSpeech(text: string, voiceName: string): Promise<string> {
    try {
      // Generate a unique filename based on hash of text and voice
      const hash = crypto.createHash('md5').update(`${text}-${voiceName}`).digest('hex');
      const filename = `${hash}.mp3`;
      const outputPath = path.join(this.outputDir, filename);
      const publicPath = `/audio/${filename}`;
      
      console.log(`TTS request: voice=${voiceName}, hash=${hash}, output=${outputPath}`);
      
      // Check if file already exists (cache hit)
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          console.log(`TTS cache hit: ${outputPath}, size=${stats.size} bytes`);
          return publicPath;
        } else {
          console.log(`Found empty TTS file, regenerating: ${outputPath}`);
          // File exists but is empty - regenerate it
          fs.unlinkSync(outputPath);
        }
      }
      
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt < this.maxRetries) {
        try {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          if (attempt > 0) {
            console.log(`TTS retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms delay`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          await this.generateAndSaveAudio({ text, voiceName, outputPath });
          console.log(`TTS generation successful: ${publicPath}`);
          return publicPath;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`TTS API attempt ${attempt + 1} failed:`, lastError);
          attempt++;
        }
      }

      throw lastError || new Error("Failed to generate audio after multiple attempts");
    } catch (error) {
      console.error("TTS conversion failed:", error);
      throw error;
    }
  }

  /**
   * Makes the actual API call and saves the audio file
   */
  private async generateAndSaveAudio(params: TTSParams): Promise<void> {
    const { text, voiceName, outputPath } = params;
    
    try {
      console.log(`Generating TTS audio for voice: ${voiceName}, text length: ${text.length} chars`);
      
      // Extract language code from voice name (e.g., 'tr-TR-Standard-A' -> 'tr-TR')
      const languageCode = voiceName.split('-').slice(0, 2).join('-');
      console.log(`Using language code: ${languageCode} from voice: ${voiceName}`);
      
      const request = {
        input: { text },
        voice: {
          name: voiceName,
          languageCode: languageCode,
        },
        audioConfig: { audioEncoding: 'MP3' as const },
      };

      const [response] = await this.client.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error("No audio content returned from TTS API");
      }
      
      // Ensure output directory exists (in case it was deleted)
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Check file system permissions by writing a small test file first
      const testFilePath = path.join(outputDir, '.test-write-permission');
      try {
        fs.writeFileSync(testFilePath, 'test', { flag: 'w' });
        fs.unlinkSync(testFilePath); // Clean up test file
      } catch (err: any) {
        console.error(`Failed permission test for output directory ${outputDir}:`, err);
        throw new Error(`Cannot write to output directory: ${err.message || String(err)}`);
      }
      
      // Write the actual audio file
      const writeFile = util.promisify(fs.writeFile);
      await writeFile(outputPath, response.audioContent, 'binary');
      
      console.log(`Successfully wrote audio file to: ${outputPath}`);
      
      // Verify file was written
      if (!fs.existsSync(outputPath)) {
        throw new Error(`Audio file was not written to disk: ${outputPath}`);
      }
      
      const stats = fs.statSync(outputPath);
      console.log(`Audio file size: ${stats.size} bytes`);
      
    } catch (error) {
      console.error(`TTS generation failed for voice ${voiceName}:`, error);
      throw error;
    }
  }
}

export const ttsService = new TTSService();
