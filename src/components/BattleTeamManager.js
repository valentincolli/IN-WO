import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MemberCard from './MemberCard';
import { calculateWN8, getPlayerTankStats, getAllVehiclesInfo } from '../services/wargamingApi';
import { getTeam, saveTeam, getAllTeams } from '../services/teamApi';

const BattleTeamManager = ({ members, playersStats, onMemberClick, username }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [sortBy, setSortBy] = useState('role');
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tier10Counts, setTier10Counts] = useState({});
  const [loadingTier10, setLoadingTier10] = useState(false);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [allTeams, setAllTeams] = useState({});

  const getTeamOwnerName = useCallback(() => {
    return username || 'Ariel';
  }, [username]);

  // Cargar todos los equipos para verificar duplicados
  useEffect(() => {
    const loadAllTeams = async () => {
      try {
        const teams = await getAllTeams();
        setAllTeams(teams);
        console.log('Todos los equipos cargados:', Object.keys(teams));
      } catch (error) {
        console.error('Error cargando todos los equipos:', error);
      }
    };
    loadAllTeams();
  }, []);

  // Cargar equipo guardado al iniciar o cuando cambie el usuario
  useEffect(() => {
    const loadTeam = async () => {
      if (username) {
        setIsLoadingTeam(true);
        setIsInitialLoad(true);
        console.log(`[${username}] Cargando equipo...`);
        const savedTeam = await getTeam(username);
        console.log(`[${username}] Equipo cargado:`, savedTeam?.length || 0, 'miembros');
        if (savedTeam && savedTeam.length > 0) {
          console.log(`[${username}] Primeros miembros:`, savedTeam.slice(0, 3).map(m => m.account_name || m.account_id));
        }
        setTeamMembers(savedTeam || []);
        setIsLoadingTeam(false);
        // Esperar un momento antes de permitir guardar para evitar conflictos
        setTimeout(() => {
          setIsInitialLoad(false);
          console.log(`[${username}] Carga inicial completada, guardado habilitado`);
        }, 1500);
      }
    };
    loadTeam();
  }, [username]);

  // Recargar todos los equipos cuando se guarde un equipo (para mantener sincronizado)
  useEffect(() => {
    if (!isInitialLoad && !isLoadingTeam && username) {
      const reloadAllTeams = async () => {
        try {
          const teams = await getAllTeams();
          setAllTeams(teams);
        } catch (error) {
          console.error('Error recargando todos los equipos:', error);
        }
      };
      // Recargar después de un pequeño delay para asegurar que el servidor haya guardado
      const timeoutId = setTimeout(reloadAllTeams, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [teamMembers, isInitialLoad, isLoadingTeam, username]);

  // Guardar equipo cuando cambie (pero no durante la carga inicial)
  useEffect(() => {
    // No guardar durante la carga inicial o si está cargando
    if (isInitialLoad || isLoadingTeam || !username) {
      if (teamMembers.length > 0) {
        console.log(`[${username}] No guardando (carga inicial): isInitialLoad=${isInitialLoad}, isLoadingTeam=${isLoadingTeam}`);
      }
      return;
    }
    
    // Solo guardar si hay cambios reales (no durante la carga inicial)
    const saveTeamData = async () => {
      console.log(`[${username}] Guardando equipo:`, teamMembers.length, 'miembros');
      const result = await saveTeam(username, teamMembers);
      if (result) {
        console.log(`[${username}] Equipo guardado exitosamente`);
      } else {
        console.error(`[${username}] Error al guardar equipo`);
      }
    };
    
    saveTeamData();
  }, [teamMembers, username, isInitialLoad, isLoadingTeam]);

  // Convertir members a array si es necesario (definir antes de usarlo en useEffects)
  const membersArray = React.useMemo(() => 
    Array.isArray(members) ? members : (members ? Object.values(members) : []), 
    [members]
  );

  // Cargar cantidad de tier 10 para cada jugador del equipo
  useEffect(() => {
    const loadTier10Counts = async () => {
      if (teamMembers.length === 0) return;
      
      setLoadingTier10(true);
      const counts = {};
      
      try {
        // Cargar información de todos los vehículos una vez
        const vehiclesInfo = await getAllVehiclesInfo();
        
        // Para cada jugador, obtener sus tanques y contar tier 10
        for (const member of teamMembers) {
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

    loadTier10Counts();
  }, [teamMembers]);

  // Cargar cantidad de tier 10 para todos los miembros (para las tarjetas)
  // Esto se ejecuta después de que se carguen los tier 10 del equipo
  useEffect(() => {
    const loadAllMembersTier10 = async () => {
      if (membersArray.length === 0 || loadingTier10) return;
      
      const counts = { ...tier10Counts };
      const membersToLoad = membersArray
        .slice(0, 50)
        .filter(m => counts[m.account_id] === undefined);
      
      if (membersToLoad.length === 0) return;
      
      try {
        // Cargar información de todos los vehículos una vez
        const vehiclesInfo = await getAllVehiclesInfo();

        // Para cada miembro, obtener sus tanques y contar tier 10
        for (const member of membersToLoad) {
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
        
        setTier10Counts(counts);
      } catch (error) {
        console.error('Error cargando información de vehículos:', error);
      }
    };

    // Esperar un poco para no sobrecargar la API
    const timeoutId = setTimeout(() => {
      loadAllMembersTier10();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [membersArray, loadingTier10, tier10Counts]);

  const roleOrder = useMemo(() => ({
    commander: 1,
    executive_officer: 2,
    personnel_officer: 3,
    combat_officer: 4,
    intelligence_officer: 5,
    quartermaster: 6,
    recruitment_officer: 7,
    junior_officer: 8,
    private: 9,
    recruit: 10,
    reservist: 11
  }), []);

  // Memoizar función para verificar si está en el equipo
  const isInTeam = useCallback((accountId) => {
    return teamMembers.some(m => m.account_id === accountId);
  }, [teamMembers]);

  // Verificar si un miembro es oficial que NO puede ser agregado
  // Ahora se pueden agregar: commander, combat_officer, personnel_officer e intelligence_officer
  const isRestrictedOfficer = useCallback((role) => {
    const restrictedOfficerRoles = [
      'executive_officer',
      'quartermaster',
      'recruitment_officer',
      'junior_officer'
    ];
    return restrictedOfficerRoles.includes(role);
  }, []);

  // Verificar si un jugador ya está en otro equipo - Memoizado
  const isPlayerInOtherTeam = useCallback((accountId) => {
    const currentUsernameLower = username?.toLowerCase();
    // Mapeo de nombres normalizados a nombres de visualización
    const getDisplayName = (teamUsername) => {
      const normalized = teamUsername.toLowerCase();
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
      
      if (teamDisplayNames[normalized]) {
        return teamDisplayNames[normalized];
      }
      // Si no está en el mapeo, capitalizar primera letra
      return teamUsername.charAt(0).toUpperCase() + teamUsername.slice(1).toLowerCase();
    };

    for (const [teamUsername, team] of Object.entries(allTeams)) {
      // Ignorar el equipo del usuario actual
      if (teamUsername.toLowerCase() === currentUsernameLower) {
        continue;
      }
      
      // Verificar si el jugador está en este equipo
      if (Array.isArray(team) && team.some(m => m.account_id === accountId)) {
        const displayName = getDisplayName(teamUsername);
        return { inOtherTeam: true, owner: displayName };
      }
    }
    return { inOtherTeam: false, owner: null };
  }, [allTeams, username]);

  const addToTeam = useCallback(async (member) => {
    // Verificar si el miembro es un oficial restringido (no puede ser agregado)
    if (isRestrictedOfficer(member.role)) {
      alert('⚠️ No puedes agregar este tipo de oficial a tu equipo. Puedes agregar miembros regulares, Comandantes, Oficiales de Combate, Oficiales de Personal e Inteligencia.');
      return;
    }

    // Verificar si el jugador ya está en otro equipo
    const playerCheck = isPlayerInOtherTeam(member.account_id);
    if (playerCheck.inOtherTeam) {
      const playerName = playersStats[member.account_id]?.nickname || member?.account_name || 'este jugador';
      alert(`⚠️ ${playerName} ya está en el equipo de ${playerCheck.owner}. No puedes agregar el mismo jugador a múltiples equipos.`);
      return;
    }

    if (!isInTeam(member.account_id)) {
      const newTeam = [...teamMembers, member];
      setTeamMembers(newTeam);
      // Guardar inmediatamente en el servidor (sin esperar el useEffect)
      if (username) {
        try {
          await saveTeam(username, newTeam);
          console.log('Equipo guardado después de agregar miembro');
          // Recargar todos los equipos para mantener sincronizado
          const teams = await getAllTeams();
          setAllTeams(teams);
        } catch (error) {
          console.error('Error guardando equipo:', error);
        }
      }
    }
  }, [isRestrictedOfficer, isPlayerInOtherTeam, isInTeam, teamMembers, username, playersStats]);

  const removeFromTeam = useCallback(async (accountId) => {
    const newTeam = teamMembers.filter(m => m.account_id !== accountId);
    setTeamMembers(newTeam);
    // Guardar inmediatamente en el servidor (sin esperar el useEffect)
    if (username) {
      try {
        await saveTeam(username, newTeam);
        console.log('Equipo guardado después de quitar miembro');
        // Recargar todos los equipos para mantener sincronizado
        const teams = await getAllTeams();
        setAllTeams(teams);
      } catch (error) {
        console.error('Error guardando equipo:', error);
      }
    }
  }, [teamMembers, username]);

  const clearTeam = useCallback(async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todo el equipo?')) {
      setTeamMembers([]);
      // Guardar inmediatamente (equipo vacío) en el servidor
      if (username) {
        await saveTeam(username, []);
      }
    }
  }, [username]);

  const exportToTxt = useCallback(() => {
    if (teamMembers.length === 0) {
      alert('No hay jugadores en el equipo para exportar');
      return;
    }

    const ownerName = getTeamOwnerName();
    const ownerNameLower = ownerName.toLowerCase();
    let txtContent = `=== EQUIPO DE BATALLA DE ${ownerName.toUpperCase()} ===\n\n`;
    txtContent += `Fecha: ${new Date().toLocaleString('es-ES')}\n`;
    txtContent += `Total de jugadores: ${teamMembers.length}\n\n`;
    txtContent += 'JUGADORES:\n';
    txtContent += '-'.repeat(50) + '\n';

    teamMembers.forEach((member, index) => {
      const stats = playersStats[member.account_id];
      const playerName = stats?.nickname || member?.account_name || 'Desconocido';
      const playerStats = stats?.statistics?.all;
      const winRate = playerStats && playerStats.battles > 0 
        ? ((playerStats.wins / playerStats.battles) * 100).toFixed(2) 
        : '0.00';
      const avgDamage = playerStats && playerStats.battles > 0 
        ? Math.round(playerStats.damage_dealt / playerStats.battles) 
        : 0;

      txtContent += `${index + 1}. ${playerName}\n`;
      txtContent += `   Batallas: ${playerStats?.battles || 0}\n`;
      txtContent += `   % Victorias: ${winRate}%\n`;
      txtContent += `   Daño Promedio: ${avgDamage}\n`;
      txtContent += '\n';
    });

    // Crear y descargar archivo
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipo_${ownerNameLower}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [teamMembers, playersStats, getTeamOwnerName]);

  const sortMembers = useCallback((membersList) => {
    return [...membersList].sort((a, b) => {
      const statsA = playersStats[a.account_id];
      const statsB = playersStats[b.account_id];

      switch (sortBy) {
        case 'role':
          return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
        case 'battles':
          const battlesA = statsA?.statistics?.all?.battles || 0;
          const battlesB = statsB?.statistics?.all?.battles || 0;
          return battlesB - battlesA;
        case 'winrate':
          const statsAllA = statsA?.statistics?.all;
          const statsAllB = statsB?.statistics?.all;
          const wrA = statsAllA && statsAllA.battles > 0 ? (statsAllA.wins / statsAllA.battles) : 0;
          const wrB = statsAllB && statsAllB.battles > 0 ? (statsAllB.wins / statsAllB.battles) : 0;
          return wrB - wrA;
        case 'name':
          const nameA = statsA?.nickname || a.account_name || '';
          const nameB = statsB?.nickname || b.account_name || '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });
  }, [sortBy, playersStats, roleOrder]);

  const filterMembers = useCallback((membersList) => {
    let filtered = membersList;

    if (filterRole !== 'all') {
      filtered = filtered.filter(m => m.role === filterRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(m => {
        const stats = playersStats[m.account_id];
        const name = stats?.nickname || m.account_name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered;
  }, [filterRole, searchTerm, playersStats]);

  // Memoizar los miembros filtrados y ordenados
  const filteredAndSortedMembers = useMemo(() => {
    return sortMembers(filterMembers(membersArray));
  }, [membersArray, sortMembers, filterMembers]);

  // Memoizar la separación de miembros en seleccionados, disponibles y en otros equipos
  const { selectedMembers, membersInOtherTeams, availableMembers } = useMemo(() => {
    const selected = filteredAndSortedMembers.filter(m => isInTeam(m.account_id));
    
    const inOtherTeams = filteredAndSortedMembers.filter(m => {
      if (isInTeam(m.account_id)) return false; // Ya está en mi equipo
      const playerCheck = isPlayerInOtherTeam(m.account_id);
      return playerCheck.inOtherTeam;
    });
    
    const available = filteredAndSortedMembers.filter(m => {
      if (isInTeam(m.account_id)) return false; // Ya está en mi equipo
      const playerCheck = isPlayerInOtherTeam(m.account_id);
      return !playerCheck.inOtherTeam; // No está en otro equipo
    });
    
    return { selectedMembers: selected, membersInOtherTeams: inOtherTeams, availableMembers: available };
  }, [filteredAndSortedMembers, isInTeam, isPlayerInOtherTeam]);

  const uniqueRoles = [...new Set(membersArray.map(m => m.role))].sort(
    (a, b) => (roleOrder[a] || 99) - (roleOrder[b] || 99)
  );

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

  const getPlayerName = (member) => {
    const stats = playersStats[member.account_id];
    return stats?.nickname || member?.account_name || 'Desconocido';
  };

  const getPlayerStats = (member) => {
    return playersStats[member.account_id]?.statistics?.all || null;
  };

  return (
    <div className="battle-team-manager">
      {/* Tabla del Equipo */}
      <section className="team-section">
        <div className="team-header">
          <h2 className="section-title">
            <span className="fire-icon">⚔️</span>
            Equipo de Batalla de {getTeamOwnerName()} ({teamMembers.length})
          </h2>
          <div className="team-actions">
            <button onClick={exportToTxt} className="export-btn" disabled={teamMembers.length === 0}>
              📥 Exportar a TXT
            </button>
            <button onClick={clearTeam} className="clear-btn" disabled={teamMembers.length === 0}>
              🗑️ Limpiar Equipo
            </button>
          </div>
        </div>

        {teamMembers.length > 0 ? (
          <div className="team-table-container">
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
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, index) => {
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

                  return (
                    <tr key={member.account_id}>
                      <td>{index + 1}</td>
                      <td className="player-name-cell">
                        <strong>{getPlayerName(member)}</strong>
                      </td>
                      <td>{roleLabels[member.role] || member.role}</td>
                      <td>{playerStats?.battles?.toLocaleString('es-ES') || '0'}</td>
                      <td style={{ color: parseFloat(winRate) >= 50 ? '#2ecc71' : '#e74c3c' }}>
                        {winRate}%
                      </td>
                      <td>{avgDamage.toLocaleString('es-ES')}</td>
                      <td>{wn8}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {tier10Count}
                      </td>
                      <td>
                        <button 
                          onClick={() => removeFromTeam(member.account_id)}
                          className="remove-btn"
                          title="Quitar del equipo"
                        >
                          ➖
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-team">
            <span className="empty-icon">📋</span>
            <p>No hay jugadores en el equipo. Agrega jugadores desde la lista de miembros.</p>
          </div>
        )}
      </section>

      {/* Lista de Miembros con botones de agregar */}
      <section className="members-section">
        <h2 className="section-title">
          <span className="fire-icon">🐺</span>
          Miembros del Clan ({membersArray.length})
        </h2>

        <div className="members-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="role">Ordenar por Rango</option>
              <option value="battles">Ordenar por Batallas</option>
              <option value="winrate">Ordenar por % Victorias</option>
              <option value="name">Ordenar por Nombre</option>
            </select>

            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="role-select"
            >
              <option value="all">Todos los Rangos</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {roleLabels[role] || role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sección de Jugadores Seleccionados */}
        {selectedMembers.length > 0 && (
          <div className="selected-members-section">
            <h3 className="subsection-title selected-title">
              <span className="section-icon">✅</span>
              Jugadores Seleccionados por mi ({selectedMembers.length})
            </h3>
            <div className="members-grid">
              {selectedMembers.map(member => {
                return (
                  <div key={member.account_id} className="member-card-wrapper selected-card">
                    <MemberCard
                      member={member}
                      stats={playersStats[member.account_id]}
                      tier10Count={tier10Counts[member.account_id] ?? (loadingTier10 ? '...' : null)}
                      onClick={() => onMemberClick(member, playersStats[member.account_id])}
                    />
                    <div className="member-card-actions">
                      <button 
                        className="add-btn in-team"
                        onClick={() => removeFromTeam(member.account_id)}
                        title="Quitar del equipo"
                      >
                        ➖ Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sección de Jugadores en Otros Equipos */}
        {membersInOtherTeams.length > 0 && (
          <div className="other-teams-members-section">
            <h3 className="subsection-title other-teams-title">
              <span className="section-icon">🔒</span>
              Jugadores en Otros Equipos ({membersInOtherTeams.length})
            </h3>
            <div className="members-grid">
              {membersInOtherTeams.map(member => {
                const playerCheck = isPlayerInOtherTeam(member.account_id);
                
                return (
                  <div key={member.account_id} className="member-card-wrapper other-team-card">
                    <MemberCard
                      member={member}
                      stats={playersStats[member.account_id]}
                      tier10Count={tier10Counts[member.account_id] ?? (loadingTier10 ? '...' : null)}
                      onClick={() => onMemberClick(member, playersStats[member.account_id])}
                    />
                    <div className="member-card-actions">
                      <button 
                        className="add-btn disabled"
                        disabled
                        title={`Este jugador ya está en el equipo de ${playerCheck.owner}`}
                      >
                        🔒 En equipo de {playerCheck.owner}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sección de Jugadores Disponibles */}
        <div className="available-members-section">
          <h3 className="subsection-title available-title">
            <span className="section-icon">📋</span>
            Jugadores Disponibles ({availableMembers.length})
          </h3>
          <div className="members-grid">
            {availableMembers.map(member => {
              const isRestricted = isRestrictedOfficer(member.role);
              
              return (
                <div key={member.account_id} className="member-card-wrapper">
                  <MemberCard
                    member={member}
                    stats={playersStats[member.account_id]}
                    tier10Count={tier10Counts[member.account_id] ?? (loadingTier10 ? '...' : null)}
                    onClick={() => onMemberClick(member, playersStats[member.account_id])}
                  />
                  <div className="member-card-actions">
                    {isRestricted ? (
                      <button 
                        className="add-btn disabled"
                        disabled
                        title="Este tipo de oficial no puede ser agregado al equipo"
                      >
                        ⛔ Oficial
                      </button>
                    ) : (
                      <button 
                        className="add-btn"
                        onClick={() => addToTeam(member)}
                        title="Agregar al equipo"
                      >
                        ➕ Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedMembers.length === 0 && availableMembers.length === 0 && membersInOtherTeams.length === 0 && (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <p>No se encontraron jugadores</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BattleTeamManager;
