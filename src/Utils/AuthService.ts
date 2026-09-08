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
    let activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        activeAccount = accounts[0];
        msalInstance.setActiveAccount(activeAccount);
      }
    }

    if (!activeAccount) {
      console.warn("No active account found in MSAL");
      return null;
    }
    try {
      const response = await msalInstance.acquireTokenSilent({
        account: activeAccount,
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
      postLogoutRedirectUri: import.meta.env.VITE_CALLBACK_URL,
    });
  }
  static reset() {
    this.initialized = false;
    this.initializing = false;
    this.user_info = {};
    sessionStorage.clear()
    localStorage.removeItem('user_name');
  }

 
 
  static getUserRoles =  () => {
      return this.user_info;
  };

  static getUserName(): string {
    let activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        activeAccount = accounts[0];
      }
    }
    const username = activeAccount?.username ?? '';
    if (username) {
      localStorage.setItem('user_name', username);
    }
    return username;
  }
}
