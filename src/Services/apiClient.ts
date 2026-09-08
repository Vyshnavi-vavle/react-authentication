import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthService } from '../Util/authService';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeRequests = 0; // Counter to track active API calls
const shownErrors = new Set(); // Track errors already shown
let interceptorsRegistered = false;

// Add interceptors globally to apiClient
export const setupApiClientWithLoader = (setLoading: (loading: boolean) => void) => {
  if (interceptorsRegistered) {
    return;
  }

  apiClient.interceptors.request.use(
    async (config) => {
      const token = await AuthService.getToken();
      if(token){
        config.headers.Authorization = `Bearer ${token}`;
      }
      const skipLoader = (config as any).skipLoader || config.headers?.['Skip-Loader'] === 'true';
      if (!skipLoader) {
        activeRequests += 1; // Increment counter
        setLoading(true);
      }
      return config;
    },
    (error) => {
      activeRequests = Math.max(activeRequests - 1, 0); // Decrement counter safely
      if (activeRequests === 0) setLoading(false);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      const skipLoader = (response.config as any).skipLoader || response.config.headers?.['Skip-Loader'] === 'true';
      if (!skipLoader) {
        activeRequests = Math.max(activeRequests - 1, 0); // Decrement counter safely
        if (activeRequests === 0) {
          setLoading(false);
        }
      }
      return response;
    },
    (error) => {
      const cfg = error?.config || {};
      const skipLoader = (cfg as any).skipLoader || cfg.headers?.['Skip-Loader'] === 'true';
      const skipErrorToastr = (cfg as any).skipErrorToastr || cfg.headers?.['Skip-Error-Toastr'] === 'true';
      if (!skipLoader) {
        activeRequests = Math.max(activeRequests - 1, 0); // Decrement counter safely
        if (activeRequests === 0) setLoading(false);
      }

      // Show toast error message only if not already shown
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      if (!skipErrorToastr && !shownErrors.has(errorMessage)) {
        shownErrors.add(errorMessage);
        toast.error(errorMessage);

        // Remove the error from the set after a delay to allow future notifications
        setTimeout(() => shownErrors.delete(errorMessage), 5000);
      }
      if (error.response) {
        if (error.response.status === 401) {
          AuthService.logout();
          AuthService.reset();
        }
      //    else if (error.response.status === 404 && window.location.pathname !== '/unAuthorized') {
      //     window.location.href = '/unAuthorized';
      //   }
      }

      return Promise.reject(error);
    }
  );

  interceptorsRegistered = true;
};

export default apiClient;
