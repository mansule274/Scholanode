import axios from "axios";
import { setupErrorInterceptor } from "../api/client";
import BASE_URL from "../api/config";

const publicAxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
    withCredentials: true,
});

setupErrorInterceptor(publicAxiosInstance);


export default publicAxiosInstance;