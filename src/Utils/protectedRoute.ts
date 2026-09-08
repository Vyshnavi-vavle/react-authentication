import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useUserContext } from '../context/appContext';

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress, instance } = useMsal();
  const { currentUser, setCurrentUser } = useUserContext();

  useEffect(() => {
    if (!isAuthenticated) {
      if (currentUser) {
        setCurrentUser(null);
      }
      return;
    }

    const activeAccount = instance.getActiveAccount() || instance.getAllAccounts()[0];
    if (!activeAccount) {
      return;
    }

    if (currentUser?.homeAccountId === activeAccount.homeAccountId) {
      return;
    }

    console.log("---------------activeAccount", activeAccount);
      console.log({
        homeAccountId: activeAccount.homeAccountId,
        localAccountId: activeAccount.localAccountId,
        tenantId: activeAccount.tenantId,
        username: activeAccount.username,
        name: activeAccount.name,
      })

    setCurrentUser({
      homeAccountId: activeAccount.homeAccountId,
      localAccountId: activeAccount.localAccountId,
      tenantId: activeAccount.tenantId,
      username: activeAccount.username,
      name: activeAccount.name,
    });
  }, [instance, isAuthenticated, currentUser, setCurrentUser]);

  if (inProgress !== InteractionStatus.None) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
