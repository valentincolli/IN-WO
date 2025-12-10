import React from 'react';
import { calculateWN8, getWN8Color, getWN8Label } from '../services/wargamingApi';

const MemberCard = ({ member, stats, onClick }) => {
  // Acceder a las estadísticas correctamente
  const playerStats = stats?.statistics?.all;
  const wn8 = playerStats && playerStats.battles > 0 ? calculateWN8(playerStats) : 0;
  const wn8Color = getWN8Color(wn8);
  const wn8Label = getWN8Label(wn8);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('es-ES');
  };

  const getWinRate = () => {
    if (!playerStats || !playerStats.battles || playerStats.battles === 0) return '0.00';
    return ((playerStats.wins / playerStats.battles) * 100).toFixed(2);
  };

  const getAvgDamage = () => {
    if (!playerStats || !playerStats.battles || playerStats.battles === 0) return '0';
    return Math.round(playerStats.damage_dealt / playerStats.battles).toLocaleString('es-ES');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'commander': return '👑';
      case 'executive_officer': return '⭐';
      case 'personnel_officer': return '🎖️';
      case 'combat_officer': return '⚔️';
      case 'intelligence_officer': return '🔍';
      case 'quartermaster': return '📦';
      case 'recruitment_officer': return '📋';
      case 'junior_officer': return '🏅';
      case 'private': return '🎮';
      case 'recruit': return '🆕';
      default: return '🎮';
    }
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

  const getLastOnline = () => {
    if (!stats?.last_battle_time || stats.last_battle_time === 0) return 'Sin batallas';
    const lastBattle = new Date(stats.last_battle_time * 1000);
    const now = new Date();
    const diffDays = Math.floor((now - lastBattle) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  // Usar el nickname de stats si está disponible, si no usar account_name del member
  const playerName = stats?.nickname || member?.account_name || 'Desconocido';

  return (
    <div className="member-card" onClick={onClick}>
      <div className="member-header">
        <span className="member-role-icon">{getRoleIcon(member?.role)}</span>
        <div className="member-name-container">
          <h3 className="member-name">{playerName}</h3>
          <span className="member-role">{getRoleName(member?.role)}</span>
        </div>
        <div className="wn8-badge" style={{ backgroundColor: wn8Color }}>
          <span className="wn8-value">{wn8}</span>
          <span className="wn8-label">{wn8Label}</span>
        </div>
      </div>
      
      <div className="member-stats">
        <div className="stat-row">
          <div className="stat">
            <span className="stat-icon">⚔️</span>
            <div className="stat-info">
              <span className="stat-number">{formatNumber(playerStats?.battles)}</span>
              <span className="stat-text">Batallas</span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon">🏆</span>
            <div className="stat-info">
              <span className="stat-number" style={{ color: parseFloat(getWinRate()) >= 50 ? '#2ecc71' : '#e74c3c' }}>
                {getWinRate()}%
              </span>
              <span className="stat-text">Victorias</span>
            </div>
          </div>
        </div>
        
        <div className="stat-row">
          <div className="stat">
            <span className="stat-icon">💥</span>
            <div className="stat-info">
              <span className="stat-number">{getAvgDamage()}</span>
              <span className="stat-text">Daño Prom.</span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon">💀</span>
            <div className="stat-info">
              <span className="stat-number">{formatNumber(playerStats?.frags)}</span>
              <span className="stat-text">Destruidos</span>
            </div>
          </div>
        </div>

        <div className="stat-row single">
          <div className="stat full-width">
            <span className="stat-icon">🕐</span>
            <div className="stat-info">
              <span className="stat-number">{getLastOnline()}</span>
              <span className="stat-text">Última Batalla</span>
            </div>
          </div>
        </div>
      </div>

      <div className="member-footer">
        <span className="view-more">Ver perfil completo →</span>
      </div>
    </div>
  );
};

export default MemberCard;
