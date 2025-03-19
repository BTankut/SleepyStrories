import { useFavorites } from '@/hooks/useFavorites';
import { CompleteFavorite } from '@shared/schema';
import { format } from 'date-fns';
import { useApp } from '@/lib/AppContext';
import { Trash2, Heart, Book } from 'lucide-react';
import { tr, enUS } from 'date-fns/locale';

interface FavoritesTabProps {
  favorites: CompleteFavorite[];
  isLoading: boolean;
  onReadStory: (favorite: CompleteFavorite) => void;
}

const FavoritesTab = ({ favorites, isLoading, onReadStory }: FavoritesTabProps) => {
  const { removeFromFavorites, isRemoving } = useFavorites();
  const { t, language } = useApp();
  
  const dateLocale = language === 'tr' ? tr : enUS;

  const handleDeleteFavorite = (id: number, event: React.MouseEvent) => {
    // Prevent event bubbling (to avoid triggering onReadStory)
    event.stopPropagation();
    
    if (window.confirm(language === 'tr' 
      ? 'Bu hikayeyi favorilerinizden çıkarmak istediğinize emin misiniz?' 
      : 'Are you sure you want to remove this story from your favorites?')) {
      removeFromFavorites(id);
    }
  };

  if (isLoading || isRemoving) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">{t('favorites.title')}</h2>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {favorites.length}
        </span>
      </div>
      
      {/* Favorites List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div 
              key={favorite.id} 
              className="bg-card rounded-lg shadow-md overflow-hidden border border-border/50 transition-all hover:shadow-lg cursor-pointer"
              onClick={() => onReadStory(favorite)}
            >
              <div className="relative aspect-video">
                {favorite.firstPageThumbnail ? (
                  <img 
                    src={favorite.firstPageThumbnail} 
                    alt={language === 'tr' ? "Hikaye kapağı" : "Story cover"} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  favorite.story.pages[0]?.imageUrl ? (
                    <img 
                      src={favorite.story.pages[0].imageUrl} 
                      alt={language === 'tr' ? "Hikaye kapağı" : "Story cover"} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Book className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-muted flex items-center justify-center">
                        {favorite.story.userProfile.thumbnail ? (
                          <img 
                            src={favorite.story.userProfile.thumbnail} 
                            alt={language === 'tr' ? "Profil resmi" : "Profile picture"}  
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <svg className="h-4 w-4 text-foreground/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <p className="font-heading font-medium text-sm">
                        {favorite.story.userProfile.name}{language === 'tr' ? "'nin Hikayesi" : "'s Story"}
                      </p>
                    </div>
                    <h3 className="font-heading font-semibold text-xl">
                      {favorite.character} {favorite.theme}
                    </h3>
                    <p className="text-sm opacity-90">{favorite.environment}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button 
                    className="p-2 bg-card/80 backdrop-blur-sm rounded-full text-red-400 hover:bg-card/95 transition-colors"
                    onClick={(e) => handleDeleteFavorite(favorite.id, e)}
                    title={t('favorites.remove')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-foreground/80 line-clamp-2 font-story">
                  {favorite.story.pages[0]?.text || (language === 'tr' ? 'Hikaye bulunamadı.' : 'Story not found.')}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(favorite.timestamp), 
                      language === 'tr' ? 'd MMMM yyyy' : 'MMM d, yyyy', 
                      { locale: dateLocale }
                    )}
                  </p>
                  <button 
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                  >
                    <Book className="h-3 w-3 mr-1" />
                    {language === 'tr' ? 'Oku' : 'Read'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-10 px-6 bg-card rounded-lg shadow-md border border-border/50">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-medium text-lg text-foreground mb-2">
                {t('favorites.empty')}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                {language === 'tr' 
                  ? 'Hikayeler oluşturduktan sonra en beğendiklerinizi favorilere ekleyebilirsiniz.' 
                  : 'After creating stories, you can add your favorites to this list.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesTab;
