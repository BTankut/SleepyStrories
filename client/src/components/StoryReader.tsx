import { useState, useRef, useEffect } from 'react';
import { CompleteStory } from '@shared/schema';
import { useFavorites } from '@/hooks/useFavorites';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/lib/AppContext';
import { ArrowLeft, Heart, User, ArrowLeftCircle, ArrowRightCircle, Pause, Play, Music } from 'lucide-react';

interface StoryReaderProps {
  story: CompleteStory;
  onClose: () => void;
}

const StoryReader = ({ story, onClose }: StoryReaderProps) => {
  const { t, language } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { isFavorite, addToFavorites, removeFromFavorites, getFavoriteByStoryId } = useFavorites();
  const isMobile = useIsMobile();
  
  const currentPageData = story.pages[currentPage];
  const isStoryFavorite = isFavorite(story.id);
  const favoriteId = getFavoriteByStoryId(story.id)?.id;
  
  // Track the current audio URL to detect changes
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Immediately reset states when page changes
    setAudioLoaded(false);
    setAudioProgress(0);
    setAudioError(false);
    setIsPlaying(false);

    // Update current audio URL tracking
    if (currentPageData?.audioUrl && currentPageData.audioUrl !== currentAudioUrl) {
      setCurrentAudioUrl(currentPageData.audioUrl);
    }

    const handleLoadedMetadata = () => {
      console.log("Audio loaded metadata successfully");
      setAudioLoaded(true);
      setAudioDuration(audio.duration);
      setAudioError(false);
    };
    
    const handleTimeUpdate = () => {
      setAudioProgress(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      audio.currentTime = 0;
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      console.log("Audio playing");
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      console.log("Audio paused");
    };
    
    const handleError = (e: any) => {
      console.error("Audio error:", e);
      setAudioLoaded(false);
      setIsPlaying(false);
      setAudioError(true);
    };

    const handleCanPlay = () => {
      console.log("Audio can play now");
      setAudioLoaded(true);
      setAudioError(false);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    // Force reload the audio element with a delay to ensure DOM update
    setTimeout(() => {
      if (audio && currentPageData?.audioUrl) {
        // Clear existing source
        while (audio.firstChild) {
          audio.removeChild(audio.firstChild);
        }

        // Create new source element with the current page audio
        const source = document.createElement('source');
        source.src = currentPageData.audioUrl;
        source.type = 'audio/mpeg';
        audio.appendChild(source);

        console.log("Loading audio URL:", currentPageData.audioUrl);
        audio.load();
      }
    }, 100);
    
    return () => {
      // Clean up event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentPage, currentPageData, toast, language, currentAudioUrl]);
  
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Play error:", error);
      });
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioLoaded) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setAudioProgress(newTime);
  };
  
  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card px-4 py-3 shadow-md flex items-center justify-between">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors" title={t('reader.back_to_menu')}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            {story.userProfile.name} {t('reader.profile_story')} - {t('reader.page')} {currentPage + 1}/{story.pages.length}
          </div>
          <div className="flex items-center">
            <button 
              className={`p-2 rounded-full hover:bg-muted transition-colors ${isStoryFavorite ? 'text-red-500' : 'text-gray-400'}`}
              onClick={() => {
                if (isStoryFavorite && favoriteId) {
                  removeFromFavorites(favoriteId);
                } else {
                  addToFavorites({ 
                    storyId: story.id,
                    userProfileId: story.userProfileId,
                    character: story.character,
                    environment: story.environment,
                    theme: story.theme,
                    firstPageThumbnail: story.pages[0]?.imageUrl
                  });
                }
              }}
              title={isStoryFavorite ? t('favorites.remove') : t('favorites.add')}
            >
              <Heart className="h-5 w-5" fill={isStoryFavorite ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={() => {
                const confirmGoHome = window.confirm(t('reader.confirm_back_to_menu'));
                if (confirmGoHome) onClose();
              }} 
              className="p-2 rounded-full hover:bg-muted transition-colors text-sm"
              title={t('reader.back_to_menu')}
            >
              {t('reader.menu')}
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Story Pages */}
            <div className="flex-1 overflow-hidden relative">
              {story.pages.map((page, index) => (
                <div 
                  key={page.id}
                  className={`absolute inset-0 transition-transform duration-300 ${
                    currentPage === index ? 'translate-x-0' : currentPage > index ? '-translate-x-full' : 'translate-x-full'
                  }`}
                  style={{ height: '100%' }}
                >
                  <div className={`h-full flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
                    {/* Image Section */}
                    <div className={`${isMobile ? 'h-1/2 w-full' : 'h-full w-1/2'} flex-shrink-0 relative p-4`}>
                      <div className="w-full h-full rounded-lg shadow-md border border-primary/20 overflow-hidden bg-card">
                        {page.imageUrl && (
                          <img 
                            src={page.imageUrl} 
                            alt={`${story.character}`}
                            className="w-full h-full object-contain bg-card/50" 
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Text Section */}
                    <div className={`${isMobile ? 'h-1/2 w-full' : 'h-full w-1/2'} p-4 overflow-y-auto`}>
                      <div className="max-w-md mx-auto space-y-6">
                        <div className="bg-card p-6 rounded-lg shadow-md border border-primary/20">
                          <p className="text-lg leading-relaxed">{page.text}</p>
                        </div>
                        
                        {/* Audio Player */}
                        <div className="bg-card p-4 rounded-lg shadow-md border border-primary/20">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Music className="h-4 w-4 mr-1" /> {t('reader.audio')}
                          </h4>
                          
                          {currentPage === index && page.audioUrl && (
                            <audio 
                              ref={audioRef} 
                              preload="auto" 
                              hidden
                              crossOrigin="anonymous"
                            >
                              <source src={page.audioUrl} type="audio/mpeg" />
                            </audio>
                          )}
                          
                          {!audioLoaded && !audioError && (
                            <div className="text-sm text-muted-foreground">
                              {t('reader.audio.loading')}
                            </div>
                          )}
                          
                          {audioError && (
                            <div className="text-sm text-destructive">
                              {t('reader.audio.error.title')}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={toggleAudioPlayback}
                              disabled={!audioLoaded}
                              className="bg-primary/10 p-3 rounded-full"
                            >
                              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            
                            <input 
                              type="range" 
                              min="0" 
                              max={audioDuration || 100}
                              value={audioProgress}
                              onChange={handleProgressChange}
                              className="w-full"
                              disabled={!audioLoaded} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation */}
            <div className="p-4 bg-card shadow-md flex justify-between items-center">
              <button 
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="p-2 bg-primary/10 rounded-full flex items-center"
                title={t('reader.back')}
              >
                <ArrowLeftCircle size={24} />
              </button>
              
              <div className="flex space-x-2">
                {story.pages.map((_, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full cursor-pointer ${
                      currentPage === i ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => setCurrentPage(i)}
                    title={`${t('reader.page')} ${i + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={handleNextPage}
                disabled={currentPage === story.pages.length - 1}
                className="p-2 bg-primary/10 rounded-full flex items-center"
              >
                <ArrowRightCircle size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;