import React, { useState, useEffect } from 'react';
import { getAllTeams, saveTeam } from '../services/teamApi';
import { calculateWN8, getPlayerTankStats, getAllVehiclesInfo } from '../services/wargamingApi';

const AdminTeamsView = ({ playersStats }) => {
  const [allTeams, setAllTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [tier10Counts, setTier10Counts] = useState({});
  const [loadingTier10, setLoadingTier10] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [draggedFromTeam, setDraggedFromTeam] = useState(null);
  const [dragOverTeam, setDragOverTeam] = useState(null);

  useEffect(() => {
    loadAllTeams();
    
    // Recargar equipos cada 10 segundos para ver cambios en tiempo real
    const interval = setInterval(() => {
      loadAllTeams();
    }, 10000);
    
    // Recargar cuando la ventana recupera el foco
    const handleFocus = () => {
      loadAllTeams();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);


  const loadAllTeams = async () => {
    setLoading(true);
    const teams = await getAllTeams();
    setAllTeams(teams);
    setLoading(false);
  };

  // Manejar inicio del drag
  const handleDragStart = (e, player, fromUsername) => {
    setDraggedPlayer(player);
    setDraggedFromTeam(fromUsername);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
    e.target.style.opacity = '0.5';
  };

  // Manejar fin del drag
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedPlayer(null);
    setDraggedFromTeam(null);
    setDragOverTeam(null);
  };

  // Manejar cuando se arrastra sobre una zona de drop
  const handleDragOver = (e, teamUsername) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (teamUsername !== draggedFromTeam) {
      setDragOverTeam(teamUsername);
    }
  };

  // Manejar cuando se sale de la zona de drop
  const handleDragLeave = (e) => {
    setDragOverTeam(null);
  };

  // Manejar el drop
  const handleDrop = async (e, toUsername) => {
    e.preventDefault();
    setDragOverTeam(null);

    if (!draggedPlayer || !draggedFromTeam || toUsername === draggedFromTeam) {
      return;
    }

    try {
      // Remover del equipo origen
      const fromTeam = allTeams[draggedFromTeam] || [];
      const updatedFromTeam = fromTeam.filter(m => m.account_id !== draggedPlayer.account_id);
      await saveTeam(draggedFromTeam, updatedFromTeam);
      
      // Agregar al equipo destino
      const toTeam = allTeams[toUsername] || [];
      const updatedToTeam = [...toTeam, draggedPlayer];
      await saveTeam(toUsername, updatedToTeam);
      
      // Recargar todos los equipos
      await loadAllTeams();
      setDraggedPlayer(null);
      setDraggedFromTeam(null);
    } catch (error) {
      console.error('Error moviendo jugador:', error);
      alert('Error al mover el jugador. Intenta nuevamente.');
    }
  };

  // Eliminar jugador de un equipo
  const removePlayerFromTeam = async (player, username) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${getPlayerName(player)} del equipo?`)) {
      return;
    }
    
    try {
      const team = allTeams[username] || [];
      const updatedTeam = team.filter(m => m.account_id !== player.account_id);
      await saveTeam(username, updatedTeam);
      await loadAllTeams();
    } catch (error) {
      console.error('Error eliminando jugador:', error);
      alert('Error al eliminar el jugador. Intenta nuevamente.');
    }
  };

  // Cargar cantidad de tier 10 para todos los jugadores
  useEffect(() => {
    const loadTier10Counts = async () => {
      const allTeamMembers = Object.values(allTeams).flat();
      if (allTeamMembers.length === 0) return;
      
      setLoadingTier10(true);
      const counts = {};
      
      try {
        // Cargar información de todos los vehículos una vez
        const vehiclesInfo = await getAllVehiclesInfo();

        // Para cada jugador, obtener sus tanques y contar tier 10
        for (const member of allTeamMembers) {
          if (counts[member.account_id] !== undefined) continue; // Evitar duplicados
          
          try {
            const accountId = member.account_id;
            const tanksResponse = await getPlayerTankStats(accountId);
            
            // Intentar acceder a los datos con el account_id como string o número
            const playerTanksData = tanksResponse?.data?.[accountId] || 
                                    tanksResponse?.data?.[String(accountId)] ||
                                    tanksResponse?.data?.[Number(accountId)];
            
            if (tanksResponse?.status === 'ok' && playerTanksData && Array.isArray(playerTanksData)) {
              // Contar tier 10 usando la información de vehículos
              let tier10Count = 0;
              playerTanksData.forEach(tank => {
                const vehicleInfo = vehiclesInfo?.[tank.tank_id];
                if (vehicleInfo && vehicleInfo.tier === 10) {
                  tier10Count++;
                }
              });
              counts[accountId] = tier10Count;
            } else {
              counts[accountId] = 0;
            }
          } catch (error) {
            console.error(`Error obteniendo tanques para ${member.account_id}:`, error);
            counts[member.account_id] = 0;
          }
        }
      } catch (error) {
        console.error('Error cargando información de vehículos:', error);
      }
      
      setTier10Counts(counts);
      setLoadingTier10(false);
    };

    if (Object.keys(allTeams).length > 0) {
      loadTier10Counts();
    }
  }, [allTeams]);

  const getPlayerName = (member) => {
    const stats = playersStats[member.account_id];
    return stats?.nickname || member?.account_name || 'Desconocido';
  };

  const getPlayerStats = (member) => {
    return playersStats[member.account_id]?.statistics?.all || null;
  };

  const renderTeamTable = (username, team, displayName) => {
    const isDragOver = dragOverTeam === username;
    const isEmpty = !team || team.length === 0;

    return (
      <div 
        className={`team-table-container ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => handleDragOver(e, username)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, username)}
      >
        {isEmpty ? (
          <div className={`empty-team drop-zone ${isDragOver ? 'drag-over' : ''}`}>
            <span className="empty-icon">📋</span>
            <p>No hay jugadores en el equipo de {displayName}</p>
            {isDragOver && (
              <div className="drop-indicator">
                <span>⬇️ Soltar aquí</span>
              </div>
            )}
          </div>
        ) : (
          <table className="team-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                <th>Rango</th>
                <th>Batallas</th>
                <th>% Victorias</th>
                <th>Daño Prom.</th>
                <th>WN8</th>
                <th>Tier 10</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member, index) => {
                const playerStats = getPlayerStats(member);
                const winRate = playerStats && playerStats.battles > 0 
                  ? ((playerStats.wins / playerStats.battles) * 100).toFixed(2) 
                  : '0.00';
                const avgDamage = playerStats && playerStats.battles > 0 
                  ? Math.round(playerStats.damage_dealt / playerStats.battles) 
                  : 0;
                const wn8 = playerStats && playerStats.battles > 0 
                  ? calculateWN8(playerStats)
                  : 0;
                const tier10Count = tier10Counts[member.account_id] ?? (loadingTier10 ? '...' : 0);

                const roleLabels = {
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

                const isDragging = draggedPlayer?.account_id === member.account_id;

                return (
                  <tr 
                    key={member.account_id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, member, username)}
                    onDragEnd={handleDragEnd}
                    className={isDragging ? 'dragging' : ''}
                  >
                    <td>{index + 1}</td>
                    <td className="player-name-cell">
                      <strong>{getPlayerName(member)}</strong>
                    </td>
                    <td>{roleLabels[member.role] || member.role || 'Miembro'}</td>
                    <td>{playerStats?.battles?.toLocaleString('es-ES') || '0'}</td>
                    <td style={{ color: parseFloat(winRate) >= 50 ? '#2ecc71' : '#e74c3c' }}>
                      {winRate}%
                    </td>
                    <td>{avgDamage.toLocaleString('es-ES')}</td>
                    <td>{wn8}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {tier10Count}
                    </td>
                    <td className="admin-actions-cell">
                      <button
                        className="action-btn remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlayerFromTeam(member, username);
                        }}
                        title="Eliminar del equipo"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
              {isDragOver && !isEmpty && (
                <tr className="drop-indicator-row">
                  <td colSpan="9" className="drop-indicator-cell">
                    <div className="drop-indicator">
                      <span>⬇️ Soltar aquí para mover a este equipo</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-teams">
        <p>Cargando equipos...</p>
      </div>
    );
  }

  const teamUsernames = Object.keys(allTeams);
  const teamDisplayNames = {
    fireariel: 'FireAriel',
    mayor_defa: 'Mayor_defa',
    kiritonyu: 'Kiritonyu',
    judejum12: 'judejum12',
    '0_whait_0': '0_Whait_0',
    antoniob: 'ANTONIOB',
    '_lastdrago_': '_LastDrago_',
    crossneri: 'CrossNeri',
    katlyne: 'Katlyne',
    cordero: 'CORDERO',
    sunstrider_revenge: 'Sunstrider_Revenge'
  };

  return (
    <div className="admin-teams-view">
      <div className="admin-teams-header">
        <h2 className="section-title">
          <span className="fire-icon">👑</span>
          Vista de Administrador - Todos los Equipos
        </h2>
        <button onClick={loadAllTeams} className="refresh-btn">
          🔄 Actualizar
        </button>
      </div>

      {teamUsernames.length === 0 ? (
        <div className="no-teams">
          <span className="no-teams-icon">📭</span>
          <p>No hay equipos guardados aún</p>
        </div>
      ) : (
        <div className="all-teams-container">
          {teamUsernames.map(username => {
            const team = allTeams[username];
            const displayName = teamDisplayNames[username] || username;
            
            return (
              <section key={username} className="admin-team-section">
                <div className="team-header">
                  <h3 className="team-section-title">
                    <span className="fire-icon">⚔️</span>
                    Equipo de {displayName} ({team?.length || 0} jugadores)
                  </h3>
                </div>
                {renderTeamTable(username, team, displayName)}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTeamsView;
