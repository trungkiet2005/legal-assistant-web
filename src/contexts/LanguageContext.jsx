import { createContext, useContext, useState } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('vi'); // Default to Vietnamese

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return value || key;
  };

  const switchLanguage = (language) => {
    setCurrentLanguage(language);
  };

  const value = {
    currentLanguage,
    switchLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
