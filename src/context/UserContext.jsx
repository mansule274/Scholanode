import { createContext, useContext, useEffect, useState } from 'react';

import privateAxiosInstance from '../auth/privateAxiosInstance';

const UserContext = createContext(null);

const normalizeAuthResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { user: null, school: null, student: null };
  }

  const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
  const user =
    payload.user ||
    data.user ||
    data.userData ||
    payload.userData ||
    payload;

  return {
    user: typeof user === 'object' ? user : null,
    school: payload.school || data.school || null,
    student: payload.student || data.student || null,
  };
};

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [student, setStudent] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const isAuthenticated = Boolean(accessToken);

  const syncAuthStateFromStorage = () => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      setAccessToken(token);
      return token;
    }

    setAccessToken('');
    setUser(null);
    setSchool(null);
    setStudent(null);
    return '';
  };

  const setAuthProfile = (payload) => {
    const profile = normalizeAuthResponse(payload);
    setUser(profile.user);
    setSchool(profile.school);
    setStudent(profile.student);
    return profile;
  };

  const fetchLoggedInUser = async () => {
    const token = syncAuthStateFromStorage();

    if (!token) {
      setUser(null);
      setSchool(null);
      setStudent(null);
      setIsLoading(false);
      return null;
    }

    try {
      setAuthError(null);
      const response = await privateAxiosInstance.get('/auths/me');
      const profile = setAuthProfile(response?.data);

      if (profile.user) {
        console.log('Fetched logged-in profile:', profile);
        console.log('all response data:', response?.data);
        return profile.user;
      }

      setUser(null);
      setSchool(null);
      setStudent(null);
      return null;
    } catch (error) {
      setUser(null);
      setSchool(null);
      setStudent(null);
      setAuthError(error?.response?.data?.message || 'Unable to load user profile.');
      console.log('Error:', error?.response?.data || error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token, profile = null) => {
    if (!token) {
      throw new Error('An access token is required to log in.');
    }

    const safeToken = String(token);
    localStorage.setItem('accessToken', safeToken);
    setAccessToken(safeToken);
    setAuthError(null);

    const normalizedProfile = normalizeAuthResponse(profile);
    if (normalizedProfile.user) {
      setUser(normalizedProfile.user);
      setSchool(normalizedProfile.school);
      setStudent(normalizedProfile.student);
      void fetchLoggedInUser();
      return normalizedProfile.user;
    }

    setUser((currentUser) => currentUser || { accessToken: safeToken });
    void fetchLoggedInUser();
    return { accessToken: safeToken };
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAccessToken('');
    setUser(null);
    setSchool(null);
    setStudent(null);
    setAuthError(null);
  };

  useEffect(() => {
    const token = syncAuthStateFromStorage();

    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchLoggedInUser();
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      school,
      student,
      accessToken,
      isAuthenticated,
      isLoading,
      authError,
      login,
      logout,
      setUser,
      fetchLoggedInUser,
    }}>
      {children}
    </UserContext.Provider>
  );
};



export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used inside ContextProvider');
  }

  return context;
};
