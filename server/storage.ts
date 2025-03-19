import { 
  UserProfile, 
  InsertUserProfile, 
  Story, 
  InsertStory,
  StoryPage,
  InsertStoryPage,
  FavoriteStory,
  InsertFavoriteStory,
  CompleteStory,
  CompleteFavorite
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User Profile methods
  getUserProfiles(): Promise<UserProfile[]>;
  getUserProfile(id: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  deleteUserProfile(id: number): Promise<boolean>;
  
  // Story methods
  getStories(userProfileId?: number): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
  getCompleteStory(id: number): Promise<CompleteStory | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  
  // Story Page methods
  getStoryPages(storyId: number): Promise<StoryPage[]>;
  createStoryPage(page: InsertStoryPage): Promise<StoryPage>;
  updateStoryPage(id: number, updates: Partial<Pick<StoryPage, 'imageUrl' | 'audioUrl'>>): Promise<StoryPage>;
  
  // Favorite Story methods
  getFavoriteStories(userProfileId?: number): Promise<FavoriteStory[]>;
  getCompleteFavorites(userProfileId?: number): Promise<CompleteFavorite[]>;
  getFavoriteStory(id: number): Promise<FavoriteStory | undefined>;
  createFavoriteStory(favorite: InsertFavoriteStory): Promise<FavoriteStory>;
  deleteFavoriteStory(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private userProfiles: Map<number, UserProfile>;
  private stories: Map<number, Story>;
  private storyPages: Map<number, StoryPage>;
  private favoriteStories: Map<number, FavoriteStory>;
  private userProfileId: number;
  private storyId: number;
  private storyPageId: number;
  private favoriteStoryId: number;

  constructor() {
    this.userProfiles = new Map();
    this.stories = new Map();
    this.storyPages = new Map();
    this.favoriteStories = new Map();
    this.userProfileId = 1;
    this.storyId = 1;
    this.storyPageId = 1;
    this.favoriteStoryId = 1;
  }

  // User Profile methods
  async getUserProfiles(): Promise<UserProfile[]> {
    return Array.from(this.userProfiles.values());
  }

  async getUserProfile(id: number): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = this.userProfileId++;
    const userProfile: UserProfile = {
      ...profile,
      id,
      creationDate: new Date(),
      thumbnail: profile.thumbnail || null
    };
    this.userProfiles.set(id, userProfile);
    return userProfile;
  }

  async deleteUserProfile(id: number): Promise<boolean> {
    return this.userProfiles.delete(id);
  }

  // Story methods
  async getStories(userProfileId?: number): Promise<Story[]> {
    const stories = Array.from(this.stories.values());
    if (userProfileId) {
      return stories.filter(story => story.userProfileId === userProfileId);
    }
    return stories;
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getCompleteStory(id: number): Promise<CompleteStory | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const pages = await this.getStoryPages(id);
    const userProfile = await this.getUserProfile(story.userProfileId);

    if (!userProfile) return undefined;

    return {
      ...story,
      pages: pages.sort((a, b) => a.pageNumber - b.pageNumber),
      userProfile
    };
  }

  async createStory(story: InsertStory): Promise<Story> {
    const id = this.storyId++;
    const newStory: Story = {
      ...story,
      id,
      creationDate: new Date()
    };
    this.stories.set(id, newStory);
    return newStory;
  }

  // Story Page methods
  async getStoryPages(storyId: number): Promise<StoryPage[]> {
    return Array.from(this.storyPages.values())
      .filter(page => page.storyId === storyId);
  }

  async createStoryPage(page: InsertStoryPage): Promise<StoryPage> {
    const id = this.storyPageId++;
    const storyPage: StoryPage = {
      ...page,
      id,
      imageUrl: page.imageUrl || null,
      audioUrl: page.audioUrl || null
    };
    this.storyPages.set(id, storyPage);
    return storyPage;
  }
  
  async updateStoryPage(id: number, updates: Partial<Pick<StoryPage, 'imageUrl' | 'audioUrl'>>): Promise<StoryPage> {
    const existingPage = this.storyPages.get(id);
    
    if (!existingPage) {
      throw new Error(`Story page with id ${id} not found`);
    }
    
    const updatedPage: StoryPage = {
      ...existingPage,
      ...updates,
      imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : existingPage.imageUrl,
      audioUrl: updates.audioUrl !== undefined ? updates.audioUrl : existingPage.audioUrl
    };
    
    this.storyPages.set(id, updatedPage);
    return updatedPage;
  }

  // Favorite Story methods
  async getFavoriteStories(userProfileId?: number): Promise<FavoriteStory[]> {
    const favorites = Array.from(this.favoriteStories.values());
    if (userProfileId) {
      return favorites.filter(favorite => favorite.userProfileId === userProfileId);
    }
    return favorites;
  }

  async getCompleteFavorites(userProfileId?: number): Promise<CompleteFavorite[]> {
    const favorites = await this.getFavoriteStories(userProfileId);
    const completeFavorites: CompleteFavorite[] = [];

    for (const favorite of favorites) {
      const story = await this.getCompleteStory(favorite.storyId);
      if (story) {
        completeFavorites.push({
          ...favorite,
          story
        });
      }
    }

    return completeFavorites;
  }

  async getFavoriteStory(id: number): Promise<FavoriteStory | undefined> {
    return this.favoriteStories.get(id);
  }

  async createFavoriteStory(favorite: InsertFavoriteStory): Promise<FavoriteStory> {
    const id = this.favoriteStoryId++;
    const newFavorite: FavoriteStory = {
      ...favorite,
      id,
      timestamp: new Date(),
      firstPageThumbnail: favorite.firstPageThumbnail || null
    };
    this.favoriteStories.set(id, newFavorite);
    return newFavorite;
  }

  async deleteFavoriteStory(id: number): Promise<boolean> {
    return this.favoriteStories.delete(id);
  }
}

export const storage = new MemStorage();
