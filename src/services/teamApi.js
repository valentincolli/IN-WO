import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Obtener equipo de un usuario
export const getTeam = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teams/${username}`);
    if (response.data.success) {
      return response.data.team || [];
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo equipo del servidor:', error);
    // Si el servidor no está disponible, intentar cargar desde localStorage como fallback
    try {
      const storageKey = `${username.toLowerCase()}_battle_team`;
      const savedTeam = localStorage.getItem(storageKey);
      if (savedTeam) {
        return JSON.parse(savedTeam);
      }
    } catch (localError) {
      console.error('Error cargando desde localStorage:', localError);
    }
    return [];
  }
};

// Guardar equipo de un usuario
export const saveTeam = async (username, team) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/teams/${username}`, {
      team: team
    });
    return response.data.success;
  } catch (error) {
    console.error('Error guardando equipo:', error);
    // Si el servidor no está disponible, intentar guardar en localStorage como fallback
    try {
      const storageKey = `${username.toLowerCase()}_battle_team`;
      localStorage.setItem(storageKey, JSON.stringify(team));
      return true;
    } catch (localError) {
      console.error('Error guardando en localStorage:', localError);
      return false;
    }
  }
};

// Eliminar equipo de un usuario
export const deleteTeam = async (username) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/teams/${username}`);
    return response.data.success;
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    return false;
  }
};

// Obtener todos los equipos (solo para admin)
export const getAllTeams = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teams`);
    if (response.data.success) {
      return response.data.teams || {};
    }
    return {};
  } catch (error) {
    console.error('Error obteniendo todos los equipos:', error);
    // Fallback: intentar cargar desde localStorage
    const teams = {};
    try {
      const firearielTeam = localStorage.getItem('fireariel_battle_team');
      const kiritonyuTeam = localStorage.getItem('kiritonyu_battle_team');
      if (firearielTeam) teams.fireariel = JSON.parse(firearielTeam);
      if (kiritonyuTeam) teams.kiritonyu = JSON.parse(kiritonyuTeam);
    } catch (localError) {
      console.error('Error cargando desde localStorage:', localError);
    }
    return teams;
  }
};
