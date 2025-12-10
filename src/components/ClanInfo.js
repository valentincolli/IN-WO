import React from 'react';

const ClanInfo = ({ clanInfo }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="clan-info-section">
      <h2 className="section-title">
        <span className="fire-icon">🔥</span>
        Información del Clan
      </h2>
      
      <div className="clan-info-grid">
        <div className="info-card">
          <div className="info-icon">📅</div>
          <div className="info-content">
            <span className="info-label">Fecha de Creación</span>
            <span className="info-value">{formatDate(clanInfo?.created_at)}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">👑</div>
          <div className="info-content">
            <span className="info-label">Líder</span>
            <span className="info-value">{clanInfo?.leader_name || 'N/A'}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">👥</div>
          <div className="info-content">
            <span className="info-label">Total Miembros</span>
            <span className="info-value">{clanInfo?.members_count || 0}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🏷️</div>
          <div className="info-content">
            <span className="info-label">Tag del Clan</span>
            <span className="info-value clan-tag-value">[{clanInfo?.tag || 'IN-WO'}]</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🌎</div>
          <div className="info-content">
            <span className="info-label">Servidor</span>
            <span className="info-value">NA (Norteamérica)</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🆔</div>
          <div className="info-content">
            <span className="info-label">ID del Clan</span>
            <span className="info-value">{clanInfo?.clan_id || 'N/A'}</span>
          </div>
        </div>
      </div>

      {clanInfo?.description && (
        <div className="clan-description">
          <h3>Descripción</h3>
          <p>{clanInfo.description}</p>
        </div>
      )}
    </section>
  );
};

export default ClanInfo;

