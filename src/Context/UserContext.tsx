import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserRoleDetails } from '../types/userRoles';
import { getDisciplineList } from '../services/apiServices';

interface UserContextType {
  currentUser: UserRoleDetails | null;
  setCurrentUser: (user: UserRoleDetails | null) => void;
  submittedChangeRequests: any[];
  setSubmittedChangeRequests: (requests: any) => void;
  disciplines: Record<string, any>;
  setDisciplines: (disciplines: Record<string, any>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserRoleDetails | null>(null);
  const [submittedChangeRequests, setSubmittedChangeRequests] = useState<any[]>([]);
  const [disciplines, setDisciplines] = useState<Record<string, any>>({});

  // Fetch discipline list only after auth user is available.
  useEffect(() => {
    if (!currentUser) {
      setDisciplines({});
      return;
    }

    let isMounted = true;
    const fetchDisciplines = async () => {
      try {
        const result = await getDisciplineList();
        if (isMounted) {
          setDisciplines(result?.data || {});
        }
      } catch (error) {
        console.error('Error fetching disciplines:', error);
        if (isMounted) {
          setDisciplines({});
        }
      }
    };

    fetchDisciplines();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, submittedChangeRequests, setSubmittedChangeRequests, disciplines, setDisciplines }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
