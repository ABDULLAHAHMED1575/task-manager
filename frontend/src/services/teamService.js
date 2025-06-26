import api from "./api";

export const teamService = {
  getUserTeams: async () => {
    try {
      const response = await api.get("/teams");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createTeam: async (teamData) => {
    try {
      const response = await api.post("/teamCreate", teamData);
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
  addMember: async (teamId, memberData) => {
    try {
      console.log("Calling addMember API:", { teamId, memberData });

      const response = await api.post(`/teams/${teamId}/members`, memberData);

      console.log("Add member API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Add member API error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add member";

      throw new Error(errorMessage);
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
  },
};
