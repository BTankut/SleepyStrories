import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InsertUserProfile, insertUserProfileSchema } from '@shared/schema';
import { useProfiles } from '@/hooks/useProfiles';
import { useApp } from '@/lib/AppContext';

// Define form values type
type ProfileFormValues = {
  name: string;
  age: number;
  gender: string;
  hairColor: string;
  hairType: string;
  skinTone: string;
};

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProfileModal = ({ isOpen, onClose }: CreateProfileModalProps) => {
  const { createProfile, isCreating } = useProfiles();
  const { t } = useApp();
  
  // We'll create the schema directly in useForm to avoid issues with component rendering
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, { message: t('profile.name') + ' ' + t('form.required') }),
        age: z.number().min(3).max(12),
        gender: z.string().min(1, { message: t('profile.gender') + ' ' + t('form.required') }),
        hairColor: z.string().min(1, { message: t('profile.hair_color') + ' ' + t('form.required') }),
        hairType: z.string().min(1, { message: t('profile.hair_type') + ' ' + t('form.required') }),
        skinTone: z.string().min(1, { message: t('profile.skin_tone') + ' ' + t('form.required') }),
      })
    ),
    defaultValues: {
      name: '',
      age: 7,
      gender: '',
      hairColor: '',
      hairType: '',
      skinTone: '',
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    await createProfile(data as InsertUserProfile);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-xl font-semibold">{t('profile.create_new')}</h3>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={onClose}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.name')}</label>
              <input 
                {...register('name')}
                type="text" 
                id="name" 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700" 
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.age')}</label>
              <select 
                {...register('age', { valueAsNumber: true })}
                id="age" 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              {errors.age && (
                <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.gender')}</label>
              <div className="flex space-x-4">
                <div className="character-selector">
                  <input 
                    {...register('gender')}
                    type="radio" 
                    id="gender-girl" 
                    value={t('gender.kız')} 
                    className="hidden" 
                  />
                  <label htmlFor="gender-girl" className="block cursor-pointer border-2 rounded-md p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons text-pink-500 text-2xl">face_3</span>
                    <span className="block mt-1 text-sm">{t('profile.gender.girl')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('gender')}
                    type="radio" 
                    id="gender-boy" 
                    value={t('gender.erkek')} 
                    className="hidden" 
                  />
                  <label htmlFor="gender-boy" className="block cursor-pointer border-2 rounded-md p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons text-blue-500 text-2xl">face_6</span>
                    <span className="block mt-1 text-sm">{t('profile.gender.boy')}</span>
                  </label>
                </div>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.hair_color')}</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="character-selector">
                  <input 
                    {...register('hairColor')}
                    type="radio" 
                    id="hair-black" 
                    value={t('hair.color.siyah')} 
                    className="hidden" 
                  />
                  <label htmlFor="hair-black" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-900 mx-auto"></div>
                    <span className="block mt-1 text-xs">{t('profile.hair_color.black')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('hairColor')}
                    type="radio" 
                    id="hair-brown" 
                    value={t('hair.color.kahverengi')} 
                    className="hidden" 
                  />
                  <label htmlFor="hair-brown" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-800 mx-auto"></div>
                    <span className="block mt-1 text-xs">{t('profile.hair_color.brown')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('hairColor')}
                    type="radio" 
                    id="hair-blonde" 
                    value="Sarı" 
                    className="hidden" 
                  />
                  <label htmlFor="hair-blonde" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-300 mx-auto"></div>
                    <span className="block mt-1 text-xs">{t('profile.hair_color.blonde')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('hairColor')}
                    type="radio" 
                    id="hair-red" 
                    value="Kızıl" 
                    className="hidden" 
                  />
                  <label htmlFor="hair-red" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-orange-600 mx-auto"></div>
                    <span className="block mt-1 text-xs">{t('profile.hair_color.red')}</span>
                  </label>
                </div>
              </div>
              {errors.hairColor && (
                <p className="mt-1 text-sm text-red-500">{errors.hairColor.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.hair_type')}</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="character-selector">
                  <input 
                    {...register('hairType')}
                    type="radio" 
                    id="hair-straight" 
                    value="Düz" 
                    className="hidden" 
                  />
                  <label htmlFor="hair-straight" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons">straight</span>
                    <span className="block mt-1 text-xs">{t('profile.hair_type.straight')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('hairType')}
                    type="radio" 
                    id="hair-wavy" 
                    value="Dalgalı" 
                    className="hidden" 
                  />
                  <label htmlFor="hair-wavy" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons">waves</span>
                    <span className="block mt-1 text-xs">{t('profile.hair_type.wavy')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('hairType')}
                    type="radio" 
                    id="hair-curly" 
                    value="Kıvırcık" 
                    className="hidden" 
                  />
                  <label htmlFor="hair-curly" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-icons">cyclone</span>
                    <span className="block mt-1 text-xs">{t('profile.hair_type.curly')}</span>
                  </label>
                </div>
              </div>
              {errors.hairType && (
                <p className="mt-1 text-sm text-red-500">{errors.hairType.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.skin_tone')}</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="character-selector">
                  <input 
                    {...register('skinTone')}
                    type="radio" 
                    id="skin-light" 
                    value="Açık" 
                    className="hidden" 
                  />
                  <label htmlFor="skin-light" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#FFE0BD] mx-auto"></div>
                    <span className="block mt-1 text-xs">{t('profile.skin_tone.light')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('skinTone')}
                    type="radio" 
                    id="skin-medium" 
                    value="Orta" 
                    className="hidden" 
                  />
                  <label htmlFor="skin-medium" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#F1C27D] mx-auto"></div>
                    <span className="block mt-1 text-xs">{t('profile.skin_tone.medium')}</span>
                  </label>
                </div>
                <div className="character-selector">
                  <input 
                    {...register('skinTone')}
                    type="radio" 
                    id="skin-dark" 
                    value="Koyu" 
                    className="hidden" 
                  />
                  <label htmlFor="skin-dark" className="block cursor-pointer border-2 rounded-md p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#8D5524] mx-auto"></div>
                    <span className="block mt-1 text-xs">{t('profile.skin_tone.dark')}</span>
                  </label>
                </div>
              </div>
              {errors.skinTone && (
                <p className="mt-1 text-sm text-red-500">{errors.skinTone.message}</p>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="button" 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 mr-2"
                onClick={onClose}
                disabled={isCreating}
              >
                {t('story.cancel')}
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                disabled={isCreating}
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    {t('story.loading')}
                  </span>
                ) : t('profile.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfileModal;
