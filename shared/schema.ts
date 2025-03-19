import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile schema
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  age: integer("age").notNull(),
  hairColor: text("hair_color").notNull(),
  hairType: text("hair_type").notNull(),
  skinTone: text("skin_tone").notNull(),
  creationDate: timestamp("creation_date").defaultNow().notNull(),
  thumbnail: text("thumbnail"),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  creationDate: true,
});

// Story page schema
export const storyPages = pgTable("story_pages", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  pageNumber: integer("page_number").notNull(),
  storyId: integer("story_id").notNull(),
});

export const insertStoryPageSchema = createInsertSchema(storyPages).omit({
  id: true,
});

// Story schema
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  fullText: text("full_text").notNull(),
  userProfileId: integer("user_profile_id").notNull(),
  character: text("character").notNull(),
  environment: text("environment").notNull(),
  theme: text("theme").notNull(),
  requestedWordCount: integer("requested_word_count").notNull(),
  creationDate: timestamp("creation_date").defaultNow().notNull(),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  creationDate: true,
});

// Favorite stories schema
export const favoriteStories = pgTable("favorite_stories", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  userProfileId: integer("user_profile_id").notNull(),
  character: text("character").notNull(),
  environment: text("environment").notNull(),
  theme: text("theme").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  firstPageThumbnail: text("first_page_thumbnail"),
});

export const insertFavoriteStorySchema = createInsertSchema(favoriteStories).omit({
  id: true,
  timestamp: true,
});

// API Request Schemas
export const storyGenerationSchema = z.object({
  userProfileId: z.number(),
  character: z.string(),
  environment: z.string(),
  theme: z.string(),
  wordCount: z.number().min(100).max(500),
  ttsVoice: z.string(),
  language: z.enum(['en', 'tr']).optional().default('en')
});

// Response types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type StoryPage = typeof storyPages.$inferSelect;
export type InsertStoryPage = z.infer<typeof insertStoryPageSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type FavoriteStory = typeof favoriteStories.$inferSelect;
export type InsertFavoriteStory = z.infer<typeof insertFavoriteStorySchema>;

export type StoryGenerationRequest = z.infer<typeof storyGenerationSchema>;

// Complete story with pages
export type CompleteStory = Story & {
  pages: StoryPage[];
  userProfile: UserProfile;
};

// Complete favorite with story details
export type CompleteFavorite = FavoriteStory & {
  story: CompleteStory;
};
