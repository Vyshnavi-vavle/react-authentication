import { msalInstance } from "../main";
/**
 * Initializes user context (fetches user roles, sets default responsibility).
 * Safe to call multiple times — internally guarded.
 * Returns true if initialized or already initialized.
 */
 
export class AuthService {
  static user_info: { [key: string]: any } = {};
  static selectedRole: any = null;
  static selectedResponsibility: any ;
  static initialized = false;
  static initializing = false;
  static async getToken(): Promise<string | null> {
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) {
      console.warn("No active account found in MSAL");
      return null;
    }
    try {
      const response = await msalInstance.acquireTokenSilent({
        account: activeAccount,
        // scopes: ["api://bc115335-a0b9-4738-877c-2ead58e9f96d/access_as_user"],
        scopes: ["User.Read"],
      });
      return response.accessToken;
    } catch (error) {
      console.error("Failed to acquire token silently", error);
      this.logout()
      return null;
    }
  }

  static logout(): void {
    msalInstance.logoutRedirect({
      // postLogoutRedirectUri: 'http://localhost:5000/login',
      postLogoutRedirectUri: import.meta.env.VITE_CALLBACK_URL,
    });
  }
  static reset() {
    this.initialized = false;
    this.initializing = false;
    this.user_info = {};
    sessionStorage.clear()
  }

 
 
  static getUserRoles =  () => {
      return this.user_info;
  };
 
 
 
}