import React from 'react';
import { calculateWN8, getWN8Color, getWN8Label } from '../services/wargamingApi';

const PlayerModal = ({ player, stats, onClose }) => {
  if (!player) return null;

  const playerStats = stats?.statistics?.all;
  const wn8 = playerStats && playerStats.battles > 0 ? calculateWN8(playerStats) : 0;
  const wn8Color = getWN8Color(wn8);
  const wn8Label = getWN8Label(wn8);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('es-ES');
  };

  const getWinRate = () => {
    if (!playerStats?.battles || playerStats.battles === 0) return '0.00';
    return ((playerStats.wins / playerStats.battles) * 100).toFixed(2);
  };

  const getAvgDamage = () => {
    if (!playerStats?.battles || playerStats.battles === 0) return '0';
    return Math.round(playerStats.damage_dealt / playerStats.battles).toLocaleString('es-ES');
  };

  const getAvgExp = () => {
    if (!playerStats?.battles || playerStats.battles === 0) return '0';
    return Math.round(playerStats.xp / playerStats.battles).toLocaleString('es-ES');
  };

  const getAvgFrags = () => {
    if (!playerStats?.battles || playerStats.battles === 0) return '0.00';
    return (playerStats.frags / playerStats.battles).toFixed(2);
  };

  const getSurvivalRate = () => {
    if (!playerStats?.battles || playerStats.battles === 0) return '0.00';
    return ((playerStats.survived_battles / playerStats.battles) * 100).toFixed(2);
  };

  const getHitRatio = () => {
    if (!playerStats?.shots || playerStats.shots === 0) return '0.00';
    return ((playerStats.hits / playerStats.shots) * 100).toFixed(2);
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

  const playerName = stats?.nickname || player?.account_name || 'Desconocido';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
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

        <div className="modal-body">
          {playerStats && playerStats.battles > 0 ? (
            <>
              <div className="stats-section">
                <h3>📊 Estadísticas Generales</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.battles)}</span>
                    <span className="stat-label">Batallas</span>
                  </div>
                  <div className="stat-box highlight">
                    <span className="stat-value" style={{ color: parseFloat(getWinRate()) >= 50 ? '#2ecc71' : '#e74c3c' }}>
                      {getWinRate()}%
                    </span>
                    <span className="stat-label">% Victorias</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.wins)}</span>
                    <span className="stat-label">Victorias</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.losses)}</span>
                    <span className="stat-label">Derrotas</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.draws)}</span>
                    <span className="stat-label">Empates</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{getSurvivalRate()}%</span>
                    <span className="stat-label">Supervivencia</span>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h3>💥 Combate</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.damage_dealt)}</span>
                    <span className="stat-label">Daño Total</span>
                  </div>
                  <div className="stat-box highlight">
                    <span className="stat-value">{getAvgDamage()}</span>
                    <span className="stat-label">Daño Promedio</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.frags)}</span>
                    <span className="stat-label">Tanques Destruidos</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{getAvgFrags()}</span>
                    <span className="stat-label">Destruidos/Batalla</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.spotted)}</span>
                    <span className="stat-label">Detectados</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{getHitRatio()}%</span>
                    <span className="stat-label">Precisión</span>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h3>⭐ Experiencia y Récords</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.xp)}</span>
                    <span className="stat-label">EXP Total</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{getAvgExp()}</span>
                    <span className="stat-label">EXP Promedio</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.max_xp)}</span>
                    <span className="stat-label">EXP Máxima</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.max_frags)}</span>
                    <span className="stat-label">Max Destruidos</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.max_damage)}</span>
                    <span className="stat-label">Daño Máximo</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{formatNumber(playerStats.dropped_capture_points)}</span>
                    <span className="stat-label">Puntos Defensa</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-stats">
              <span className="no-stats-icon">📊</span>
              <p>Este jugador aún no tiene estadísticas de batalla</p>
            </div>
          )}

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
