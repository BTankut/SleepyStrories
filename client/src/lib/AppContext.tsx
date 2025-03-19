import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'tr' | 'en';
export type ThemeColor = 'blue' | 'green' | 'pink' | 'cream';

export interface AppContextType {
  // Language settings
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // Theme settings
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  language: 'tr',
  setLanguage: () => {},
  t: (key) => key,
  theme: 'blue',
  setTheme: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Translations
const translations: Record<Language, Record<string, string>> = {
  tr: {
    'app.title': 'Uyku Masalları',
    'profile.create': 'Profil Oluştur',
    'profile.name': 'İsim',
    'profile.gender': 'Cinsiyet',
    'profile.gender.boy': 'Erkek',
    'profile.gender.girl': 'Kız',
    'profile.age': 'Yaş',
    'profile.age_suffix': 'yaşında',
    'profile.hair': 'Saç',
    'profile.hair_color': 'Saç Rengi',
    'profile.hair_type': 'Saç Tipi',
    'profile.skin_tone': 'Ten Rengi',
    'profile.save': 'Kaydet',
    'profile.select': 'Profil Seç',
    'profile.select_button': 'Seç',
    'profile.create_new': 'Yeni Profil Oluştur',
    'profile.list_title': 'Kullanıcı Profilleri',
    'profile.delete_confirm': 'Bu profili silmek istediğinize emin misiniz?',
    'profile.image_alt': 'profil resmi',
    'profile.summary': '{age} yaşında, {gender}, {hairColor} Saç',
    
    'gender.erkek': 'Erkek',
    'gender.kız': 'Kız',
    
    'hair.color.siyah': 'Siyah',
    'hair.color.kahverengi': 'Kahverengi',
    'hair.color.sarı': 'Sarı',
    'hair.color.kızıl': 'Kızıl',
    
    'profile.hair_color.black': 'Siyah',
    'profile.hair_color.brown': 'Kahverengi',
    'profile.hair_color.blonde': 'Sarı',
    'profile.hair_color.red': 'Kızıl',
    
    'profile.hair_type.straight': 'Düz',
    'profile.hair_type.wavy': 'Dalgalı',
    'profile.hair_type.curly': 'Kıvırcık',
    
    'profile.skin_tone.light': 'Açık',
    'profile.skin_tone.medium': 'Orta',
    'profile.skin_tone.dark': 'Koyu',
    
    'story.create': 'Hikaye Oluştur',
    'story.character': 'Karakter Türü',
    'story.character.custom': 'Özel Karakter',
    'story.environment': 'Çevre/Ortam',
    'story.environment.custom': 'Özel Ortam',
    'story.theme': 'Tema/Ders',
    'story.theme.custom': 'Özel Tema',
    'story.create_button': 'Hikaye Oluştur',
    'story.change_profile': 'Profil Değiştir',
    'story.select_profile_first': 'Lütfen önce bir profil seçin',
    'story.profile_required': 'Hikaye oluşturmak için önce bir profil seçmelisiniz.',
    'story.loading': 'Hikaye Oluşturuluyor',
    'story.generating_text': 'Hikaye metni oluşturuluyor...',
    'story.generating_images': 'Resimler oluşturuluyor...',
    'story.generating_audio': 'Sesli anlatım oluşturuluyor...',
    'story.completed': 'Tamamlandı!',
    'story.error': 'Hata oluştu:',
    'story.cancel': 'İptal',
    
    'story.parameters.character': 'Ana Karakter',
    'story.parameters.environment': 'Ortam',
    'story.parameters.theme': 'Tema',
    'story.parameters.wordCount': 'Hikaye Uzunluğu',
    'story.parameters.ttsVoice': 'Sesli Anlatım Sesi',
    'story.parameters.language': 'Hikaye Dili',
    'story.parameters.words': 'kelime',
    'story.parameters.estimatedPages': 'Tahmini hikaye sayfası:',
    
    'language.turkish': 'Türkçe',
    'language.english': 'İngilizce',
    
    'characters.astronaut': 'Astronot',
    'characters.princess': 'Prenses',
    'characters.pirate': 'Korsan',
    'characters.explorer': 'Kaşif',
    'characters.fairy': 'Peri',
    
    'environments.space': 'Uzay',
    'environments.ocean': 'Okyanus',
    'environments.forest': 'Orman',
    'environments.castle': 'Şato',
    'environments.desert': 'Çöl',
    
    'themes.adventure': 'Macera',
    'themes.friendship': 'Arkadaşlık',
    'themes.mystery': 'Gizem',
    'themes.magical': 'Büyülü',
    'themes.courage': 'Cesaret',
    
    'voice.female_standard': 'Kadın Sesi (Standart)',
    'voice.male_standard': 'Erkek Sesi (Standart)',
    'voice.female_natural': 'Kadın Sesi (Doğal)',
    'voice.male_natural': 'Erkek Sesi (Doğal)',
    'voice.child': 'Çocuk Sesi',
    'voice.child_alt': 'Alternatif Çocuk Sesi',
    
    'form.custom': 'Özel',
    'form.custom_character_placeholder': 'Özel karakter adı',
    'form.custom_environment_placeholder': 'Özel ortam adı',
    'form.custom_theme_placeholder': 'Özel tema adı',
    
    'favorites.title': 'Favoriler',
    'favorites.empty': 'Henüz favori hikaye yok',
    'favorites.remove': 'Favorilerden Çıkar',
    'favorites.add': 'Favorilere Ekle',
    
    'reader.audio': 'Sesli Anlatım',
    'reader.audio.loading': 'Ses hazırlanıyor...',
    'reader.audio.error.title': 'Ses yüklenirken hata',
    'reader.audio.error.description': 'Sesli anlatım yüklenemedi. Lütfen tekrar deneyin.',
    'reader.audio.playback.error.title': 'Oynatma hatası',
    'reader.audio.playback.error.description': 'Ses oynatılamadı. Lütfen tekrar deneyin.',
    'reader.page': 'Sayfa',
    'reader.back': 'Geri',
    'reader.profile_story': 'nin Hikayesi',
    'reader.menu': 'Ana Menü',
    'reader.back_to_menu': 'Ana Menüye Dön',
    'reader.confirm_back_to_menu': 'Ana menüye dönmek istediğinize emin misiniz?',
    
    'app.language': 'Dil',
    'app.theme': 'Tema',
    'app.theme.blue': 'Mavi',
    'app.theme.green': 'Yeşil',
    'app.theme.pink': 'Pembe',
    'app.theme.cream': 'Krem',
    'app.darkmode': 'Karanlık Mod',
    
    'form.required': 'seçilmelidir',
    
    'form.validation.select_character': 'Lütfen bir karakter seçin',
    'form.validation.select_environment': 'Lütfen bir ortam seçin',
    'form.validation.select_theme': 'Lütfen bir tema seçin',
    'form.validation.select_voice': 'Lütfen bir ses seçin',
  },
  en: {
    'app.title': 'Sleepy Stories',
    'profile.create': 'Create Profile',
    'profile.name': 'Name',
    'profile.gender': 'Gender',
    'profile.gender.boy': 'Boy',
    'profile.gender.girl': 'Girl',
    'profile.age': 'Age',
    'profile.age_suffix': 'years old',
    'profile.hair': 'Hair',
    'profile.hair_color': 'Hair Color',
    'profile.hair_type': 'Hair Type',
    'profile.skin_tone': 'Skin Tone',
    'profile.save': 'Save',
    'profile.select': 'Select Profile',
    'profile.select_button': 'Select',
    'profile.create_new': 'Create New Profile',
    'profile.list_title': 'User Profiles',
    'profile.delete_confirm': 'Are you sure you want to delete this profile?',
    'profile.image_alt': 'profile image',
    'profile.summary': '{age} years old, {gender}, {hairColor} Hair',
    
    'gender.erkek': 'Boy',
    'gender.kız': 'Girl',
    'gender.boy': 'Boy',
    'gender.girl': 'Girl',
    
    'hair.color.siyah': 'Black',
    'hair.color.kahverengi': 'Brown',
    'hair.color.sarı': 'Blonde',
    'hair.color.kızıl': 'Red',
    'hair.color.black': 'Black',
    'hair.color.brown': 'Brown',
    'hair.color.blonde': 'Blonde',
    'hair.color.red': 'Red',
    
    'profile.hair_color.black': 'Black',
    'profile.hair_color.brown': 'Brown',
    'profile.hair_color.blonde': 'Blonde',
    'profile.hair_color.red': 'Red',
    
    'profile.hair_type.straight': 'Straight',
    'profile.hair_type.wavy': 'Wavy',
    'profile.hair_type.curly': 'Curly',
    
    'profile.skin_tone.light': 'Light',
    'profile.skin_tone.medium': 'Medium',
    'profile.skin_tone.dark': 'Dark',
    
    'story.create': 'Create Story',
    'story.character': 'Character Type',
    'story.character.custom': 'Custom Character',
    'story.environment': 'Environment',
    'story.environment.custom': 'Custom Environment',
    'story.theme': 'Theme/Lesson',
    'story.theme.custom': 'Custom Theme',
    'story.create_button': 'Generate Story',
    'story.change_profile': 'Change Profile',
    'story.select_profile_first': 'Please select a profile first',
    'story.profile_required': 'You need to select a profile before creating a story.',
    'story.loading': 'Generating Story',
    'story.generating_text': 'Generating story text...',
    'story.generating_images': 'Generating images...',
    'story.generating_audio': 'Generating audio narration...',
    'story.completed': 'Completed!',
    'story.error': 'Error occurred:',
    'story.cancel': 'Cancel',
    
    'story.parameters.character': 'Main Character',
    'story.parameters.environment': 'Environment',
    'story.parameters.theme': 'Theme',
    'story.parameters.wordCount': 'Story Length',
    'story.parameters.ttsVoice': 'Voice Narration',
    'story.parameters.language': 'Story Language',
    'story.parameters.words': 'words',
    'story.parameters.estimatedPages': 'Estimated pages:',
    
    'language.turkish': 'Turkish',
    'language.english': 'English',
    
    'characters.astronaut': 'Astronaut',
    'characters.princess': 'Princess',
    'characters.pirate': 'Pirate',
    'characters.explorer': 'Explorer',
    'characters.fairy': 'Fairy',
    
    'environments.space': 'Space',
    'environments.ocean': 'Ocean',
    'environments.forest': 'Forest',
    'environments.castle': 'Castle',
    'environments.desert': 'Desert',
    
    'themes.adventure': 'Adventure',
    'themes.friendship': 'Friendship',
    'themes.mystery': 'Mystery',
    'themes.magical': 'Magical',
    'themes.courage': 'Courage',
    
    'voice.female_standard': 'Female Voice (Standard)',
    'voice.male_standard': 'Male Voice (Standard)',
    'voice.female_natural': 'Female Voice (Natural)',
    'voice.male_natural': 'Male Voice (Natural)',
    'voice.child': 'Child Voice',
    'voice.child_alt': 'Alternative Child Voice',
    
    'form.custom': 'Custom',
    'form.custom_character_placeholder': 'Custom character name',
    'form.custom_environment_placeholder': 'Custom environment name',
    'form.custom_theme_placeholder': 'Custom theme name',
    
    'favorites.title': 'Favorites',
    'favorites.empty': 'No favorite stories yet',
    'favorites.remove': 'Remove from Favorites',
    'favorites.add': 'Add to Favorites',
    
    'reader.audio': 'Audio Narration',
    'reader.audio.loading': 'Preparing audio...',
    'reader.audio.error.title': 'Error loading audio',
    'reader.audio.error.description': 'Failed to load audio narration. Please try again.',
    'reader.audio.playback.error.title': 'Playback error',
    'reader.audio.playback.error.description': 'Failed to play audio. Please try again.',
    'reader.page': 'Page',
    'reader.back': 'Back',
    'reader.profile_story': '\'s Story',
    'reader.menu': 'Main Menu',
    'reader.back_to_menu': 'Back to Main Menu',
    'reader.confirm_back_to_menu': 'Are you sure you want to return to the main menu?',
    
    'app.language': 'Language',
    'app.theme': 'Theme',
    'app.theme.blue': 'Blue',
    'app.theme.green': 'Green',
    'app.theme.pink': 'Pink',
    'app.theme.cream': 'Cream',
    'app.darkmode': 'Dark Mode',
    
    'form.required': 'is required',
    
    'form.validation.select_character': 'Please select a character',
    'form.validation.select_environment': 'Please select an environment',
    'form.validation.select_theme': 'Please select a theme',
    'form.validation.select_voice': 'Please select a voice',
  }
};

// Theme colors
export const themeColors: Record<ThemeColor, string> = {
  blue: '210 70% 55%', // Pastel blue
  green: '150 70% 65%', // Pastel green
  pink: '330 70% 75%', // Pastel pink
  cream: '40 70% 85%', // Pastel cream
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get browser language
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'tr' ? 'tr' : 'en';
  };
  
