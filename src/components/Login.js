import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ clanInfo, playersStats }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Ingresa usuario y contraseña');
      return;
    }

    const result = login(username, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  // Calcular estadísticas del clan para mostrar
  const getClanStats = () => {
    if (!playersStats || Object.keys(playersStats).length === 0) {
      return null;
    }

    const players = Object.values(playersStats).filter(p => p?.statistics?.all?.battles > 0);
    
    if (players.length === 0) return null;

    // Calcular promedios y totales
    let totalBattles = 0;
    let totalWins = 0;
    let totalDamage = 0;
    let bestWinRate = 0;
    let bestDamage = 0;
    let bestBattles = 0;

    players.forEach(p => {
      const stats = p.statistics.all;
      totalBattles += stats.battles || 0;
      totalWins += stats.wins || 0;
      totalDamage += stats.damage_dealt || 0;
      
      const winRate = stats.battles > 0 ? (stats.wins / stats.battles) * 100 : 0;
      const avgDamage = stats.battles > 0 ? stats.damage_dealt / stats.battles : 0;
      
      if (winRate > bestWinRate) bestWinRate = winRate;
      if (avgDamage > bestDamage) bestDamage = avgDamage;
      if (stats.battles > bestBattles) bestBattles = stats.battles;
    });

    const avgWinRate = totalBattles > 0 ? (totalWins / totalBattles) * 100 : 0;
    const avgDamage = totalBattles > 0 ? totalDamage / totalBattles : 0;

    // Contar jugadores activos (últimos 7 días)
    const now = Date.now() / 1000;
    const activePlayers = players.filter(p => {
      const lastBattle = p.last_battle_time;
      return lastBattle && (now - lastBattle) < 7 * 24 * 60 * 60;
    }).length;

    return {
      totalPlayers: players.length,
      totalBattles,
      avgWinRate,
      avgDamage,
      bestWinRate,
      bestDamage,
      bestBattles,
      activePlayers
    };
  };

  const stats = getClanStats();

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('es-ES');
  };

  return (
    <div className="public-view">
      {/* Header público */}
      <header className="header public-header">
        <div className="header-content">
          <div className="clan-emblem">
            {clanInfo?.emblems?.x64?.wowp ? (
              <img src={clanInfo.emblems.x64.wowp} alt="Emblema" className="emblem-img" />
            ) : (
              <span className="emblem-placeholder">🐺</span>
            )}
          </div>
          <div className="clan-title">
            <h1>
              <span className="clan-tag">[{clanInfo?.tag || 'IN-WO'}]</span>{' '}
              <span className="clan-name">{clanInfo?.name || 'Infernal Wolves'}</span>
            </h1>
            <p className="clan-motto">{clanInfo?.motto || 'Nunca cazamos solos, incluso en la tormenta'}</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2 className="hero-title">🐺 La Manada te espera</h2>
            <p className="hero-subtitle">
              Somos una comunidad de jugadores de World of Tanks NA con casi una década de experiencia.
            </p>
          </div>
          
          {/* Stats destacadas */}
          {stats && (
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-icon">👥</span>
                <span className="hero-stat-value">{stats.totalPlayers}</span>
                <span className="hero-stat-label">Lobos en la Manada</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-icon">⚔️</span>
                <span className="hero-stat-value">{formatNumber(stats.totalBattles)}</span>
                <span className="hero-stat-label">Batallas Totales</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-icon">🏆</span>
                <span className="hero-stat-value">{stats.avgWinRate.toFixed(1)}%</span>
                <span className="hero-stat-label">% Victorias Clan</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-icon">💥</span>
                <span className="hero-stat-value">{formatNumber(Math.round(stats.avgDamage))}</span>
                <span className="hero-stat-label">Daño Promedio</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contenido principal */}
      <main className="main-content public-main">
        <div className="public-grid">
          {/* Descripción del clan */}
          <div className="clan-description-card">
            <h2 className="card-title">
              <span className="card-icon">📜</span>
              Nuestra Historia
            </h2>
            <div className="clan-description-text">
              {clanInfo?.description ? (
                <p>{clanInfo.description}</p>
              ) : (
                <p>Bienvenido al clan Infernal Wolves. Somos una comunidad de jugadores de World of Tanks comprometidos con el juego competitivo y el compañerismo.</p>
              )}
            </div>
            <div className="clan-founded">
              <span className="founded-icon">📅</span>
              <span>Fundado en {clanInfo?.created_at 
                ? new Date(clanInfo.created_at * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
                : '2016'}</span>
            </div>
          </div>

          {/* Récords del clan */}
          {stats && (
            <div className="clan-records-card">
              <h2 className="card-title">
                <span className="card-icon">⭐</span>
                Récords del Clan
              </h2>
              <div className="records-list">
                <div className="record-item">
                  <span className="record-icon">🎯</span>
                  <div className="record-info">
                    <span className="record-value">{stats.bestWinRate.toFixed(1)}%</span>
                    <span className="record-label">Mejor % Victorias</span>
                  </div>
                </div>
                <div className="record-item">
                  <span className="record-icon">💣</span>
                  <div className="record-info">
                    <span className="record-value">{formatNumber(Math.round(stats.bestDamage))}</span>
                    <span className="record-label">Mejor Daño Promedio</span>
                  </div>
                </div>
                <div className="record-item">
                  <span className="record-icon">🎮</span>
                  <div className="record-info">
                    <span className="record-value">{formatNumber(stats.bestBattles)}</span>
                    <span className="record-label">Más Batallas</span>
                  </div>
                </div>
                <div className="record-item active-record">
                  <span className="record-icon">🟢</span>
                  <div className="record-info">
                    <span className="record-value">{stats.activePlayers}</span>
                    <span className="record-label">Activos esta semana</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Por qué unirse */}
          <div className="why-join-card">
            <h2 className="card-title">
              <span className="card-icon">🔥</span>
              ¿Por qué IN-WO?
            </h2>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🎯</span>
                <span>Jugadores experimentados dispuestos a ayudar</span>
              </li>
              <li>
                <span className="benefit-icon">🏰</span>
                <span>Participación activa en Fortalezas y Avances</span>
              </li>
              <li>
                <span className="benefit-icon">💬</span>
                <span>Comunidad activa y ambiente amigable</span>
              </li>
              <li>
                <span className="benefit-icon">📈</span>
                <span>Oportunidades de crecimiento y mejora</span>
              </li>
            </ul>
          </div>

          {/* Login */}
          <div className="login-card">
            {!showLogin ? (
              <div className="login-prompt">
                <h2 className="card-title">
                  <span className="card-icon">🔐</span>
                  Área de Miembros
                </h2>
                <p>¿Ya eres parte de la manada? Accede para ver estadísticas detalladas de todos los miembros.</p>
                <button 
                  className="login-toggle-btn"
                  onClick={() => setShowLogin(true)}
                >
                  🔐 Iniciar Sesión
                </button>
              </div>
            ) : (
              <div className="login-container">
                <h3 className="login-title">🔐 Acceso Miembros</h3>
                <form onSubmit={handleSubmit} className="login-form">
                  <div className="form-group">
                    <label htmlFor="username">Usuario</label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingresa tu usuario"
                      autoComplete="username"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                    />
                  </div>
                  {error && <div className="login-error">{error}</div>}
                  <div className="login-buttons">
                    <button type="submit" className="login-btn">
                      Entrar
                    </button>
                    <button 
                      type="button" 
                      className="login-cancel-btn"
                      onClick={() => setShowLogin(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
};

export default Login;
