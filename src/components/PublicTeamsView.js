import React, { useState, useEffect } from 'react';
import { getAllTeams } from '../services/teamApi';

const PublicTeamsView = ({ playersStats }) => {
  const [allTeams, setAllTeams] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        console.log('PublicTeamsView: Cargando equipos...');
        const teams = await getAllTeams();
        console.log('PublicTeamsView: Equipos obtenidos:', teams);
        console.log('PublicTeamsView: Cantidad de equipos:', Object.keys(teams).length);
        setAllTeams(teams);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando equipos:', error);
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const teamDisplayNames = {
    'fireariel': 'FireAriel',
    'kiritonyu': 'KIRITONYU',
    'mayor_defa': 'Mayor_defa',
    'judejum12': 'judejum12',
    '0_whait_0': '0_Whait_0',
    'antoniob': 'ANTONIOB',
    '_lastdrago_': '_LastDrago_',
    'crossneri': 'CrossNeri',
    'katlyne': 'Katlyne',
    'cordero': 'CORDERO',
    'sunstrider_revenge': 'Sunstrider_Revenge',
    'tia_turbina_': 'Tia_turbina_'
  };

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

  if (loading) {
    return (
      <div className="loading-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Cargando equipos...</p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem' }}>
          Por favor espera...
        </p>
      </div>
    );
  }

  // Mostrar todos los equipos, incluso los vacíos
  const teamsArray = Object.entries(allTeams).filter(([username, team]) => {
    // Solo filtrar si no es un array válido (null, undefined, etc.)
    // Pero mostrar arrays vacíos también
    return Array.isArray(team);
  });

  console.log('PublicTeamsView RENDER - teamsArray length:', teamsArray.length);
  console.log('PublicTeamsView RENDER - teamsArray:', teamsArray);
  console.log('PublicTeamsView RENDER - allTeams keys:', Object.keys(allTeams));

  if (teamsArray.length === 0) {
    return (
      <div className="no-teams-message">
        <p>No hay equipos de batalla configurados aún.</p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem' }}>
          Los oficiales deben agregar jugadores a sus equipos primero.
        </p>
      </div>
    );
  }

  console.log('PublicTeamsView: Renderizando componente con', teamsArray.length, 'equipos');

  return (
    <div className="public-teams-view" style={{ width: '100%', padding: '2rem' }}>
      <div className="public-teams-header">
        <h2>⚔️ Equipos de Clan Wars</h2>
        <p className="public-teams-subtitle">
          Equipos seleccionados por los oficiales para las batallas de Clan Wars
        </p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
          Total de equipos encontrados: {teamsArray.length}
        </p>
      </div>

      <div className="public-teams-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {teamsArray.map(([teamUsername, team]) => {
          // Normalizar el nombre del equipo para buscar el display name
          const normalizedUsername = teamUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
          const displayName = teamDisplayNames[normalizedUsername] || teamDisplayNames[teamUsername.toLowerCase()] || teamUsername;
          
          return (
            <div
              key={teamUsername}
              className="public-team-card"
            >
              <div className="public-team-header">
                <h3 className="public-team-owner">
                  <span className="team-icon">⚔️</span>
                  {displayName}
                </h3>
                <span className="public-team-count">
                  {team.length} {team.length === 1 ? 'jugador' : 'jugadores'}
                </span>
              </div>

              {team.length > 0 ? (
                <div className="public-team-table-container">
                  <table className="public-team-table">
                    <thead>
                      <tr>
                        <th>Jugador</th>
                        <th>Rango</th>
                        <th>Batallas</th>
                        <th>% Victorias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.map((member) => {
                        const stats = playersStats?.[member.account_id];
                        const battles = stats?.statistics?.all?.battles || 0;
                        const wins = stats?.statistics?.all?.wins || 0;
                        const winRate = battles > 0 ? ((wins / battles) * 100).toFixed(1) : '0.0';

                        return (
                          <tr key={member.account_id}>
                            <td className="player-name-cell">
                              {member.account_name || 'N/A'}
                            </td>
                            <td>
                              {roleLabels[member.role] || member.role || 'Miembro'}
                            </td>
                            <td>{battles.toLocaleString()}</td>
                            <td className={winRate >= 50 ? 'win-rate-good' : 'win-rate-normal'}>
                              {winRate}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-team-message">
                  <p>Este equipo aún no tiene jugadores seleccionados.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicTeamsView;
