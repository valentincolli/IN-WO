import axios from 'axios';
import { CONFIG, getApiBaseUrl } from '../config/config';

const API_KEY = CONFIG.API_KEY;
const BASE_URL = getApiBaseUrl();

// Crear instancia de axios con configuración
const api = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  }
});

// Buscar clan por nombre o tag
export const searchClan = async (searchQuery) => {
  try {
    const response = await api.get(`${BASE_URL}/clans/list/`, {
      params: {
        application_id: API_KEY,
        search: searchQuery,
        limit: 10
      }
    });
    console.log('Search Clan Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error buscando clan:', error);
    throw error;
  }
};

// Obtener información detallada del clan por ID
export const getClanInfo = async (clanId) => {
  try {
    console.log('Fetching clan info for ID:', clanId);
    
    const response = await api.get(`${BASE_URL}/clans/info/`, {
      params: {
        application_id: API_KEY,
        clan_id: clanId,
        fields: 'clan_id,created_at,creator_id,creator_name,description,is_clan_disbanded,leader_id,leader_name,members_count,motto,name,old_name,old_tag,renamed_at,tag,updated_at,color,emblems,members'
      }
    });
    
    console.log('Clan Info Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo info del clan:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener estadísticas de un jugador
export const getPlayerStats = async (accountId) => {
  try {
    const response = await api.get(`${BASE_URL}/account/info/`, {
      params: {
        application_id: API_KEY,
        account_id: accountId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo stats del jugador:', error);
    throw error;
  }
};

// Obtener estadísticas de múltiples jugadores
export const getMultiplePlayersStats = async (accountIds) => {
  try {
    const response = await api.get(`${BASE_URL}/account/info/`, {
      params: {
        application_id: API_KEY,
        account_id: accountIds.join(',')
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo stats de jugadores:', error);
    throw error;
  }
};

// Obtener tanques del jugador
export const getPlayerTanks = async (accountId) => {
  try {
    const response = await api.get(`${BASE_URL}/account/tanks/`, {
      params: {
        application_id: API_KEY,
        account_id: accountId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tanques:', error);
    throw error;
  }
};

// Obtener información de vehículos (tanques)
export const getVehiclesInfo = async (tankIds) => {
  try {
    const response = await api.get(`${BASE_URL}/encyclopedia/vehicles/`, {
      params: {
        application_id: API_KEY,
        tank_id: tankIds.join(',')
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo info de vehículos:', error);
    throw error;
  }
};

// Buscar clan por tag y obtener toda la información
export const getClanByTag = async (tag) => {
  try {
    // Primero buscamos el clan
    const searchResult = await searchClan(tag);
    
    if (searchResult.status === 'ok' && searchResult.data && searchResult.data.length > 0) {
      // Encontrar el clan exacto por tag
      const clan = searchResult.data.find(c => c.tag === tag) || searchResult.data[0];
      
      // Obtener información completa del clan
      const clanInfo = await getClanInfo(clan.clan_id);
      
      if (clanInfo.status === 'ok') {
        return clanInfo.data[clan.clan_id];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo clan por tag:', error);
    throw error;
  }
};

// Calcular WN8 aproximado (fórmula simplificada)
export const calculateWN8 = (stats) => {
  if (!stats || !stats.battles || stats.battles === 0) return 0;
  
  const avgDamage = stats.damage_dealt / stats.battles;
  const avgFrags = stats.frags / stats.battles;
  const avgSpotted = stats.spotted / stats.battles;
  const avgDef = stats.dropped_capture_points / stats.battles;
  const winRate = (stats.wins / stats.battles) * 100;
  
  // Fórmula WN8 simplificada (aproximación)
  const wn8 = (avgDamage * 0.4) + (avgFrags * 250) + (avgSpotted * 150) + (avgDef * 150) + (winRate * 10);
  
  return Math.round(wn8);
};

// Obtener color del WN8
export const getWN8Color = (wn8) => {
  if (wn8 >= 2900) return '#9b59b6'; // Unicum - Púrpura
  if (wn8 >= 2450) return '#8e44ad'; // Great - Púrpura oscuro
  if (wn8 >= 2000) return '#3498db'; // Very Good - Azul
  if (wn8 >= 1600) return '#2ecc71'; // Good - Verde
  if (wn8 >= 1200) return '#f1c40f'; // Above Average - Amarillo
  if (wn8 >= 900) return '#e67e22'; // Average - Naranja
  if (wn8 >= 450) return '#e74c3c'; // Below Average - Rojo
  return '#c0392b'; // Bad - Rojo oscuro
};

// Obtener etiqueta del WN8
export const getWN8Label = (wn8) => {
  if (wn8 >= 2900) return 'Super Unicum';
  if (wn8 >= 2450) return 'Unicum';
  if (wn8 >= 2000) return 'Muy Bueno';
  if (wn8 >= 1600) return 'Bueno';
  if (wn8 >= 1200) return 'Sobre Promedio';
  if (wn8 >= 900) return 'Promedio';
  if (wn8 >= 450) return 'Bajo Promedio';
  return 'Principiante';
};