  // Load saved settings from localStorage or use defaults
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || getBrowserLanguage() || 'tr'
  );
  
  const [theme, setThemeState] = useState<ThemeColor>(
    () => (localStorage.getItem('theme') as ThemeColor) || 'blue'
  );
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => localStorage.getItem('darkMode') === 'true'
  );
  
  // Translation function
  const t = useCallback((key: string): string => {
    if (!translations[language] || !translations[language][key]) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
      // Fallback to English if translation is missing
      return translations['en'][key] || key;
    }
    return translations[language][key];
  }, [language]);
  
  // Setters with side effects
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    console.log(`Language changed to: ${lang}`);
  }, []);
  
  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme colors to CSS variables directly
    const rootElement = document.documentElement;
    
    // Set primary color from the theme
    rootElement.style.setProperty('--primary', themeColors[newTheme]);
    
    // Extract HSL components
    const [hue, saturation, lightness] = themeColors[newTheme].split(' ');
    
    // Update all theme-related variables
    rootElement.style.setProperty('--primary-light', `${hue} ${saturation} 98%`);
    rootElement.style.setProperty('--primary-lighter', `${hue} ${saturation} 90%`);
    rootElement.style.setProperty('--background', `${hue} ${saturation} 98%`);
    rootElement.style.setProperty('--card', `${hue} ${saturation} 95%`);
    rootElement.style.setProperty('--border', `${hue} ${saturation} 90%`);
    rootElement.style.setProperty('--ring', themeColors[newTheme]);
    
    // Also update some accent colors
    rootElement.style.setProperty('--muted', `${hue} 30% 96.1%`);
    rootElement.style.setProperty('--accent', `${hue} 40% 96.1%`);
    
    console.log(`Theme changed to: ${newTheme}`);
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      
      // Update document HTML for dark mode
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newValue;
    });
  }, []);
  
  // Initial application of theme and dark mode settings
  useEffect(() => {
    // Apply dark mode class if needed
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply theme colors - manually apply the theme on initialization
    const rootElement = document.documentElement;
    rootElement.style.setProperty('--primary', themeColors[theme]);
    
    const [hue, saturation, lightness] = themeColors[theme].split(' ');
    
    rootElement.style.setProperty('--primary-light', `${hue} ${saturation} 98%`);
    rootElement.style.setProperty('--primary-lighter', `${hue} ${saturation} 90%`);
    rootElement.style.setProperty('--background', `${hue} ${saturation} 98%`);
    rootElement.style.setProperty('--card', `${hue} ${saturation} 95%`);
    rootElement.style.setProperty('--border', `${hue} ${saturation} 90%`);
    rootElement.style.setProperty('--ring', themeColors[theme]);
    rootElement.style.setProperty('--muted', `${hue} 30% 96.1%`);
    rootElement.style.setProperty('--accent', `${hue} 40% 96.1%`);
    
    console.log(`App initialized with: language=${language}, theme=${theme}, darkMode=${isDarkMode}`);
  }, [isDarkMode, language, theme]);
  
  return (
    <AppContext.Provider value={{ 
      language, 
      setLanguage, 
      t,
      theme,
      setTheme,
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => useContext(AppContext);