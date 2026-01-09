# 🚂 Despliegue en Railway - Paso a Paso

## ⚡ La Opción Más Fácil

Railway puede hostear tu aplicación completa (frontend + backend) en minutos.

---

## 📋 Paso 1: Preparar el Código

### 1.1 Verificar archivos necesarios

Ya tienes estos archivos creados:
- ✅ `server.js` (backend)
- ✅ `package.json` (dependencias)
- ✅ `railway.json` (configuración de Railway)
- ✅ `Procfile` (comando de inicio)

### 1.2 Modificar `server.js` para servir el frontend

Necesitamos que el backend también sirva los archivos estáticos del frontend cuando esté en producción.

**Abre `server.js` y agrega esto al final, ANTES de `app.listen()`:**

```javascript
// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'build')));
  
  // Todas las rutas que no sean /api van al frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
```

**El archivo completo debería verse así:**

```javascript
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json());

// ... (todo el código existente de las rutas) ...

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  // Todas las rutas que no sean /api van al frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📁 Datos guardados en: ${DATA_DIR}`);
});
```

### 1.3 Actualizar `package.json`

Agrega un script para construir y servir todo junto:

```json
"scripts": {
  "start": "react-scripts start",
  "server": "node server.js",
  "dev": "concurrently \"npm run server\" \"npm start\"",
  "build": "react-scripts build",
  "build:server": "npm run build && node server.js",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

---

## 🚀 Paso 2: Crear Cuenta en Railway

1. Ve a **https://railway.app**
2. Haz clic en **"Login"** o **"Start a New Project"**
3. Elige **"Login with GitHub"** (recomendado)
4. Autoriza Railway para acceder a tu GitHub

---

## 📦 Paso 3: Crear Proyecto en Railway

1. En el dashboard de Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Elige tu repositorio **IN-WO**
4. Railway detectará automáticamente que es un proyecto Node.js

---

## ⚙️ Paso 4: Configurar el Servicio

### 4.1 Configurar Variables de Entorno

1. En tu proyecto de Railway, haz clic en el servicio
2. Ve a la pestaña **"Variables"**
3. Agrega estas variables:

```
NODE_ENV=production
PORT=3001
```

### 4.2 Configurar Build y Start

1. Ve a la pestaña **"Settings"**
2. En **"Build Command"**, deja vacío (Railway lo detectará automáticamente)
3. En **"Start Command"**, escribe:
   ```
   npm run build && node server.js
   ```
   O si prefieres usar el script:
   ```
   npm run build:server
   ```

**Alternativa más simple:**
Si prefieres que Railway construya automáticamente:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.js`

---

## 🔧 Paso 5: Configurar el Frontend

### 5.1 Actualizar la URL del Backend

El frontend necesita saber dónde está el backend. Railway te dará una URL automática.

1. Después del primer despliegue, Railway te dará una URL como:
   `https://tu-proyecto.up.railway.app`

2. Ve a **"Variables"** y agrega:
   ```
   REACT_APP_API_URL=https://tu-proyecto.up.railway.app
   ```

3. **IMPORTANTE**: Reemplaza `tu-proyecto` con la URL real que Railway te dio.

---

## 🎯 Paso 6: Desplegar

1. Railway comenzará a construir automáticamente
2. Verás los logs en tiempo real
3. Espera a que termine (puede tardar 2-5 minutos la primera vez)
4. Cuando veas "✅ Build successful", tu app está lista

---

## 🌐 Paso 7: Obtener tu URL

1. En Railway, haz clic en tu servicio
2. Ve a la pestaña **"Settings"**
3. Haz clic en **"Generate Domain"** para obtener una URL pública
4. O ve a **"Networking"** para configurar un dominio personalizado

---

## ✅ Paso 8: Verificar que Funciona

1. Abre la URL que Railway te dio
2. Deberías ver tu aplicación
3. Prueba hacer login
4. Prueba agregar jugadores a un equipo
5. Verifica que los datos se guardan

---

## 🔍 Solución de Problemas

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Railway ejecutará `npm install` automáticamente

### Error: "Port already in use"
- Railway asigna el puerto automáticamente con `process.env.PORT`
- No necesitas configurarlo manualmente

### El frontend no carga
- Verifica que el build se completó correctamente
- Revisa que `REACT_APP_API_URL` esté configurada
- Verifica los logs en Railway

### Los datos no se guardan
- Railway tiene persistencia de archivos
- La carpeta `data/` se creará automáticamente
- Verifica los logs para ver si hay errores de permisos

### CORS errors
- El backend ya tiene `cors()` configurado
- Si persisten, agrega tu dominio en `server.js`:
  ```javascript
  app.use(cors({
    origin: ['https://tu-dominio.railway.app'],
    credentials: true
  }));
  ```

---

## 📝 Checklist Final

Antes de desplegar:
- [ ] Modifiqué `server.js` para servir archivos estáticos
- [ ] Agregué script `build:server` en `package.json`
- [ ] Creé cuenta en Railway
- [ ] Conecté mi repositorio de GitHub
- [ ] Configuré variables de entorno
- [ ] Configuré Build y Start commands

Después del despliegue:
- [ ] La aplicación carga correctamente
- [ ] Puedo hacer login
- [ ] Puedo agregar jugadores
- [ ] Los datos se guardan
- [ ] El admin puede ver todos los equipos

---

## 💰 Costos

- **Plan Gratuito**: $5 de crédito gratis al mes
- **Plan Hobby**: $5/mes (después del trial)
- **Plan Pro**: $20/mes (para más recursos)

Para empezar, el plan gratuito es suficiente.

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en Railway. Si tienes algún problema, revisa los logs en Railway o contacta a soporte.

---

*¿Necesitas ayuda? Revisa los logs en Railway o consulta la documentación: https://docs.railway.app*
