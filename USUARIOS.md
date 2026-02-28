# 🔐 Sistema de Usuarios - Infernal Wolves

## Usuarios Disponibles

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `user` | `user` | Miembro | Acceso básico a estadísticas |
| `oficial` | `oficial` | Oficial | Acceso completo + Panel de oficial |
| `admin` | `admin` | Administrador | Acceso total |
| `FireAriel` | `FireAriel` | Administrador | Acceso total + Gestor de Equipos de Batalla |
| `KIRITONYU` | `KIRITONYU` | Administrador | Acceso total + Gestor de Equipos de Batalla |
| `fireariel` | `fireariel123` | Oficial | Acceso completo + Panel de oficial |
| `Mayor_defa` | `Mayor_defa123` | Oficial | Acceso completo + Panel de oficial |
| `Kiritonyu` | `Kiritonyu123` | Oficial | Acceso completo + Panel de oficial |
| `judejum12` | `judejum12123` | Oficial | Acceso completo + Panel de oficial |
| `0_Whait_0` | `0_Whait_0123` | Oficial | Acceso completo + Panel de oficial |
| `ANTONIOB` | `ANTONIOB123` | Oficial | Acceso completo + Panel de oficial |
| `_LastDrago_` | `_LastDrago_123` | Oficial | Acceso completo + Panel de oficial |
| `CrossNeri` | `CrossNeri123` | Oficial | Acceso completo + Panel de oficial |
| `Katlyne` | `Katlyne123` | Oficial | Acceso completo + Panel de oficial |
| `CORDERO` | `CORDERO123` | Oficial | Acceso completo + Panel de oficial |
| `Sunstrider_Revenge` | `Sunstrider_Revenge123` | Oficial | Acceso completo + Panel de oficial |
| `Tia_turbina_` | `Tia_turbina_123` | Oficial | Acceso completo + Panel de oficial |

---

## 📋 Permisos por Rol

### 🌐 Sin Login (Visitante)
- ✅ Ver descripción del clan
- ✅ Ver estadísticas generales del clan (batallas totales, % victorias, etc.)
- ✅ Ver récords del clan (sin nombres)
- ✅ Ver cantidad de jugadores activos
- ❌ No puede ver lista de miembros
- ❌ No puede ver estadísticas individuales

### 🎮 Miembro (`user` / `user`)
- ✅ Todo lo del visitante
- ✅ Ver lista completa de miembros
- ✅ Ver estadísticas de cada jugador
- ✅ Ver modal con detalles del jugador
- ✅ Ver estadísticas por modo (Aleatorias, Fortaleza, Avances)
- ✅ Ver estadísticas por tanque
- ✅ Ver enlaces externos (Tomato.gg, WoTLabs)
- ❌ No tiene acceso al panel de oficial

### ⭐ Oficial (`oficial` / `oficial`)
- ✅ Todo lo del miembro
- ✅ **Panel de Oficial** con:
  - Miembros totales
  - Jugadores activos (últimos 7 días)
  - Jugadores inactivos (+30 días)

### ⚔️ Oficiales con Gestor de Equipos
Los siguientes oficiales tienen acceso al **Gestor de Equipos de Batalla** (igual que FireAriel y KIRITONYU):
- `fireariel` / `fireariel123`
- `Mayor_defa` / `Mayor_defa123`
- `Kiritonyu` / `Kiritonyu123`
- `judejum12` / `judejum12123`
- `0_Whait_0` / `0_Whait_0123`
- `ANTONIOB` / `ANTONIOB123`
- `_LastDrago_` / `_LastDrago_123`
- `CrossNeri` / `CrossNeri123`
- `Katlyne` / `Katlyne123`
- `CORDERO` / `CORDERO123`
- `Sunstrider_Revenge` / `Sunstrider_Revenge123`
- `Tia_turbina_` / `Tia_turbina_123`

Cada uno tiene:
- ✅ **Gestor de Equipos de Batalla** con:
  - Tabla de miembros con botones para agregar al equipo
  - Tabla del equipo personal con estadísticas de jugadores seleccionados
  - Exportar equipo a archivo TXT
  - Los equipos se guardan automáticamente en el servidor (separados por usuario)
  - Funcionalidad especial para gestionar jugadores para batallas

### 👑 Administrador (`admin` / `admin`)
- ✅ Todo lo del oficial
- ✅ (Mismo acceso que oficial actualmente)

### ⚔️ FireAriel (`FireAriel` / `FireAriel`)
- ✅ Todo lo del administrador
- ✅ **Gestor de Equipos de Batalla** con:
  - Tabla de miembros con botones para agregar al equipo
  - Tabla del equipo de FireAriel con estadísticas de jugadores seleccionados
  - Exportar equipo a archivo TXT
  - Los equipos se guardan automáticamente en localStorage
  - Funcionalidad especial para gestionar jugadores para batallas

### ⚔️ KIRITONYU (`KIRITONYU` / `KIRITONYU`)
- ✅ Todo lo del administrador
- ✅ **Gestor de Equipos de Batalla** con:
  - Tabla de miembros con botones para agregar al equipo
  - Tabla del equipo de KIRITONYU con estadísticas de jugadores seleccionados
  - Exportar equipo a archivo TXT
  - Los equipos se guardan automáticamente en localStorage (separado del equipo de FireAriel)
  - Funcionalidad especial para gestionar jugadores para batallas

---

## 🔧 Cómo Agregar Nuevos Usuarios

Los usuarios están definidos en el archivo:
```
src/context/AuthContext.js
```

Para agregar un nuevo usuario, edita el array `USERS`:

```javascript
const USERS = [
  { username: 'user', password: 'user', role: 'member', name: 'Miembro' },
  { username: 'oficial', password: 'oficial', role: 'officer', name: 'Oficial' },
  { username: 'admin', password: 'admin', role: 'admin', name: 'Administrador' },
  // Agregar nuevos usuarios aquí:
  { username: 'nuevo_usuario', password: 'contraseña', role: 'member', name: 'Nombre Visible' },
];
```

### Roles disponibles:
- `member` - Miembro básico
- `officer` - Oficial con panel especial
- `admin` - Administrador

---

## 💾 Almacenamiento de Sesión

- La sesión se guarda en `localStorage` del navegador
- Clave: `inwo_user`
- La sesión persiste al recargar la página
- Para cerrar sesión: botón "Cerrar Sesión" o limpiar localStorage

---

## ⚠️ Notas de Seguridad

> **IMPORTANTE**: Este sistema de autenticación es **solo para demostración**.
> 
> - Las contraseñas están en texto plano en el código
> - No hay encriptación ni hashing
> - No hay backend real
> - Para producción, se recomienda implementar un backend con autenticación real

---

## 📞 Contacto

Para solicitar acceso o reportar problemas:
- Discord del clan
- Contactar a un oficial del clan

---

*Última actualización: Enero 2026*

