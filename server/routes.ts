import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService } from "./services/geminiService";
import { dalleService } from "./services/dalleService";
import { ttsService } from "./services/ttsService";
import { 
  insertUserProfileSchema,
  storyGenerationSchema,
  insertFavoriteStorySchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("API error:", error);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  };

  // User Profiles API
  app.get("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getUserProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Failed to get profiles:", error);
      res.status(500).json({ message: "Failed to get profiles" });
    }
  });

  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getUserProfile(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Failed to get profile:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.post("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getUserProfiles();
      
      if (profiles.length >= 5) {
        return res.status(400).json({ message: "Maximum of 5 profiles allowed" });
      }
      
      const validatedData = insertUserProfileSchema.parse(req.body);
      const newProfile = await storage.createUserProfile(validatedData);
      
      res.status(201).json(newProfile);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.delete("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUserProfile(id);
      
      if (!success) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Failed to delete profile:", error);
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // Stories API
  app.get("/api/stories", async (req: Request, res: Response) => {
    try {
      const userProfileId = req.query.userProfileId ? parseInt(req.query.userProfileId as string) : undefined;
      const stories = await storage.getStories(userProfileId);
      res.json(stories);
    } catch (error) {
      console.error("Failed to get stories:", error);
      res.status(500).json({ message: "Failed to get stories" });
    }
  });

  app.get("/api/stories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getCompleteStory(id);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Failed to get story:", error);
      res.status(500).json({ message: "Failed to get story" });
    }
  });

  // Utility to process API calls with rate limiting
  const processWithRateLimit = async <T>(
    tasks: Array<() => Promise<T>>, 
    concurrencyLimit: number = 2
  ): Promise<T[]> => {
    const results: T[] = [];
    const pendingTasks = [...tasks];
    
    const runTask = async (taskIndex: number) => {
      if (taskIndex >= pendingTasks.length) return;
      
      try {
        const result = await pendingTasks[taskIndex]();
        results[taskIndex] = result;
      } catch (error) {
        console.error(`Task ${taskIndex} failed:`, error);
        throw error;
      }
      
      // Process next task
      return runTask(taskIndex + concurrencyLimit);
    };
    
    // Start initial batch of tasks based on concurrency limit
    const initialBatch = Array.from(
      { length: Math.min(concurrencyLimit, pendingTasks.length) }, 
      (_, i) => runTask(i)
    );
    
    await Promise.all(initialBatch);
    return results;
  };
  
  // Generate a new story with optimized performance
  app.post("/api/stories/generate", async (req: Request, res: Response) => {
    let generationStartTime = Date.now();
    try {
      const validatedData = storyGenerationSchema.parse(req.body);
      const { userProfileId, character, environment, theme, wordCount, ttsVoice, language } = validatedData;
      
      console.log(`Starting story generation for user profile ${userProfileId} in language: ${language || 'en'}`);
      
      // Get user profile
      const userProfile = await storage.getUserProfile(userProfileId);
      if (!userProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      // Generate story text
      console.log(`Generating story text with Gemini API...`);
      const textStartTime = Date.now();
      const fullText = await geminiService.generateStory({
        userProfile,
        character,
        environment,
        theme,
        wordCount,
        language
      });
      console.log(`Story text generation completed in ${(Date.now() - textStartTime) / 1000}s`);
      
      // Create the story record
      const story = await storage.createStory({
        fullText,
        userProfileId,
        character,
        environment,
        theme,
        requestedWordCount: wordCount
      });
      
      // Split text into pages
      const pageTexts = geminiService.splitTextIntoPages(fullText);
      console.log(`Story split into ${pageTexts.length} pages`);
      
      // First create placeholder pages to show progress to user
      const placeholderPages = await Promise.all(
        pageTexts.map(async (pageText, index) => {
          return await storage.createStoryPage({
            text: pageText,
            imageUrl: null,
            audioUrl: null,
            pageNumber: index + 1,
            storyId: story.id
          });
        })
      );
      
      // Create tasks for image generation and TTS (controlled parallelism)
      const imageGenerationTasks = pageTexts.map((pageText, index) => async () => {
        console.log(`Generating image for page ${index + 1}...`);
        const imageStartTime = Date.now();
        const imageUrl = await dalleService.generateImage({
          userProfile,
          pageText,
          character,
          environment,
          theme,
          pageNumber: index + 1
        });
        console.log(`Image for page ${index + 1} generated in ${(Date.now() - imageStartTime) / 1000}s`);
        
        // Update the page with the image URL
        const updatedPage = await storage.updateStoryPage(placeholderPages[index].id, {
          imageUrl
        });
        
        return { id: updatedPage.id, imageUrl };
      });
      
      // Start image generation with controlled concurrency
      console.log(`Starting image generation for ${pageTexts.length} pages with rate limiting...`);
      const imagesStartTime = Date.now();
      const imageResults = await processWithRateLimit(imageGenerationTasks, 2);
      console.log(`All images generated in ${(Date.now() - imagesStartTime) / 1000}s`);
      
      // Generate audio for all pages (can run more concurrently as TTS is faster)
      console.log(`Starting audio generation for ${pageTexts.length} pages...`);
      const audioStartTime = Date.now();
      const audioTasks = pageTexts.map((pageText, index) => async () => {
        console.log(`Generating audio for page ${index + 1}...`);
        const audioUrl = await ttsService.convertTextToSpeech(pageText, ttsVoice);
        
        // Update the page with the audio URL
        const updatedPage = await storage.updateStoryPage(placeholderPages[index].id, {
          audioUrl
        });
        
        return { id: updatedPage.id, audioUrl };
      });
      
      const audioResults = await processWithRateLimit(audioTasks, 4);
      console.log(`All audio generated in ${(Date.now() - audioStartTime) / 1000}s`);
      
      // Get the complete story with all updated pages
      const completeStory = await storage.getCompleteStory(story.id);
      
      if (!completeStory) {
        throw new Error(`Failed to retrieve complete story after generation`);
      }
      
      // Return the complete story with pages
      console.log(`Story generation completed in ${(Date.now() - generationStartTime) / 1000}s`);
      res.status(201).json(completeStory);
    } catch (error) {
      console.error(`Story generation failed after ${(Date.now() - generationStartTime) / 1000}s:`, error);
      handleZodError(error, res);
    }
  });

  // Favorite Stories API
  app.get("/api/favorites", async (req: Request, res: Response) => {
    try {
      const userProfileId = req.query.userProfileId ? parseInt(req.query.userProfileId as string) : undefined;
      const favorites = await storage.getCompleteFavorites(userProfileId);
      res.json(favorites);
    } catch (error) {
      console.error("Failed to get favorite stories:", error);
      res.status(500).json({ message: "Failed to get favorite stories" });
    }
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFavoriteStorySchema.parse(req.body);
      
      // Check if we're at the limit of 5 favorites per user
      const userFavorites = await storage.getFavoriteStories(validatedData.userProfileId);
      if (userFavorites.length >= 5) {
        return res.status(400).json({ message: "Maximum of 5 favorite stories allowed per user" });
      }
      
      // Get the story to verify it exists and get thumbnail
      const story = await storage.getCompleteStory(validatedData.storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      // Get the first page's image as thumbnail
      const firstPage = story.pages.find(page => page.pageNumber === 1);
      
      const newFavorite = await storage.createFavoriteStory({
        ...validatedData,
        firstPageThumbnail: firstPage?.imageUrl
      });
      
      res.status(201).json(newFavorite);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.delete("/api/favorites/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFavoriteStory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite story not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Failed to delete favorite story:", error);
      res.status(500).json({ message: "Failed to delete favorite story" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
