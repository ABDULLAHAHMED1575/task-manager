import api from "./api";

export const taskService =  {
    getAllTask: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/tasks?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getMyTask: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/tasks/my-tasks?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createTask: async (taskData) => {
        try {
            const response = await api.post('/tasks',taskData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTaskById: async (taskId) => {
        try {
            const response = await api.get(`/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            throw error;            
        }
    },
    updateTask:async (taskId, updates) => {
        try {
            const response = await api.put(`/tasks/${taskId}`,updates);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteTask: async (taskId) => {
        try {
            const response = await api.delete(`/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    assignTask: async (taskID,userId) => {
        try {
            const response = await api.put(`/tasks/${taskID}/assign`,{user_id: userId});
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    unassignTask: async (taskId) => {
        try {
            const response = await api.put(`/tasks/${taskId}/unassign`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    completeTask: async (taskId) => {
        try {
            const response = await api.put(`/tasks/${taskId}/complete`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    pendingTask: async (taskId) => {
        try {
            const response = await api.put(`/tasks/${taskId}/pending`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    searchTasks: async (query, filters={}) => {
        try {
            const params = new URLSearchParams({q:query,...filters});
            const response = await api.get(`/tasks/search?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTasksByTeam: async (teamId, filters={}) => {
        try {
            const params = new URLSearchParams(filters);
            const response =await api.get(`/tasks/team/${teamId}?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}