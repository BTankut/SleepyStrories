import { useState } from 'react';
import ProfilesTab from '@/components/ProfilesTab';
import StoryCreationTab from '@/components/StoryCreationTab';
import FavoritesTab from '@/components/FavoritesTab';
import StoryReader from '@/components/StoryReader';
import SettingsButton from '@/components/SettingsButton';
import { UserProfile, CompleteStory, CompleteFavorite } from '@shared/schema';
import { useProfiles } from '@/hooks/useProfiles';
import { useStories } from '@/hooks/useStories';
import { useFavorites } from '@/hooks/useFavorites';
import { useApp } from '@/lib/AppContext';

type TabType = 'profiles' | 'create' | 'favorites';

const Home = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profiles');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [currentStory, setCurrentStory] = useState<CompleteStory | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  
  const { t } = useApp();
  const { profiles, isLoading: isLoadingProfiles } = useProfiles();
  const { generateStory, isGenerating } = useStories();
  const { favorites, isLoading: isLoadingFavorites } = useFavorites();

  const handleProfileSelect = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setActiveTab('create');
  };
  
  const handleStoryComplete = (story: CompleteStory) => {
    setCurrentStory(story);
    setIsReaderOpen(true);
  };
  
  const handleReadFavorite = (favorite: CompleteFavorite) => {
    setCurrentStory(favorite.story);
    setIsReaderOpen(true);
  };
  
  const handleCloseReader = () => {
    setIsReaderOpen(false);
  };

  return (
    <div className="flex flex-col h-screen app-container text-foreground font-body">
      {/* App Header */}
      <header className="bg-card py-4 px-6 shadow-md border-b border-primary/20">
        <div className="flex justify-between items-center">
          <h1 className="font-heading font-bold text-2xl text-primary">
            <span className="material-icons align-middle mr-2">auto_stories</span>
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-2">
            <SettingsButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-primary/20 pb-1">
            <button 
              onClick={() => setActiveTab('profiles')}
              className={`py-2 px-4 font-medium border-b-2 rounded-t-lg transition-all ${
                activeTab === 'profiles' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {t('profile.select')}
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`py-2 px-4 font-medium border-b-2 rounded-t-lg transition-all ${
                activeTab === 'create' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {t('story.create')}
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-4 font-medium border-b-2 rounded-t-lg transition-all ${
                activeTab === 'favorites' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {t('favorites.title')}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'profiles' && (
          <ProfilesTab 
            profiles={profiles} 
            isLoading={isLoadingProfiles}
            onProfileSelect={handleProfileSelect}
          />
        )}
        
        {activeTab === 'create' && (
          <StoryCreationTab 
            selectedProfile={selectedProfile}
            isGenerating={isGenerating}
            onStoryComplete={handleStoryComplete}
            onChangeProfile={() => setActiveTab('profiles')}
            generateStory={generateStory}
          />
        )}
        
        {activeTab === 'favorites' && (
          <FavoritesTab 
            favorites={favorites}
            isLoading={isLoadingFavorites}
            onReadStory={handleReadFavorite}
          />
        )}

        {/* Story Reader (only shown when a story is being read) */}
        {isReaderOpen && currentStory && (
          <StoryReader 
            story={currentStory}
            onClose={handleCloseReader}
          />
        )}
      </main>
    </div>
  );
};

export default Home;
