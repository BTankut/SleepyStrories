import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { UserProfile, InsertUserProfile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useProfiles() {
  const { toast } = useToast();
  
  // Get all profiles
  const {
    data: profiles = [],
    isLoading,
    error
  } = useQuery<UserProfile[]>({
    queryKey: ['/api/profiles'],
  });

  // Create a new profile
  const {
    mutate: createProfile,
    isPending: isCreating
  } = useMutation({
    mutationFn: async (data: InsertUserProfile) => {
      const res = await apiRequest('POST', '/api/profiles', data);
      return res.json() as Promise<UserProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profil oluşturuldu",
        description: "Yeni profil başarıyla oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Profil oluşturulamadı: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete a profile
  const {
    mutate: deleteProfile,
    isPending: isDeleting
  } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/profiles/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profil silindi",
        description: "Profil başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Profil silinemedi: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    profiles,
    isLoading,
    error,
    createProfile,
    deleteProfile,
    isCreating,
    isDeleting
  };
}
