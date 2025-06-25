import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL:BASE_URL,
    headers:{
        'Content-Type':'application/json',
    },
    withCredentials: true,
    timeout: 10000
})

api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        let errorMessage = 'Something went wrong';

        if (error.response) {
            const { status, data } = error.response;

            if (data && data.message) {
                errorMessage = data.message;
            } else if (data && data.error) {
                errorMessage = data.error;
            } else if (data && data.details) {
                errorMessage = data.details.map(detail => detail.msg).join(', ');
            } else if (status === 401) {
                errorMessage = 'Please log in to continue';
            } else if (status === 403) {
                errorMessage = 'Access denied';
            } else if (status === 404) {
                errorMessage = 'Not found';
            } else if (status === 409) {
                errorMessage = 'Conflict - resource already exists';
            } else if (status === 422) {
                errorMessage = 'Validation failed';
            } else if (status === 429) {
                errorMessage = 'Too many requests - please try again later';
            } else if (status === 500) {
                errorMessage = 'Internal server error';
            } else if (status >= 400) {
                errorMessage = `Error ${status}: ${data?.message || 'Bad request'}`;
            }
        } else if (error.request) {
            errorMessage = 'Network error - check your connection';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout - please try again';
        }

        console.error('API Error:', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

export default api;