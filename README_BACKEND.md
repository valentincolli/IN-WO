# 🚀 Backend - Sistema de Equipos de Batalla

Este backend simple guarda los equipos de batalla de los usuarios en archivos JSON.

## 📁 Estructura

```
IN-WO/
├── server.js          # Servidor Express
├── data/              # Archivos JSON con los equipos (se crea automáticamente)
│   ├── fireariel_team.json
│   └── kiritonyu_team.json
└── package.json
```

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

## ▶️ Ejecutar

### Opción 1: Solo el backend
```bash
npm run server
```

### Opción 2: Frontend + Backend juntos (desarrollo)
```bash
npm run dev
```

### Opción 3: Por separado
Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm start
```

## 📡 Endpoints

### GET `/api/teams/:username`
Obtiene el equipo de un usuario.

**Ejemplo:**
```bash
GET http://localhost:3001/api/teams/fireariel
```

**Respuesta:**
```json
{
  "success": true,
  "team": [...]
}
```

### POST `/api/teams/:username`
Guarda el equipo de un usuario.

**Ejemplo:**
```bash
POST http://localhost:3001/api/teams/fireariel
Content-Type: application/json

{
  "team": [...]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Equipo guardado correctamente"
}
```

### DELETE `/api/teams/:username`
Elimina el equipo de un usuario.

**Ejemplo:**
```bash
DELETE http://localhost:3001/api/teams/fireariel
```

### GET `/api/health`
Verifica que el servidor esté funcionando.

## 📝 Archivos de Datos

Los equipos se guardan en la carpeta `data/` como archivos JSON:

- `fireariel_team.json` - Equipo de FireAriel
- `kiritonyu_team.json` - Equipo de KIRITONYU

**Formato del archivo:**
```json
[
  {
    "account_id": 123456,
    "account_name": "Jugador1",
    "role": "private"
  },
  {
    "account_id": 789012,
    "account_name": "Jugador2",
    "role": "officer"
  }
]
```

## 🌐 Hostear en Producción

### Opción 1: Vercel / Netlify (Frontend) + Railway / Render (Backend)

1. **Backend en Railway/Render:**
   - Sube el código
   - Configura el puerto: `PORT=3001`
   - El backend creará la carpeta `data/` automáticamente

2. **Frontend:**
   - Actualiza `REACT_APP_API_URL` en las variables de entorno
   - Ejemplo: `REACT_APP_API_URL=https://tu-backend.railway.app`

### Opción 2: Servidor VPS (Ubuntu/Debian)

1. Instala Node.js:
```bash
sudo apt update
sudo apt install nodejs npm
```

2. Clona el proyecto y ejecuta:
```bash
npm install
npm run build
```

3. Usa PM2 para mantener el servidor corriendo:
```bash
npm install -g pm2
pm2 start server.js --name "inwo-backend"
pm2 save
pm2 startup
```

4. Configura Nginx como proxy reverso (opcional)

### Opción 3: Docker

Crea un `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 🔒 Seguridad

⚠️ **Nota:** Este backend es simple y no tiene autenticación. Para producción, considera agregar:
- Autenticación JWT
- Validación de usuarios
- Rate limiting
- HTTPS

## 📦 Backup

Los archivos en `data/` son importantes. Haz backup regularmente:
```bash
# Copiar carpeta data
cp -r data/ backup_data_$(date +%Y%m%d)/
```

## 🐛 Troubleshooting

**Error: Puerto 3001 en uso**
```bash
# Cambiar puerto
PORT=3002 npm run server
```

**Error: No se puede escribir en data/**
```bash
# Dar permisos
chmod 755 data/
```

**Los datos no se guardan**
- Verifica que la carpeta `data/` existe
- Revisa los logs del servidor
- Verifica permisos de escritura
