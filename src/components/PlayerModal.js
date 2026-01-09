import React, { useState, useEffect } from 'react';
import { calculateWN8, getWN8Color, getWN8Label, getPlayerTankStats, getAllVehiclesInfo } from '../services/wargamingApi';

const PlayerModal = ({ player, stats, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [tankStats, setTankStats] = useState([]);
  const [loadingTanks, setLoadingTanks] = useState(false);
  const [tanksLoaded, setTanksLoaded] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'battles', direction: 'desc' });

  // Cargar estadísticas de tanques cuando se selecciona la pestaña
  useEffect(() => {
    if (activeTab === 'tanks' && !tanksLoaded && player?.account_id) {
      loadTankStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTankStats = async () => {
    setLoadingTanks(true);
    try {
      const accountId = player.account_id;
      console.log('Loading tank stats for player:', accountId, 'Type:', typeof accountId);
      
      // Obtener estadísticas de tanques y info de vehículos en paralelo
      const [tankStatsResponse, vehiclesInfo] = await Promise.all([
        getPlayerTankStats(accountId),
        getAllVehiclesInfo()
      ]);

      console.log('Tank stats response:', tankStatsResponse);
      console.log('Tank stats data keys:', tankStatsResponse?.data ? Object.keys(tankStatsResponse.data) : 'no data');
      console.log('Vehicles info loaded:', vehiclesInfo ? Object.keys(vehiclesInfo).length : 0, 'vehicles');

      // Intentar acceder a los datos con el account_id como string o número
      const playerTanksData = tankStatsResponse?.data?.[accountId] || 
                              tankStatsResponse?.data?.[String(accountId)] ||
                              tankStatsResponse?.data?.[Number(accountId)];

      if (tankStatsResponse.status === 'ok' && playerTanksData) {
        const playerTanks = playerTanksData;
        console.log('Player tanks found:', playerTanks?.length || 0);
        
        // Combinar stats con info de vehículos
        const combinedTanks = playerTanks.map(tank => {
          const vehicleInfo = vehiclesInfo[tank.tank_id] || {};
          const tankAllStats = tank.all || {};
          
          // Calcular WN8 por tanque
          const tankWN8 = tankAllStats.battles > 0 ? calculateWN8(tankAllStats) : 0;
          
          return {
            tank_id: tank.tank_id,
            name: vehicleInfo.name || `Tanque #${tank.tank_id}`,
            tier: vehicleInfo.tier || 0,
            type: vehicleInfo.type || 'unknown',
            nation: vehicleInfo.nation || 'unknown',
            icon: vehicleInfo.images?.contour_icon || null,
            battles: tankAllStats.battles || 0,
            wins: tankAllStats.wins || 0,
            winRate: tankAllStats.battles > 0 ? ((tankAllStats.wins / tankAllStats.battles) * 100) : 0,
            damage_dealt: tankAllStats.damage_dealt || 0,
            avgDamage: tankAllStats.battles > 0 ? Math.round(tankAllStats.damage_dealt / tankAllStats.battles) : 0,
            frags: tankAllStats.frags || 0,
            avgFrags: tankAllStats.battles > 0 ? (tankAllStats.frags / tankAllStats.battles) : 0,
            wn8: tankWN8,
            last_battle_time: tank.last_battle_time || 0
          };
        });

        // Ordenar por batallas por defecto
        combinedTanks.sort((a, b) => b.battles - a.battles);
        
        setTankStats(combinedTanks);
        setTanksLoaded(true);
      } else {
        console.log('No tank data found. Status:', tankStatsResponse?.status);
        console.log('Response data:', tankStatsResponse?.data);
        setTanksLoaded(true); // Marcar como cargado aunque no haya datos
      }
    } catch (error) {
      console.error('Error cargando stats de tanques:', error);
      setTanksLoaded(true); // Marcar como cargado en caso de error
    }
    setLoadingTanks(false);
  };

  if (!player) return null;

  // Obtener estadísticas según el modo seleccionado
  const getStatsForMode = (mode) => {
    if (!stats?.statistics) return null;
    
    switch (mode) {
      case 'all':
        return stats.statistics.all;
      case 'random':
        return stats.statistics.regular_team;
      case 'advances':
        return stats.statistics.globalmap;
      case 'stronghold':
        const skirmish = stats.statistics.stronghold_skirmish || {};
        const defense = stats.statistics.stronghold_defense || {};
        
        if (skirmish.battles || defense.battles) {
          return {
            battles: (skirmish.battles || 0) + (defense.battles || 0),
            wins: (skirmish.wins || 0) + (defense.wins || 0),
            losses: (skirmish.losses || 0) + (defense.losses || 0),
            draws: (skirmish.draws || 0) + (defense.draws || 0),
            damage_dealt: (skirmish.damage_dealt || 0) + (defense.damage_dealt || 0),
            frags: (skirmish.frags || 0) + (defense.frags || 0),
            spotted: (skirmish.spotted || 0) + (defense.spotted || 0),
            xp: (skirmish.xp || 0) + (defense.xp || 0),
            survived_battles: (skirmish.survived_battles || 0) + (defense.survived_battles || 0),
            hits: (skirmish.hits || 0) + (defense.hits || 0),
            shots: (skirmish.shots || 0) + (defense.shots || 0),
            dropped_capture_points: (skirmish.dropped_capture_points || 0) + (defense.dropped_capture_points || 0),
            max_xp: Math.max(skirmish.max_xp || 0, defense.max_xp || 0),
            max_frags: Math.max(skirmish.max_frags || 0, defense.max_frags || 0),
            max_damage: Math.max(skirmish.max_damage || 0, defense.max_damage || 0),
          };
        }
        return null;
      default:
        return stats.statistics.all;
    }
  };

  const currentStats = getStatsForMode(activeTab);
  const allStats = stats?.statistics?.all;
  
  const wn8 = allStats && allStats.battles > 0 ? calculateWN8(allStats) : 0;
  const wn8Color = getWN8Color(wn8);
  const wn8Label = getWN8Label(wn8);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('es-ES');
  };

  const getWinRate = (modeStats) => {
    if (!modeStats?.battles || modeStats.battles === 0) return '0.00';
    return ((modeStats.wins / modeStats.battles) * 100).toFixed(2);
  };

  const getAvgDamage = (modeStats) => {
    if (!modeStats?.battles || modeStats.battles === 0) return '0';
    return Math.round(modeStats.damage_dealt / modeStats.battles).toLocaleString('es-ES');
  };

  const getAvgExp = (modeStats) => {
    if (!modeStats?.battles || modeStats.battles === 0) return '0';
    return Math.round(modeStats.xp / modeStats.battles).toLocaleString('es-ES');
  };

  const getAvgFrags = (modeStats) => {
    if (!modeStats?.battles || modeStats.battles === 0) return '0.00';
    return (modeStats.frags / modeStats.battles).toFixed(2);
  };

  const getSurvivalRate = (modeStats) => {
    if (!modeStats?.battles || modeStats.battles === 0) return '0.00';
    return ((modeStats.survived_battles / modeStats.battles) * 100).toFixed(2);
  };

  const getHitRatio = (modeStats) => {
    if (!modeStats?.shots || modeStats.shots === 0) return '0.00';
    return ((modeStats.hits / modeStats.shots) * 100).toFixed(2);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getRoleName = (role) => {
    const roles = {
      commander: 'Comandante',
      executive_officer: 'Oficial Ejecutivo',
      personnel_officer: 'Oficial de Personal',
      combat_officer: 'Oficial de Combate',
      intelligence_officer: 'Oficial de Inteligencia',
      quartermaster: 'Intendente',
      recruitment_officer: 'Oficial de Reclutamiento',
      junior_officer: 'Oficial Junior',
      private: 'Soldado',
      recruit: 'Recluta',
      reservist: 'Reservista'
    };
    return roles[role] || role || 'Miembro';
  };

  const getTankTypeIcon = (type) => {
    const types = {
      lightTank: '🔹',
      mediumTank: '🔸',
      heavyTank: '🔴',
      'AT-SPG': '🟢',
      SPG: '🟣'
    };
    return types[type] || '⚪';
  };

  const getTankTypeName = (type) => {
    const types = {
      lightTank: 'Ligero',
      mediumTank: 'Medio',
      heavyTank: 'Pesado',
      'AT-SPG': 'Cazatanques',
      SPG: 'Artillería'
    };
    return types[type] || type;
  };

  // Ordenar tanques
  const sortTanks = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedTanks = () => {
    const sorted = [...tankStats];
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  };

  const playerName = stats?.nickname || player?.account_name || 'Desconocido';

  // Tabs disponibles con descripciones claras
  const tabs = [
    { id: 'all', label: 'General', icon: '📊', description: 'Todas las batallas' },
    { id: 'random', label: 'Aleatorias', icon: '🎲', description: 'Batallas en equipo aleatorio', hidden: !stats?.statistics?.regular_team?.battles },
    { id: 'stronghold', label: 'Fortaleza', icon: '🏰', description: 'Escaramuzas + Defensa', hidden: !stats?.statistics?.stronghold_skirmish?.battles && !stats?.statistics?.stronghold_defense?.battles },
    { id: 'advances', label: 'Avances', icon: '🗺️', description: 'Global Map / Campaña', hidden: !stats?.statistics?.globalmap?.battles },
    { id: 'tanks', label: 'Tanques', icon: '🎖️', description: 'Stats por vehículo' },
    { id: 'tomato', label: 'Enlaces', icon: '🔗', description: 'Stats externas' },
  ];

  const visibleTabs = tabs.filter(tab => !tab.hidden);

  const getModeTitle = () => {
    const currentTab = tabs.find(t => t.id === activeTab);
    return currentTab ? `${currentTab.label} (${currentTab.description})` : 'Estadísticas';
  };

  // Renderizar estadísticas de Tomato.gg
  const renderTomatoStats = () => {
    const playerName = stats?.nickname || player?.account_name;
    const playerAllStats = stats?.statistics?.all;
    
    // Calcular estadísticas adicionales
    const kdRatio = playerAllStats?.frags && playerAllStats?.battles 
      ? (playerAllStats.frags / (playerAllStats.battles - playerAllStats.survived_battles || 1)).toFixed(2)
      : '0.00';
    
    const avgSpots = playerAllStats?.spotted && playerAllStats?.battles
      ? (playerAllStats.spotted / playerAllStats.battles).toFixed(2)
      : '0.00';

    return (
      <div className="tomato-stats-container">
        {/* WN8 calculado */}
        <div className="stats-section tomato-highlight">
          <h3>📊 WN8 Estimado</h3>
          <div className="tomato-wn8-display">
            <div className="tomato-wn8-main" style={{ backgroundColor: wn8Color }}>
              <span className="tomato-wn8-value">{wn8}</span>
              <span className="tomato-wn8-label">{wn8Label}</span>
            </div>
          </div>
          <p className="wn8-note">* WN8 calculado con fórmula aproximada</p>
        </div>

        {/* Estadísticas adicionales */}
        {playerAllStats && (
          <div className="stats-section">
            <h3>📈 Estadísticas Avanzadas</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{formatNumber(playerAllStats.battles)}</span>
                <span className="stat-label">Batallas Totales</span>
              </div>
              <div className="stat-box highlight">
                <span className="stat-value" style={{ color: parseFloat(getWinRate(playerAllStats)) >= 50 ? '#2ecc71' : '#e74c3c' }}>
                  {getWinRate(playerAllStats)}%
                </span>
                <span className="stat-label">% Victorias</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{getAvgDamage(playerAllStats)}</span>
                <span className="stat-label">Daño Promedio</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{kdRatio}</span>
                <span className="stat-label">K/D Ratio</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{getAvgFrags(playerAllStats)}</span>
                <span className="stat-label">Frags/Partida</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{avgSpots}</span>
                <span className="stat-label">Spots/Partida</span>
              </div>
            </div>
          </div>
        )}

        {/* Links externos */}
        <div className="stats-section">
          <h3>🔗 Ver Estadísticas Completas</h3>
          <p className="external-links-note">
            Para ver el WN8 oficial y estadísticas detalladas, visita estos sitios:
          </p>
          <div className="external-links-grid">
            <a 
              href={`https://www.tomato.gg/stats/NA/${playerName}=${player?.account_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="external-stat-link tomato"
            >
              <span className="link-icon">🍅</span>
              <span className="link-name">Tomato.gg</span>
              <span className="link-desc">WN8, Recientes, MOE</span>
            </a>
            <a 
              href={`https://wotlabs.net/na/player/${playerName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="external-stat-link wotlabs"
            >
              <span className="link-icon">📊</span>
              <span className="link-name">WoTLabs</span>
              <span className="link-desc">WN8, Historial</span>
            </a>
            <a 
              href={`https://worldoftanks.com/en/community/accounts/${player?.account_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="external-stat-link official"
            >
              <span className="link-icon">🎮</span>
              <span className="link-name">WoT Oficial</span>
              <span className="link-desc">Perfil oficial</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar tabla de tanques
  const renderTanksTable = () => {
    if (loadingTanks) {
      return (
        <div className="tanks-loading">
          <span className="loading-icon">⏳</span>
          <p>Cargando estadísticas de tanques...</p>
        </div>
      );
    }

    if (tankStats.length === 0) {
      return (
        <div className="no-stats">
          <span className="no-stats-icon">🎖️</span>
          <p>No se encontraron tanques para este jugador</p>
          <p className="no-stats-hint">
            Revisa la consola (F12) para más detalles.<br/>
            Account ID: {player?.account_id}
          </p>
        </div>
      );
    }

    const sortedTanks = getSortedTanks();
    const getSortIcon = (key) => {
      if (sortConfig.key !== key) return '↕️';
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    // Contar tanques por tier
    const tier10Count = tankStats.filter(t => t.tier === 10).length;
    const tier8Count = tankStats.filter(t => t.tier === 8).length;

    return (
      <div className="tanks-table-container">
        <div className="tanks-summary">
          <span>📦 {tankStats.length} tanques jugados</span>
          <span>⚔️ {formatNumber(tankStats.reduce((sum, t) => sum + t.battles, 0))} batallas totales</span>
          <span className="tier-count tier-10">⭐ {tier10Count} Tier X</span>
          <span className="tier-count tier-8">🔸 {tier8Count} Tier VIII</span>
        </div>
        <div className="tanks-table-wrapper">
          <table className="tanks-table">
            <thead>
              <tr>
                <th onClick={() => sortTanks('name')}>
                  Tanque {getSortIcon('name')}
                </th>
                <th onClick={() => sortTanks('tier')} className="center">
                  Tier {getSortIcon('tier')}
                </th>
                <th onClick={() => sortTanks('battles')} className="center">
                  Batallas {getSortIcon('battles')}
                </th>
                <th onClick={() => sortTanks('winRate')} className="center">
                  % Victorias {getSortIcon('winRate')}
                </th>
                <th onClick={() => sortTanks('avgDamage')} className="center">
                  Daño Prom. {getSortIcon('avgDamage')}
                </th>
                <th onClick={() => sortTanks('wn8')} className="center">
                  WN8 {getSortIcon('wn8')}
                </th>
                <th onClick={() => sortTanks('last_battle_time')} className="center">
                  Última {getSortIcon('last_battle_time')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTanks.slice(0, 50).map(tank => (
                <tr key={tank.tank_id}>
                  <td className="tank-name-cell">
                    <span className="tank-type-icon">{getTankTypeIcon(tank.type)}</span>
                    {tank.icon && <img src={tank.icon} alt="" className="tank-icon" />}
                    <span className="tank-name">{tank.name}</span>
                  </td>
                  <td className="center tier-cell">
                    <span className={`tier tier-${tank.tier}`}>{tank.tier}</span>
                  </td>
                  <td className="center">{formatNumber(tank.battles)}</td>
                  <td className="center" style={{ color: tank.winRate >= 50 ? '#2ecc71' : '#e74c3c' }}>
                    {tank.winRate.toFixed(1)}%
                  </td>
                  <td className="center">{formatNumber(tank.avgDamage)}</td>
                  <td className="center">
                    <span className="wn8-cell" style={{ backgroundColor: getWN8Color(tank.wn8) }}>
                      {tank.wn8}
                    </span>
                  </td>
                  <td className="center date-cell">{formatShortDate(tank.last_battle_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tankStats.length > 50 && (
          <p className="tanks-note">Mostrando los 50 tanques más relevantes de {tankStats.length} totales</p>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content player-modal-extended" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <div className="player-avatar">
            <span className="avatar-icon">🐺</span>
          </div>
          <div className="player-info">
            <h2 className="player-name">{playerName}</h2>
            <span className="player-role">{getRoleName(player?.role)}</span>
            <div className="player-wn8" style={{ backgroundColor: wn8Color }}>
              <span className="wn8-big">{wn8}</span>
              <span className="wn8-label">{wn8Label}</span>
            </div>
          </div>
        </div>

        {/* Tabs de modos de juego */}
        <div className="mode-tabs">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              className={`mode-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.description}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-description">{tab.description}</span>
            </button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === 'tomato' ? (
            <>
              <div className="mode-title">
                <h3>🔗 Enlaces a Estadísticas Externas</h3>
              </div>
              {renderTomatoStats()}
            </>
          ) : activeTab === 'tanks' ? (
            <>
              <div className="mode-title">
                <h3>🎖️ Estadísticas por Tanque</h3>
              </div>
              {renderTanksTable()}
            </>
          ) : (
            <>
              <div className="mode-title">
                <h3>{getModeTitle()}</h3>
              </div>

              {currentStats && currentStats.battles > 0 ? (
                <>
                  <div className="stats-section">
                    <h3>📊 Estadísticas de Combate</h3>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.battles)}</span>
                        <span className="stat-label">Batallas</span>
                      </div>
                      <div className="stat-box highlight">
                        <span className="stat-value" style={{ color: parseFloat(getWinRate(currentStats)) >= 50 ? '#2ecc71' : '#e74c3c' }}>
                          {getWinRate(currentStats)}%
                        </span>
                        <span className="stat-label">% Victorias</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.wins)}</span>
                        <span className="stat-label">Victorias</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.losses)}</span>
                        <span className="stat-label">Derrotas</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.draws || 0)}</span>
                        <span className="stat-label">Empates</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{getSurvivalRate(currentStats)}%</span>
                        <span className="stat-label">Supervivencia</span>
                      </div>
                    </div>
                  </div>

                  <div className="stats-section">
                    <h3>💥 Combate</h3>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.damage_dealt)}</span>
                        <span className="stat-label">Daño Total</span>
                      </div>
                      <div className="stat-box highlight">
                        <span className="stat-value">{getAvgDamage(currentStats)}</span>
                        <span className="stat-label">Daño Promedio</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.frags)}</span>
                        <span className="stat-label">Tanques Destruidos</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{getAvgFrags(currentStats)}</span>
                        <span className="stat-label">Destruidos/Batalla</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.spotted)}</span>
                        <span className="stat-label">Detectados</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{getHitRatio(currentStats)}%</span>
                        <span className="stat-label">Precisión</span>
                      </div>
                    </div>
                  </div>

                  <div className="stats-section">
                    <h3>⭐ Experiencia y Récords</h3>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.xp)}</span>
                        <span className="stat-label">EXP Total</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{getAvgExp(currentStats)}</span>
                        <span className="stat-label">EXP Promedio</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.max_xp || 0)}</span>
                        <span className="stat-label">EXP Máxima</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.max_frags || 0)}</span>
                        <span className="stat-label">Max Destruidos</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.max_damage || 0)}</span>
                        <span className="stat-label">Daño Máximo</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{formatNumber(currentStats.dropped_capture_points)}</span>
                        <span className="stat-label">Puntos Defensa</span>
                      </div>
                    </div>
                  </div>

                </>
              ) : (
                <div className="no-stats">
                  <span className="no-stats-icon">📊</span>
                  <p>No hay estadísticas disponibles para este modo de juego</p>
                  <p className="no-stats-hint">Este jugador no ha participado en {getModeTitle().toLowerCase()}</p>
                </div>
              )}

              {/* Solo mostrar actividad en la pestaña general */}
              {activeTab === 'all' && (
                <div className="stats-section">
                  <h3>📅 Actividad</h3>
                  <div className="stats-grid">
                    <div className="stat-box wide">
                      <span className="stat-value">{formatDate(stats?.created_at)}</span>
                      <span className="stat-label">Cuenta Creada</span>
                    </div>
                    <div className="stat-box wide">
                      <span className="stat-value">{formatDate(stats?.last_battle_time)}</span>
                      <span className="stat-label">Última Batalla</span>
                    </div>
                    <div className="stat-box wide">
                      <span className="stat-value">{formatDate(stats?.updated_at)}</span>
                      <span className="stat-label">Última Actualización</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <a 
            href={`https://worldoftanks.com/en/community/accounts/${player?.account_id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            Ver en World of Tanks 🔗
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;
