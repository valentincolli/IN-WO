import React from 'react';

const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="tank-loader">
          <div className="tank-body"></div>
          <div className="tank-turret"></div>
          <div className="tank-cannon"></div>
          <div className="tank-tracks">
            <div className="track track-1"></div>
            <div className="track track-2"></div>
            <div className="track track-3"></div>
          </div>
        </div>
        <div className="loading-flames">
          <span className="flame">🔥</span>
          <span className="flame">🔥</span>
          <span className="flame">🔥</span>
        </div>
        <p className="loading-text">{message}</p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;

