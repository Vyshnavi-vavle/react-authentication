// import { LicenseManager, ModuleRegistry, AllEnterpriseModule,provideGlobalGridOptions } from 'ag-grid-enterprise';

// Set your AG Grid Enterprise license key below
// LicenseManager.setLicenseKey("");

// provideGlobalGridOptions({ theme: 'legacy' });

// Register AG Grid modules for v35
// ModuleRegistry.registerModules([AllEnterpriseModule]);

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './styles/main.scss';
import { EventType, PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './Utils/authConfig.ts';
import { MsalProvider } from '@azure/msal-react';

export const msalInstance = new PublicClientApplication(msalConfig);
console.log(!import.meta.env.VITE_ENV);
 
if (import.meta.env.VITE_APP_ENV === "prod" || import.meta.env.VITE_APP_ENV === "dev") {
  console.log = () => { }
  console.debug = () => { }
}

msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise().then((response) => {
        if(response){
            msalInstance.setActiveAccount(response.account);
        }
    }).catch((error) => {
        console.error("Error during redirect login:", error);
    })

    const accounts = msalInstance.getAllAccounts();
    if(accounts.length > 0){
        msalInstance.setActiveAccount(accounts[0]);
    }

    msalInstance.enableAccountStorageEvents();
    msalInstance.addEventCallback((event:any) => {
        if(event.eventType == EventType.LOGIN_SUCCESS ||
            event.eventType == EventType.ACQUIRE_TOKEN_SUCCESS){
                if(event.payload.account){
                    msalInstance.setActiveAccount(event.payload.account);
                }
            }
    });

    createRoot(document.getElementById('root')!).render(
        <MsalProvider instance={msalInstance}>
            <App />
        </MsalProvider>
  )
})
