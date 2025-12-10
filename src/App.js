import React, { useState, useEffect } from 'react';
import './App.css';
import { CONFIG } from './config/config';
import { getClanInfo, getMultiplePlayersStats } from './services/wargamingApi';
import Header from './components/Header';
import ClanInfo from './components/ClanInfo';
import MemberList from './components/MemberList';
import PlayerModal from './components/PlayerModal';
import Loading from './components/Loading';

function App() {
  const [clanInfo, setClanInfo] = useState(null);
  const [playersStats, setPlayersStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Buscando clan...');
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    loadClanData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClanData = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      
      console.log('=== INICIANDO CARGA DE DATOS ===');
      console.log('Clan ID:', CONFIG.CLAN_ID);
      console.log('API Key:', CONFIG.API_KEY);
      
      // Obtener información del clan usando el ID directo
      setLoadingMessage('Cargando información del clan Infernal Wolves...');
      const clanResponse = await getClanInfo(CONFIG.CLAN_ID);
      
      console.log('Respuesta del clan:', clanResponse);
      
      if (!clanResponse) {
        throw new Error('No se recibió respuesta de la API');
      }
      
      if (clanResponse.status === 'error') {
        throw new Error(clanResponse.error?.message || 'Error de la API de Wargaming');
      }
      
      if (clanResponse.status !== 'ok') {
        throw new Error(`Estado inesperado: ${clanResponse.status}`);
      }
      
      if (!clanResponse.data || !clanResponse.data[CONFIG.CLAN_ID]) {
        throw new Error('No se encontraron datos del clan en la respuesta');
      }
      
      const clan = clanResponse.data[CONFIG.CLAN_ID];
      console.log('Datos del clan:', clan);
      setClanInfo(clan);
      
      // Obtener estadísticas de todos los miembros
      if (clan.members) {
        setLoadingMessage('Cargando estadísticas de miembros...');
        // clan.members es un ARRAY, extraemos los account_id de cada miembro
        const memberIds = clan.members.map(member => member.account_id);
        console.log('Total miembros:', memberIds.length);
        console.log('Primeros 5 IDs:', memberIds.slice(0, 5));
        
        // Dividir en chunks de 100 (límite de la API)
        const chunks = [];
        for (let i = 0; i < memberIds.length; i += 100) {
          chunks.push(memberIds.slice(i, i + 100));
        }
        
        const allStats = {};
        for (let i = 0; i < chunks.length; i++) {
          setLoadingMessage(`Cargando estadísticas... (${i + 1}/${chunks.length})`);
          const response = await getMultiplePlayersStats(chunks[i]);
          console.log('Response chunk', i, ':', response);
          if (response.status === 'ok' && response.data) {
            Object.assign(allStats, response.data);
          }
        }
        
        setPlayersStats(allStats);
        console.log('Stats cargados:', Object.keys(allStats).length);
        console.log('Ejemplo de stats:', Object.values(allStats)[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('=== ERROR COMPLETO ===');
      console.error('Error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      
      let errorMsg = err.message || 'Error desconocido';
      let details = '';
      
      if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Error de red - No se puede conectar a la API';
        details = 'Esto puede ser un problema de CORS o de conexión a internet. Revisa la consola del navegador (F12) para más detalles.';
      } else if (err.response) {
        details = `Status: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
      }
      
      setError(errorMsg);
      setErrorDetails(details);
      setLoading(false);
    }
  };

  const handleMemberClick = (member, stats) => {
    setSelectedPlayer({ member, stats });
  };

  const closeModal = () => {
    setSelectedPlayer(null);
  };

  if (loading) {
    return <Loading message={loadingMessage} />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h2>Error al cargar el clan</h2>
          <p>{error}</p>
          {errorDetails && (
            <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>
              {errorDetails}
            </p>
          )}
          <button onClick={loadClanData} className="retry-button">
            🔄 Reintentar
          </button>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
            Abre la consola del navegador (F12) para ver más detalles del error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="background-effects">
        <div className="smoke smoke-1"></div>
        <div className="smoke smoke-2"></div>
        <div className="smoke smoke-3"></div>
      </div>
      
      <Header clanInfo={clanInfo} />
      
      <main className="main-content">
        <ClanInfo clanInfo={clanInfo} />
        <MemberList 
          members={clanInfo?.members} 
          playersStats={playersStats}
          onMemberClick={handleMemberClick}
        />
      </main>

      <footer className="footer">
        <p>
          <span className="wolf-emoji">🐺</span>
          Infernal Wolves - World of Tanks NA
          <span className="wolf-emoji">🐺</span>
        </p>
        <p className="footer-small">
          Datos obtenidos de la API de Wargaming
        </p>
      </footer>

      {selectedPlayer && (
        <PlayerModal 
          player={selectedPlayer.member}
          stats={selectedPlayer.stats}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default App;
