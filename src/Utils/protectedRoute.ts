import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { fetchAuthDetails } from "../services/userManagement";
import { useUserContext } from "../context/UserContext";
import { hasSettingsAccess, PERMISSIONS, hasAccess} from "./UserRoleHelper";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { setCurrentUser } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchAuthDetails().then((response) => {
        switch (location.pathname) {
          case "/SettingsDashboard":
            (!response || !response.data ||!hasSettingsAccess(response.data)) && navigate("/home", { replace: true });
            break;
          case "/ChangeRequest":
            (!response || !response.data ||!hasAccess(response.data, PERMISSIONS.UPDATE_CHANGES)) && navigate("/home", { replace: true });
            break;
          default:
            break;
        }
        setCurrentUser(response ? response.data : null);
      }).catch((error) => {
        console.error("Failed to fetch auth details:", error);
      });
    }
  }, [isAuthenticated]);

  if (inProgress !== "none") {
    return (
      <div style={{textAlign: "center", marginTop: "10vh", fontSize: "2rem"}}>
        Loading...
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;
