import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);
const PROFILE_API = 'http://localhost:5000/api/profile';

export function AppProvider({ children }) {
  const [profile, setProfile] = useState({ displayName: '', theme: 'light', passwordConfigured: false });

  const refreshProfile = useCallback(async () => {
    const response = await fetch(PROFILE_API);
    if (!response.ok) throw new Error('Không thể tải cài đặt');
    const data = await response.json();
    setProfile({
      displayName: typeof data.displayName === 'string' ? data.displayName : '',
      theme: data.theme === 'dark' ? 'dark' : 'light',
      passwordConfigured: Boolean(data.passwordConfigured)
    });
    return data;
  }, []);

  useEffect(() => {
    refreshProfile().catch((error) => console.error('Lỗi load profile:', error));
  }, [refreshProfile]);

  const value = useMemo(() => ({
    ...profile,
    isDark: profile.theme === 'dark',
    refreshProfile,
    updateProfile: (nextProfile) => setProfile((current) => ({ ...current, ...nextProfile }))
  }), [profile, refreshProfile]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext phải được dùng bên trong AppProvider');
  return context;
}
