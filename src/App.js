import React, { useState, useEffect } from 'react';
import './App.css';
import { CONFIG } from './config/config';
import { getClanInfo, getMultiplePlayersStats } from './services/wargamingApi';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import ClanInfo from './components/ClanInfo';
import MemberList from './components/MemberList';
import BattleTeamManager from './components/BattleTeamManager';
import AdminTeamsView from './components/AdminTeamsView';
import PlayerModal from './components/PlayerModal';
import Loading from './components/Loading';
import Login from './components/Login';

// Componente principal de la app (con autenticación)
function AppContent() {
  const [clanInfo, setClanInfo] = useState(null);
  const [playersStats, setPlayersStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Buscando clan...');
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  const { user, logout, isAuthenticated, isOfficer, isAdmin } = useAuth();

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
      
      // Cargar estadísticas de miembros (para mostrar stats generales en página pública)
      if (clan.members) {
        setLoadingMessage('Cargando estadísticas de miembros...');
        const memberIds = clan.members.map(member => member.account_id);
        console.log('Total miembros:', memberIds.length);
        console.log('Primeros 5 IDs:', memberIds.slice(0, 5));
        
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

  // Si no está autenticado, mostrar vista pública
  if (!isAuthenticated()) {
    return <Login clanInfo={clanInfo} playersStats={playersStats} />;
  }

  // Usuario autenticado - mostrar contenido completo
  return (
    <div className="app">
      <div className="background-effects">
        <div className="smoke smoke-1"></div>
        <div className="smoke smoke-2"></div>
        <div className="smoke smoke-3"></div>
      </div>
      
      {/* Header con info de usuario */}
      <Header clanInfo={clanInfo} />
      
      {/* Barra de usuario */}
      <div className="user-bar">
        <div className="user-info">
          <span className="user-welcome">
            Bienvenido, <strong>{user?.name}</strong>
          </span>
          <span className={`user-role role-${user?.role}`}>
            {user?.role === 'officer' ? '⭐ Oficial' : 
             user?.role === 'admin' ? '👑 Admin' : '🎮 Miembro'}
          </span>
        </div>
        <button onClick={logout} className="logout-btn">
          🚪 Cerrar Sesión
        </button>
      </div>
      
      <main className="main-content">
        <ClanInfo clanInfo={clanInfo} />
        
        {/* Panel de oficial (solo para el usuario genérico "oficial" y admin genérico) */}
        {isOfficer() && user?.username === 'oficial' && (
          <div className="officer-panel">
            <h3 className="section-title">
              <span>⭐</span> Panel de Oficial
            </h3>
            <div className="officer-actions">
              <div className="officer-stat">
                <span className="officer-stat-value">{clanInfo?.members_count || 0}</span>
                <span className="officer-stat-label">Miembros Totales</span>
              </div>
              <div className="officer-stat">
                <span className="officer-stat-value">
                  {Object.values(playersStats).filter(p => {
                    const lastBattle = p?.last_battle_time;
                    if (!lastBattle) return false;
                    const daysSince = (Date.now() / 1000 - lastBattle) / (60 * 60 * 24);
                    return daysSince <= 7;
                  }).length}
                </span>
                <span className="officer-stat-label">Activos (7 días)</span>
              </div>
              <div className="officer-stat">
                <span className="officer-stat-value">
                  {Object.values(playersStats).filter(p => {
                    const lastBattle = p?.last_battle_time;
                    if (!lastBattle) return false;
                    const daysSince = (Date.now() / 1000 - lastBattle) / (60 * 60 * 24);
                    return daysSince > 30;
                  }).length}
                </span>
                <span className="officer-stat-label">Inactivos (+30 días)</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista de Admin: Ver todos los equipos */}
        {isAdmin() && user?.username === 'admin' ? (
          <>
            <AdminTeamsView playersStats={playersStats} />
            <MemberList 
              members={clanInfo?.members} 
              playersStats={playersStats}
              onMemberClick={handleMemberClick}
            />
          </>
        ) : isOfficer() && user?.username !== 'oficial' && user?.username !== 'admin' ? (
          /* Gestor de Equipos de Batalla para todos los oficiales */
          <BattleTeamManager 
            members={clanInfo?.members} 
            playersStats={playersStats}
            onMemberClick={handleMemberClick}
            username={user?.username}
          />
        ) : (
          <MemberList 
            members={clanInfo?.members} 
            playersStats={playersStats}
            onMemberClick={handleMemberClick}
          />
        )}
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

// App wrapper con AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
