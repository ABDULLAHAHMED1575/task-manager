import { register } from "module";
import api from "./api";

export const authService = {
    register: async (userData) => {
        try {
            const response = await api.post('/authRegister',userData)
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post('/login',credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/logout');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    checkAuth: async () => {
        try {
            const response = await api.get('/teams');
            return { authenticated: true };
        } catch (error) {
            return { authenticated: false };
        }
    },
}