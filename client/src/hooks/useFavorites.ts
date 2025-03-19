import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { CompleteFavorite, InsertFavoriteStory } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/lib/AppContext';

export function useFavorites(userProfileId?: number) {
  const { toast } = useToast();
  const { language, t } = useApp();
  
  // Get all favorites or filtered by user profile
  const {
    data: favorites = [],
    isLoading,
    error,
    refetch
  } = useQuery<CompleteFavorite[]>({
    queryKey: ['/api/favorites', userProfileId ? userProfileId.toString() : 'all'],
    queryFn: async ({ queryKey }) => {
      const url = userProfileId 
        ? `/api/favorites?userProfileId=${userProfileId}` 
        : '/api/favorites';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(language === 'tr' ? 'Favoriler getirilemedi' : 'Failed to fetch favorites');
      return res.json();
    }
  });

  // Add a story to favorites
  const {
    mutate: addToFavorites,
    isPending: isAdding
  } = useMutation({
    mutationFn: async (data: InsertFavoriteStory) => {
      const res = await apiRequest('POST', '/api/favorites', data);
      return res.json() as Promise<CompleteFavorite>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: language === 'tr' ? "Favorilere eklendi" : "Added to favorites",
        description: language === 'tr' ? "Hikaye favorilere eklendi." : "Story was added to favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: language === 'tr' ? "Hata" : "Error",
        description: language === 'tr' 
          ? `Favorilere eklenemedi: ${error.message}` 
          : `Failed to add to favorites: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Remove a story from favorites
  const {
    mutate: removeFromFavorites,
    isPending: isRemoving
  } = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Deleting favorite with ID: ${id}`);
      await apiRequest('DELETE', `/api/favorites/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      refetch(); // Immediately refetch to update UI
      toast({
        title: language === 'tr' ? "Favorilerden çıkarıldı" : "Removed from favorites",
        description: language === 'tr' 
          ? "Hikaye favorilerden çıkarıldı." 
          : "Story was removed from favorites.",
      });
    },
    onError: (error) => {
      console.error('Error removing favorite:', error);
      toast({
        title: language === 'tr' ? "Hata" : "Error",
        description: language === 'tr' 
          ? `Favorilerden çıkarılamadı: ${error.message}` 
          : `Failed to remove from favorites: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Check if a story is in favorites
  const isFavorite = (storyId: number) => {
    return favorites.some(fav => fav.storyId === storyId);
  };

  // Get favorite by story ID
  const getFavoriteByStoryId = (storyId: number) => {
    return favorites.find(fav => fav.storyId === storyId);
  };

  return {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isAdding,
    isRemoving,
    isFavorite,
    getFavoriteByStoryId,
    refetch
  };
}
