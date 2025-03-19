import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useApp, ThemeColor } from '@/lib/AppContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export const SettingsButton: React.FC = () => {
  const { language, setLanguage, t, theme, setTheme, isDarkMode, toggleDarkMode } = useApp();
  const [open, setOpen] = useState(false);

  // Theme options
  const themeOptions: { value: ThemeColor; label: string }[] = [
    { value: 'blue', label: t('app.theme.blue') },
    { value: 'green', label: t('app.theme.green') },
    { value: 'pink', label: t('app.theme.pink') },
    { value: 'cream', label: t('app.theme.cream') },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('app.language')}</DropdownMenuLabel>
        <DropdownMenuItem 
          className={language === 'tr' ? 'bg-primary/10 font-medium' : ''}
          onClick={() => {
            setLanguage('tr');
            setOpen(false); // Close dropdown after selection
          }}
        >
          🇹🇷 Türkçe
        </DropdownMenuItem>
        <DropdownMenuItem
          className={language === 'en' ? 'bg-primary/10 font-medium' : ''}
          onClick={() => {
            setLanguage('en');
            setOpen(false); // Close dropdown after selection
          }}
        >
          🇬🇧 English
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>{t('app.theme')}</DropdownMenuLabel>
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={theme === option.value ? 'bg-primary/10 font-medium' : ''}
            onClick={() => {
              setTheme(option.value);
              setOpen(false); // Close dropdown after selection
            }}
          >
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ 
                backgroundColor: option.value === 'blue' ? 'hsl(210, 70%, 55%)' : 
                                 option.value === 'green' ? 'hsl(150, 70%, 65%)' : 
                                 option.value === 'pink' ? 'hsl(330, 70%, 75%)' : 
                                 'hsl(40, 70%, 85%)',
                border: theme === option.value ? '2px solid var(--primary)' : '1px solid var(--border)'
              }}
            />
            {option.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 flex items-center justify-between">
          <Label htmlFor="dark-mode">{t('app.darkmode')}</Label>
          <Switch 
            id="dark-mode" 
            checked={isDarkMode} 
            onCheckedChange={() => {
              toggleDarkMode();
              setOpen(false); // Close dropdown after toggling
            }}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsButton;