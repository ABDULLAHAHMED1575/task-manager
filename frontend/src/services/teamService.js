import api from "./api";

export const teamService = {
    getUserTeams: async () => {
        try {
            const response = await api.get('/teams');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createTeam: async (teamData) => {
        try {
            const response = await api.post('/teamCreate', teamData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTeamById: async (teamId) => {
        try {
            const response = await api.get(`/teams/${teamId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateTeam: async (teamId, updates) => {
        try {
            const response = await api.put(`/teams/${teamId}`, updates);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteTeam: async (teamId) => {
        try {
            const response = await api.delete(`/teams/${teamId}`);
            return response.data;
        } catch (error) {
            throw error;            
        }
    },
    addMember: async (teamId, userId) => {
        try {
            const response = await api.post(`/teams/${teamId}/members`, { userId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    removeMember: async (teamId, userId) => {
        try {
            const response = await api.delete(`/teams/${teamId}/members/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTeamMembers: async (teamId) => {
        try {
            const response = await api.get(`/teams/${teamId}/members`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTeamStatistics: async (teamId) => {
        try {
            const response = await api.get(`/teams/${teamId}/statistics`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTeamTasks: async (teamId, filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/teams/${teamId}/tasks?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}