import { useState } from 'react';
import { UserProfile } from '@shared/schema';
import CreateProfileModal from './CreateProfileModal';
import { useProfiles } from '@/hooks/useProfiles';
import { format } from 'date-fns';
import { useApp } from '@/lib/AppContext';

interface ProfilesTabProps {
  profiles: UserProfile[];
  isLoading: boolean;
  onProfileSelect: (profile: UserProfile) => void;
}

const ProfilesTab = ({ profiles, isLoading, onProfileSelect }: ProfilesTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deleteProfile } = useProfiles();
  const { t } = useApp();

  const handleCreateNewProfile = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProfileDelete = (id: number) => {
    if (window.confirm(t('profile.delete_confirm'))) {
      deleteProfile(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">{t('profile.list_title')}</h2>
        <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
          {profiles.length}/5
        </span>
      </div>

      {/* Profile List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-square">
              {profile.thumbnail ? (
                <img 
                  src={profile.thumbnail} 
                  alt={`${profile.name} ${t('profile.image_alt')}`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="material-icons text-6xl text-gray-400">person</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-heading font-semibold text-lg">{profile.name}</h3>
                  <p className="text-sm opacity-90">
                    {format(new Date(profile.creationDate), 'd MMMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary dark:bg-primary/20">
                  {profile.age} {t('profile.age_suffix')}
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/10 text-secondary dark:bg-secondary/20">
                  {t(`gender.${profile.gender.toLowerCase()}`)}
                </span>
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {t(`hair.color.${profile.hairColor.toLowerCase()}`)} {t('profile.hair')}
                </span>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  className="p-2 text-gray-500 hover:text-error transition-colors"
                  onClick={() => handleProfileDelete(profile.id)}
                >
                  <span className="material-icons">delete</span>
                </button>
                <button 
                  className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  onClick={() => onProfileSelect(profile)}
                >
                  {t('profile.select_button')}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Profile Card (if under 5 profiles) */}
        {profiles.length < 5 && (
          <button 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center aspect-square hover:border-primary transition-colors"
            onClick={handleCreateNewProfile}
          >
            <span className="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-2">add_circle_outline</span>
            <p className="font-heading font-medium text-gray-500 dark:text-gray-400">{t('profile.create_new')}</p>
          </button>
        )}
      </div>

      {/* Create Profile Modal */}
      <CreateProfileModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default ProfilesTab;
