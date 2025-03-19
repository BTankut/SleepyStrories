import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserProfile, CompleteStory } from '@shared/schema';
import GenerationProgressModal from './GenerationProgressModal';
import { useApp } from '@/lib/AppContext';

// Custom option schema for radio buttons
interface CustomOptionState {
  character: boolean;
  environment: boolean;
  theme: boolean;
}

// Basic story form type, to be used with zod generated schema
type StoryFormValues = {
  character: string;
  customCharacter?: string;
  environment: string;
  customEnvironment?: string;
  theme: string;
  customTheme?: string;
  wordCount: number;
  ttsVoice: string;
  language: 'tr' | 'en';
};

interface StoryCreationTabProps {
  selectedProfile: UserProfile | null;
  isGenerating: boolean;
  onStoryComplete: (story: CompleteStory) => void;
  onChangeProfile: () => void;
  generateStory: (request: any) => Promise<CompleteStory>;
}

const StoryCreationTab = ({ 
  selectedProfile, 
  isGenerating,
  onStoryComplete,
  onChangeProfile,
  generateStory
}: StoryCreationTabProps) => {
  const { t, language } = useApp();
  const [customOptions, setCustomOptions] = useState<CustomOptionState>({
    character: false,
    environment: false,
    theme: false
  });
  
  const [wordCountDisplay, setWordCountDisplay] = useState(300);
  const [pageCountEstimate, setPageCountEstimate] = useState("5-6");
  const [showProgress, setShowProgress] = useState(false);
  const [ttsVoices, setTtsVoices] = useState<{value: string, label: string}[]>([
    { value: 'tr-TR-Standard-A', label: 'Kadın Sesi (Standart)' },
    { value: 'tr-TR-Standard-B', label: 'Erkek Sesi (Standart)' },
    { value: 'tr-TR-Wavenet-A', label: 'Kadın Sesi (Doğal)' },
    { value: 'tr-TR-Wavenet-B', label: 'Erkek Sesi (Doğal)' },
    { value: 'tr-TR-Wavenet-C', label: 'Çocuk Sesi' },
  ]);
  
  // Create the schema with translations
  const storyFormSchema = z.object({
    character: z.string().min(1, { message: t('form.validation.select_character') }),
    customCharacter: z.string().optional(),
    environment: z.string().min(1, { message: t('form.validation.select_environment') }),
    customEnvironment: z.string().optional(),
    theme: z.string().min(1, { message: t('form.validation.select_theme') }),
    customTheme: z.string().optional(),
    wordCount: z.number().min(100).max(500),
    ttsVoice: z.string().min(1, { message: t('form.validation.select_voice') }),
    language: z.enum(['en', 'tr']).default(language), // Use app's language as default
  });

  // Define form values type
  type StoryFormValues = z.infer<typeof storyFormSchema>;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      character: '',
      environment: '',
      theme: '',
      wordCount: 300,
      ttsVoice: language === 'tr' ? 'tr-TR-Standard-A' : 'en-US-Standard-A',
      language
    }
  });
  
  // Watch form values for dependent fields
  const watchCharacter = watch('character');
  const watchEnvironment = watch('environment');
  const watchTheme = watch('theme');
  const watchWordCount = watch('wordCount');
  const watchLanguage = watch('language');
  
  // Handle custom option changes
  useEffect(() => {
    setCustomOptions({
      character: watchCharacter === 'custom',
      environment: watchEnvironment === 'custom',
      theme: watchTheme === 'custom'
    });
  }, [watchCharacter, watchEnvironment, watchTheme]);
  
  // Update word count display and page estimate
  useEffect(() => {
    setWordCountDisplay(watchWordCount);
    
    // Calculate estimated pages (assuming 50-60 words per page)
    const minPages = Math.floor(watchWordCount / 60);
    const maxPages = Math.ceil(watchWordCount / 50);
    setPageCountEstimate(minPages === maxPages ? minPages.toString() : `${minPages}-${maxPages}`);
  }, [watchWordCount]);
  
  // Update TTS voice options based on app language
  useEffect(() => {
    // Use application language
    if (language === 'en') {
      setTtsVoices([
        { value: 'en-US-Standard-A', label: t('voice.female_standard') },
        { value: 'en-US-Standard-B', label: t('voice.male_standard') },
        { value: 'en-US-Wavenet-A', label: t('voice.female_natural') },
        { value: 'en-US-Wavenet-B', label: t('voice.male_natural') },
        { value: 'en-US-Neural2-A', label: t('voice.child') },         // Young female child voice
        { value: 'en-US-Journey-D', label: t('voice.child_alt') },     // Alternative child voice
      ]);
      // Set default English voice
      setValue('ttsVoice', 'en-US-Standard-A');
      // Set language to English
      setValue('language', 'en');
    } else {
      setTtsVoices([
        { value: 'tr-TR-Standard-A', label: t('voice.female_standard') },
        { value: 'tr-TR-Standard-B', label: t('voice.male_standard') },
        { value: 'tr-TR-Wavenet-A', label: t('voice.female_natural') },
        { value: 'tr-TR-Wavenet-B', label: t('voice.male_natural') },
        { value: 'tr-TR-Wavenet-E', label: t('voice.child') },         // Higher pitch female (closest to child)
        { value: 'tr-TR-Wavenet-C', label: t('voice.child_alt') },     // Softer female voice that can sound younger
      ]);
      // Set default Turkish voice
      setValue('ttsVoice', 'tr-TR-Standard-A');
      // Set language to Turkish
      setValue('language', 'tr');
    }
  }, [language, setValue, t]);
  
  const onSubmit = async (data: StoryFormValues) => {
    if (!selectedProfile) {
      alert(t('story.select_profile_first'));
      return;
    }
    
    setShowProgress(true);
    
    // Process custom fields if needed
    const finalCharacter = data.character === 'custom' ? data.customCharacter : data.character;
    const finalEnvironment = data.environment === 'custom' ? data.customEnvironment : data.environment;
    const finalTheme = data.theme === 'custom' ? data.customTheme : data.theme;
    
    try {
      const storyRequest = {
        userProfileId: selectedProfile.id,
        character: finalCharacter,
        environment: finalEnvironment,
        theme: finalTheme,
        wordCount: data.wordCount,
        ttsVoice: data.ttsVoice,
        language: data.language
      };
      
      const story = await generateStory(storyRequest);
      setShowProgress(false);
      onStoryComplete(story);
    } catch (error) {
      console.error("Story generation failed:", error);
      setShowProgress(false);
      alert(t('story.error') + ' ' + error);
    }
  };
  
  const handleCancelGeneration = () => {
    // In a real implementation, you would cancel the API calls
    // For now, just hide the progress modal
    setShowProgress(false);
  };

  if (!selectedProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="font-heading text-xl font-semibold mb-4">{t('story.select_profile_first')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('story.profile_required')}
          </p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            onClick={onChangeProfile}
          >
            {t('profile.select')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">{t('story.create')}</h2>
        
        {/* Selected Profile Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.select')}</h3>
          <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {selectedProfile.thumbnail ? (
                <img 
                  src={selectedProfile.thumbnail} 
                  alt={`${selectedProfile.name} profil resmi`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="material-icons text-3xl text-gray-400">person</span>
              )}
            </div>
            <div>
              <p className="font-heading font-medium">{selectedProfile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedProfile.age} {t('profile.age_suffix')}, {t(`gender.${selectedProfile.gender.toLowerCase()}`)}, {t(`hair.color.${selectedProfile.hairColor.toLowerCase()}`)} {t('profile.hair')}
              </p>
            </div>
            <button 
              className="ml-auto text-primary hover:text-primary-dark"
              onClick={onChangeProfile}
            >
              <span className="material-icons">edit</span>
            </button>
          </div>
        </div>
        
        {/* Story Parameters Form */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('story.parameters.character')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'character-astronaut', value: t('characters.astronaut'), key: 'astronaut', icon: 'rocket_launch' },
                { id: 'character-princess', value: t('characters.princess'), key: 'princess', icon: 'emoji_nature' },
                { id: 'character-pirate', value: t('characters.pirate'), key: 'pirate', icon: 'sailing' },
                { id: 'character-explorer', value: t('characters.explorer'), key: 'explorer', icon: 'travel_explore' },
                { id: 'character-fairy', value: t('characters.fairy'), key: 'fairy', icon: 'auto_fix_high' },
                { id: 'character-custom', value: 'custom', key: 'custom', icon: 'add_circle' }
              ].map(char => (
                <div className="character-selector" key={char.id}>
                  <input 
                    {...register('character')}
                    type="radio" 
                    id={char.id} 
                    value={char.value} 
                    className="hidden" 
                  />
                  <label htmlFor={char.id} className="block cursor-pointer border-2 rounded-md p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons text-2xl">{char.icon}</span>
                    <span className="block mt-1 text-sm">{char.key === 'custom' ? t('form.custom') : char.value}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.character && (
              <p className="mt-1 text-sm text-red-500">{errors.character.message}</p>
            )}
            {customOptions.character && (
              <div className="mt-2">
                <input 
                  {...register('customCharacter')}
                  type="text" 
                  placeholder={t('form.custom_character_placeholder')} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700" 
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('story.parameters.environment')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'environment-space', value: t('environments.space'), key: 'space', icon: 'nights_stay' },
                { id: 'environment-ocean', value: t('environments.ocean'), key: 'ocean', icon: 'water' },
                { id: 'environment-forest', value: t('environments.forest'), key: 'forest', icon: 'park' },
                { id: 'environment-castle', value: t('environments.castle'), key: 'castle', icon: 'castle' },
                { id: 'environment-desert', value: t('environments.desert'), key: 'desert', icon: 'landscape' },
                { id: 'environment-custom', value: 'custom', key: 'custom', icon: 'add_circle' }
              ].map(env => (
                <div className="character-selector" key={env.id}>
                  <input 
                    {...register('environment')}
                    type="radio" 
                    id={env.id} 
                    value={env.value} 
                    className="hidden" 
                  />
                  <label htmlFor={env.id} className="block cursor-pointer border-2 rounded-md p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons text-2xl">{env.icon}</span>
                    <span className="block mt-1 text-sm">{env.key === 'custom' ? t('form.custom') : env.value}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.environment && (
              <p className="mt-1 text-sm text-red-500">{errors.environment.message}</p>
            )}
            {customOptions.environment && (
              <div className="mt-2">
                <input 
                  {...register('customEnvironment')}
                  type="text" 
                  placeholder={t('form.custom_environment_placeholder')} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700" 
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('story.parameters.theme')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'theme-adventure', value: t('themes.adventure'), key: 'adventure', icon: 'hiking' },
                { id: 'theme-friendship', value: t('themes.friendship'), key: 'friendship', icon: 'people' },
                { id: 'theme-mystery', value: t('themes.mystery'), key: 'mystery', icon: 'search' },
                { id: 'theme-magical', value: t('themes.magical'), key: 'magical', icon: 'stars' },
                { id: 'theme-courage', value: t('themes.courage'), key: 'courage', icon: 'shield' },
                { id: 'theme-custom', value: 'custom', key: 'custom', icon: 'add_circle' }
              ].map(thm => (
                <div className="character-selector" key={thm.id}>
                  <input 
                    {...register('theme')}
                    type="radio" 
                    id={thm.id} 
                    value={thm.value} 
                    className="hidden" 
                  />
                  <label htmlFor={thm.id} className="block cursor-pointer border-2 rounded-md p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons text-2xl">{thm.icon}</span>
                    <span className="block mt-1 text-sm">{thm.key === 'custom' ? t('form.custom') : thm.value}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.theme && (
              <p className="mt-1 text-sm text-red-500">{errors.theme.message}</p>
            )}
            {customOptions.theme && (
              <div className="mt-2">
                <input 
                  {...register('customTheme')}
                  type="text" 
                  placeholder={t('form.custom_theme_placeholder')} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700" 
                />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('story.parameters.wordCount')}</label>
            <div className="flex items-center">
              <input 
                {...register('wordCount', { valueAsNumber: true })}
                type="range" 
                id="wordCount" 
                min="100" 
                max="500" 
                step="50" 
                className="w-full accent-primary" 
              />
              <span className="ml-3 text-sm w-16 text-center">{wordCountDisplay}</span>
              <span className="ml-1 text-sm text-gray-500">{t('story.parameters.words')}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('story.parameters.estimatedPages')}: <span>{pageCountEstimate}</span>
            </p>
          </div>
          
          <div>
            <label htmlFor="ttsVoice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('story.parameters.ttsVoice')}</label>
            <select 
              {...register('ttsVoice')}
              id="ttsVoice" 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700"
            >
              {ttsVoices.map(voice => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>
          

          
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  {t('story.loading')}
                </span>
              ) : (
                <>
                  <span className="material-icons mr-2">auto_stories</span>
                  {t('story.create_button')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Generation Progress Modal */}
      {showProgress && (
        <GenerationProgressModal onCancel={handleCancelGeneration} />
      )}
    </div>
  );
};

export default StoryCreationTab;
