// import { environment } from "../environments/environment";

export const msalConfig = {
  auth: {
    clientId: "",
    authority: "",
    redirectUri: import.meta.env.VITE_CALLBACK_URL,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

//   /**
//    * Scopes you add here will be prompted for user consent during sign-in.
//    * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
//    * For more information about OIDC scopes, visit:
//    * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
//    */

export const loginRequest = {
  scopes: ["User.Read"],
};
//   /**
//    * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
//    */
// //   export const graphConfig = {
// //     graphMeEndpoint: "",
// //   };