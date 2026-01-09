# 🚀 Guía de Despliegue - Infernal Wolves

## 📋 Análisis del Proyecto

Tu aplicación tiene:
- **Frontend**: React (Create React App)
- **Backend**: Node.js + Express (puerto 3001)
- **Datos**: Archivos JSON en carpeta `data/`
- **API Externa**: Wargaming API (requiere API key)

---

## 🎯 Opciones de Despliegue Recomendadas

### ⭐ **Opción 1: Railway (Recomendada - Más Fácil)**

**Railway puede hostear tanto frontend como backend en un solo lugar.**

#### Pasos:

1. **Crear cuenta en Railway** (https://railway.app)
   - Conecta tu repositorio de GitHub

2. **Desplegar Backend:**
   - Crea un nuevo proyecto en Railway
   - Selecciona tu repositorio
   - Railway detectará automáticamente Node.js
   - Configura las variables de entorno:
     ```
     PORT=3001
     NODE_ENV=production
     ```
   - Railway asignará una URL automática (ej: `https://tu-backend.railway.app`)

3. **Desplegar Frontend:**
   - Crea otro servicio en el mismo proyecto
   - Configura como "Static Site" o "Nixpacks"
   - Variables de entorno:
     ```
     REACT_APP_API_URL=https://tu-backend.railway.app
     ```
   - Build command: `npm run build`
   - Start command: `npx serve -s build -l 3000`

**Ventajas:**
- ✅ Gratis para empezar ($5/mes después)
- ✅ Muy fácil de configurar
- ✅ HTTPS automático
- ✅ Despliegue automático desde GitHub
- ✅ Persistencia de datos incluida

---

### ⭐ **Opción 2: Render (Gratis con limitaciones)**

**Similar a Railway pero con plan gratuito más limitado.**

#### Pasos:

1. **Backend en Render:**
   - Crea cuenta en https://render.com
   - New → Web Service
   - Conecta tu repositorio
   - Configuración:
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Environment Variables**:
       ```
       PORT=3001
       NODE_ENV=production
       ```
   - Render te dará una URL: `https://tu-backend.onrender.com`

2. **Frontend en Render:**
   - New → Static Site
   - Conecta tu repositorio
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://tu-backend.onrender.com
     ```

**Ventajas:**
- ✅ Plan gratuito disponible
- ✅ HTTPS automático
- ⚠️ El servicio gratuito se "duerme" después de 15 min de inactividad

---

### ⭐ **Opción 3: VPS (DigitalOcean, Linode, etc.)**

**Máximo control, pero requiere más configuración.**

#### Pasos:

1. **Crear VPS:**
   - DigitalOcean Droplet ($6/mes mínimo)
   - Ubuntu 22.04 LTS
   - Al menos 1GB RAM

2. **Configurar servidor:**
   ```bash
   # Actualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Instalar Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Instalar PM2 (gestor de procesos)
   sudo npm install -g pm2
   
   # Instalar Nginx
   sudo apt install nginx -y
   ```

3. **Desplegar aplicación:**
   ```bash
   # Clonar repositorio
   git clone https://github.com/tu-usuario/IN-WO.git
   cd IN-WO
   
   # Instalar dependencias
   npm install
   
   # Construir frontend
   npm run build
   
   # Iniciar backend con PM2
   pm2 start server.js --name "inwo-backend"
   pm2 save
   pm2 startup
   ```

4. **Configurar Nginx:**
   ```nginx
   # /etc/nginx/sites-available/inwo
   server {
       listen 80;
       server_name tu-dominio.com;
       
       # Frontend
       location / {
           root /home/usuario/IN-WO/build;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Activar configuración
   sudo ln -s /etc/nginx/sites-available/inwo /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Configurar SSL (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d tu-dominio.com
   ```

**Ventajas:**
- ✅ Control total
- ✅ Sin limitaciones de "sueño"
- ✅ Más económico a largo plazo
- ⚠️ Requiere conocimientos de servidor

---

### ⭐ **Opción 4: Vercel (Frontend) + Railway (Backend)**

**Combinación popular para React + Node.js.**

#### Pasos:

1. **Backend en Railway** (igual que Opción 1)

2. **Frontend en Vercel:**
   - Crea cuenta en https://vercel.com
   - Importa tu repositorio
   - Configuración automática
   - Variables de entorno:
     ```
     REACT_APP_API_URL=https://tu-backend.railway.app
     ```
   - Vercel detectará React automáticamente

**Ventajas:**
- ✅ Vercel es excelente para React
- ✅ Despliegue automático
- ✅ CDN global
- ✅ Plan gratuito generoso

---

## 🔧 Configuración Necesaria

### Variables de Entorno

#### Backend:
```env
PORT=3001
NODE_ENV=production
```

#### Frontend:
```env
REACT_APP_API_URL=https://tu-backend-url.com
```

### Modificar Código para Producción

1. **Actualizar `src/services/teamApi.js`:**
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
   ```
   (Ya está configurado así ✅)

2. **Actualizar `src/setupProxy.js`:**
   - Este archivo solo funciona en desarrollo
   - En producción, las peticiones van directo a `REACT_APP_API_URL`
   - No necesitas cambiarlo

3. **CORS en Backend:**
   - El backend ya tiene `cors()` configurado
   - Si tienes problemas, ajusta en `server.js`:
   ```javascript
   app.use(cors({
     origin: ['https://tu-frontend-url.com', 'http://localhost:3000'],
     credentials: true
   }));
   ```

---

## 📝 Checklist de Despliegue

### Antes de desplegar:

- [ ] Verificar que `package.json` tiene todos los scripts necesarios
- [ ] Verificar que `server.js` está en la raíz
- [ ] Verificar que la carpeta `data/` está en `.gitignore` (no subir datos de prueba)
- [ ] Probar build local: `npm run build`
- [ ] Probar servidor local: `npm run server`

### Durante el despliegue:

- [ ] Configurar variables de entorno
- [ ] Verificar que el backend responde en `/api/health`
- [ ] Verificar que el frontend puede comunicarse con el backend
- [ ] Probar login y funcionalidades básicas

### Después del despliegue:

- [ ] Probar todas las funcionalidades
- [ ] Verificar que los datos se guardan correctamente
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar backup de la carpeta `data/` (si usas VPS)

---

## 🎯 Recomendación Final

**Para empezar rápido:** Railway (Opción 1)
- Todo en un solo lugar
- Muy fácil de configurar
- $5/mes después del trial

**Para máximo control:** VPS (Opción 3)
- $6/mes en DigitalOcean
- Sin limitaciones
- Requiere más configuración

**Para mejor rendimiento:** Vercel + Railway (Opción 4)
- Frontend en Vercel (CDN global)
- Backend en Railway
- Mejor para usuarios globales

---

## 🔒 Seguridad en Producción

1. **HTTPS obligatorio** (todos los servicios lo incluyen)
2. **Variables de entorno** para API keys (no hardcodear)
3. **Rate limiting** en backend (considera agregar)
4. **Backup regular** de carpeta `data/`

---

## 📞 Soporte

Si tienes problemas:
- Revisa los logs del servidor
- Verifica variables de entorno
- Prueba endpoints con Postman/curl
- Revisa CORS si hay errores de conexión

---

*Última actualización: Enero 2026*
