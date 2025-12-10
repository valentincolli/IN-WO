// Configuración de la aplicación Infernal Wolves
export const CONFIG = {
  // API Key de Wargaming
  API_KEY: '12c07cd785495f995bb10a021dcb0ba9',
  
  // Región del servidor (na = Norteamérica)
  REGION: 'na',
  
  // ID del clan (obtenido de la API)
  CLAN_ID: 1000023780,
  
  // Tag del clan
  CLAN_TAG: 'IN-WO',
  
  // Nombre del clan
  CLAN_NAME: 'Infernal Wolves',
  
  // Base URLs para las APIs de Wargaming
  API_BASE_URLS: {
    na: 'https://api.worldoftanks.com/wot',
    eu: 'https://api.worldoftanks.eu/wot',
    ru: 'https://api.tanki.su/wot',
    asia: 'https://api.worldoftanks.asia/wot'
  }
};

// Obtener la URL base según la región
export const getApiBaseUrl = () => {
  return CONFIG.API_BASE_URLS[CONFIG.REGION];
};
