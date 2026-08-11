import { toast } from 'react-toastify';

// Global lock to ensure only one error toast shows at a time
let isToastActive = false;

export const setupErrorInterceptor = (axiosInstance) => {
    const isDev = import.meta.env.VITE_ENV === 'development';
      
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (isDev) console.error("API Error Log:", error);
            if (error.code === 'ERR_CANCELED') return Promise.reject(error);

            // If a toast is already active, ignore subsequent errors
            if (isToastActive) return Promise.reject(error);

            let errorMessage = "";
            let toastId = null;

            // 1. Handle Network Error
            if (!error.response) {
                errorMessage = "Network error. Please check your internet connection.";
                toastId = 'network-error';
            } 
            // 2. Handle specific status codes
            else {
                const { status, data } = error.response;
                
                switch (status) {
                    case 429:
                        errorMessage = data.message || "Too many attempts. Please wait 15 minutes.";
                        toastId = 'rate-limit';
                        break;
                    case 500:
                        errorMessage = "Our servers are currently having trouble. Please try again in a few minutes.";
                        toastId = 'server-error';
                        break;
                    default:
                        return Promise.reject(error); // Ignore other errors
                }
            }

            // 3. Trigger the toast and lock the system
            isToastActive = true;
            toast.error(errorMessage, {
                toastId: toastId,
                onClose: () => { isToastActive = false; }, // Unlock when toast disappears
                autoClose: 3000 // Unlock automatically after 3 seconds
            });

            return Promise.reject(error);
        }
    );
};