import React from 'react';

const Header = ({ clanInfo }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="clan-emblem">
          {clanInfo?.emblems?.x256?.wowp ? (
            <img 
              src={clanInfo.emblems.x256.wowp} 
              alt="Clan Emblem" 
              className="emblem-img"
            />
          ) : (
            <div className="emblem-placeholder">
              <span className="wolf-icon">🐺</span>
            </div>
          )}
        </div>
        <div className="clan-title">
          <h1>
            <span className="clan-tag">[{clanInfo?.tag || 'IN-WO'}]</span>
            <span className="clan-name">{clanInfo?.name || 'Infernal Wolves'}</span>
          </h1>
          <p className="clan-motto">{clanInfo?.motto || 'Unidos en la batalla'}</p>
        </div>
        <div className="clan-quick-stats">
          <div className="stat-item">
            <span className="stat-value">{clanInfo?.members_count || 0}</span>
            <span className="stat-label">Miembros</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{clanInfo?.members_count > 0 ? '⚔️' : '—'}</span>
            <span className="stat-label">Activo</span>
          </div>
        </div>
      </div>
      <div className="header-flames"></div>
    </header>
  );
};

export default Header;

