import React, { useState, useEffect } from 'react';
import MemberCard from './MemberCard';
import { getPlayerTankStats, getAllVehiclesInfo } from '../services/wargamingApi';

const MemberList = ({ members, playersStats, onMemberClick }) => {
  const [sortBy, setSortBy] = useState('role');
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tier10Counts, setTier10Counts] = useState({});
  const [loadingTier10, setLoadingTier10] = useState(false);

  const roleOrder = {
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
  };

  // Convertir members a array si es necesario
  const membersArray = Array.isArray(members) ? members : (members ? Object.values(members) : []);

  // Cargar cantidad de tier 10 para todos los miembros
  useEffect(() => {
    const loadTier10Counts = async () => {
      if (membersArray.length === 0) return;
      
      setLoadingTier10(true);
      const counts = {};
      
      try {
        // Cargar información de todos los vehículos una vez
        const vehiclesInfo = await getAllVehiclesInfo();

        // Para cada miembro, obtener sus tanques y contar tier 10
        // Limitar a los primeros 50 para no sobrecargar la API
        const membersToLoad = membersArray.slice(0, 50);
        
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
      } catch (error) {
        console.error('Error cargando información de vehículos:', error);
      }
      
      setTier10Counts(counts);
      setLoadingTier10(false);
    };

    loadTier10Counts();
  }, [membersArray]);

  const sortMembers = (membersList) => {
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
  };

  const filterMembers = (membersList) => {
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
  };

  const filteredAndSortedMembers = sortMembers(filterMembers(membersArray));

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

  return (
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

      <div className="members-grid">
        {filteredAndSortedMembers.map(member => (
          <MemberCard
            key={member.account_id}
            member={member}
            stats={playersStats[member.account_id]}
            tier10Count={tier10Counts[member.account_id] ?? (loadingTier10 ? '...' : null)}
            onClick={() => onMemberClick(member, playersStats[member.account_id])}
          />
        ))}
      </div>

      {filteredAndSortedMembers.length === 0 && (
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <p>No se encontraron jugadores</p>
        </div>
      )}
    </section>
  );
};

export default MemberList;
