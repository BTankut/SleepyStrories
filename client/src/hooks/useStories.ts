import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { CompleteStory, StoryGenerationRequest } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useStories() {
  const { toast } = useToast();
  const [generationProgress, setGenerationProgress] = useState({
    overall: 0,
    text: 0,
    images: 0,
    audio: 0,
    status: '',
    current: 0,
    total: 0,
    isVisible: false
  });

  // For real progress updates with actual animation
  const simulateProgress = (storyGenerationPromise: Promise<CompleteStory>) => {
    // Reset progress
    setGenerationProgress({
      overall: 5,
      text: 5, // Start at 5% to show immediate feedback
      images: 0,
      audio: 0,
      status: 'Hikaye metni oluşturuluyor...',
      current: 0,
      total: 5, // Default to 5 pages estimate
      isVisible: true
    });

    let interval: NodeJS.Timeout;
    let textPhaseComplete = false;
    let imagesStarted = false;
    let audioStarted = false;
    
    const updateProgressUI = () => {
      setGenerationProgress(prev => {
        // Text generation phase
        if (prev.text < 95 && !textPhaseComplete) {
          const newTextProgress = Math.min(prev.text + 1, 95);
          return {
            ...prev,
            text: newTextProgress,
            overall: Math.floor((newTextProgress + prev.images + prev.audio) / 3),
            status: 'Hikaye metni oluşturuluyor...'
          };
        } 
        // Images generation phase
        else if (prev.images < 95 && textPhaseComplete && !audioStarted) {
          if (!imagesStarted) {
            imagesStarted = true;
            return {
              ...prev,
              text: 100,
              status: 'Resimler oluşturuluyor...',
              overall: Math.floor((100 + prev.images + prev.audio) / 3),
              current: 0
            };
          }
          
          const newImagesProgress = Math.min(prev.images + 0.5, 95);
          const progressPerPage = 95 / prev.total;
          const estimatedPages = Math.floor(newImagesProgress / progressPerPage);
          const newCurrent = Math.min(estimatedPages, prev.total);
          
          return {
            ...prev,
            images: newImagesProgress,
            overall: Math.floor((100 + newImagesProgress + prev.audio) / 3),
            status: `Resimler oluşturuluyor... (${newCurrent}/${prev.total})`,
            current: newCurrent
          };
        } 
        // Audio generation phase
        else if (prev.audio < 95 && textPhaseComplete && imagesStarted) {
          if (!audioStarted) {
            audioStarted = true;
            return {
              ...prev,
              images: 100,
              status: 'Sesli anlatım oluşturuluyor...',
              overall: Math.floor((100 + 100 + prev.audio) / 3),
              current: 0
            };
          }
          
          const newAudioProgress = Math.min(prev.audio + 2, 95);
          const progressPerPage = 95 / prev.total;
          const estimatedPages = Math.floor(newAudioProgress / progressPerPage);
          const newCurrent = Math.min(estimatedPages, prev.total);
          
          return {
            ...prev,
            audio: newAudioProgress,
            overall: Math.floor((100 + 100 + newAudioProgress) / 3),
            status: `Sesli anlatım oluşturuluyor... (${newCurrent}/${prev.total})`,
            current: newCurrent
          };
        }
        
        return prev;
      });
    };
    
    // Start frequent updates for animation
    interval = setInterval(updateProgressUI, 100);
    
    const progressPromise = new Promise<CompleteStory>((resolve, reject) => {
      // Hook into the actual API call promise
      storyGenerationPromise
        .then(result => {
          // When text is generated, mark text phase complete
          textPhaseComplete = true;
          
          // Check how many pages we have
          const pageCount = result.pages ? result.pages.length : 5;
          
          // Update with real page count
          setGenerationProgress(prev => ({
            ...prev,
            text: 100,
            total: pageCount
          }));
          
          // When fully complete
          setTimeout(() => {
            clearInterval(interval);
            
            // Ensure 100% progress when complete
            setGenerationProgress({
              overall: 100,
              text: 100,
              images: 100,
              audio: 100,
              status: 'Tamamlandı!',
              current: pageCount,
              total: pageCount,
              isVisible: true
            });
            
            // Small delay to show completion
            setTimeout(() => {
              resolve(result);
            }, 1000);
          }, 500);
        })
        .catch(error => {
          clearInterval(interval);
          
          setGenerationProgress(prev => ({
            ...prev,
            status: `Hata oluştu: ${error.message}`,
            isVisible: true // Keep visible to show error
          }));
          
          reject(error);
        });
    });
    
    return progressPromise;
  };

  // Generate a new story
  const {
    mutateAsync: generateStoryAsync,
    isPending: isGenerating
  } = useMutation({
    mutationFn: async (request: StoryGenerationRequest) => {
      const res = await apiRequest('POST', '/api/stories/generate', request);
      return res.json() as Promise<CompleteStory>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Hikaye oluşturuldu",
        description: "Yeni hikaye başarıyla oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Hikaye oluşturulamadı: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const generateStory = async (request: StoryGenerationRequest) => {
    const storyPromise = generateStoryAsync(request);
    return await simulateProgress(storyPromise);
  };

  return {
    generateStory,
    isGenerating,
    generationProgress
  };
}
