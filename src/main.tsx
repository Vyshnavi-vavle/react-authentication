import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import './index.css'
import './main.scss'
import App from './App.tsx'
import { EventType, PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './Util/authConfig.ts';
import { MsalProvider } from '@azure/msal-react';
import { UserProvider } from './context/appContext';

import 'ag-grid-enterprise';
import { LicenseManager, ModuleRegistry, AllEnterpriseModule, provideGlobalGridOptions } from 'ag-grid-enterprise';

// Set your AG Grid Enterprise license key below
LicenseManager.setLicenseKey("Using_this_{AG_Grid}_Enterprise_key_{AG-129802}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Siemens_Technology_and_Services_Private_Limited}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{AG_Grid}_only_for_{2}_Front-End_JavaScript_developers___All_Front-End_JavaScript_developers_working_on_{AG_Grid}_need_to_be_licensed___{AG_Grid}_has_been_granted_a_Deployment_License_Add-on_for_{1}_Production_Environment___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{27_May_2027}____[v3]_[01]_MTgxMTM3MjQwMDAwMA==6b4fd3b1cc0cbee31ec7b8e207249bec");

provideGlobalGridOptions({ theme: 'legacy' });

// Register AG Grid modules for v35
ModuleRegistry.registerModules([AllEnterpriseModule]);

export const msalInstance = new PublicClientApplication(msalConfig);
console.log(!import.meta.env.VITE_ENV);

if (import.meta.env.VITE_APP_ENV === "prod" || import.meta.env.VITE_APP_ENV === "dev") {
  console.log = () => { }
  console.debug = () => { }
}

msalInstance.initialize().then(() => {
  msalInstance.handleRedirectPromise().then((response) => {
    if (response) {
      msalInstance.setActiveAccount(response.account);
    }
  }).catch((error) => {
    console.error("Error during redirect login:", error);
  })

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  msalInstance.enableAccountStorageEvents();
  msalInstance.addEventCallback((event: any) => {
    if (event.eventType == EventType.LOGIN_SUCCESS ||
      event.eventType == EventType.ACQUIRE_TOKEN_SUCCESS) {
      if (event.payload.account) {
        msalInstance.setActiveAccount(event.payload.account);
      }
    }
  });

  createRoot(document.getElementById('root')!).render(
    <MsalProvider instance={msalInstance}>
      <React.StrictMode>
        <UserProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </UserProvider>
      </React.StrictMode>
    </MsalProvider>
  )
})
