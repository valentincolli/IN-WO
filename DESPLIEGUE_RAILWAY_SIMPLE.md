# 🚂 Despliegue en Railway - Guía Rápida

## ✅ Ya Tienes:
- ✅ Código en GitHub: https://github.com/valentincolli/IN-WO
- ✅ Archivos de configuración listos
- ✅ Backend preparado para producción

---

## 🎯 PASO 1: Crear Cuenta en Railway

1. Ve a **https://railway.app**
2. Haz clic en **"Login"** o **"Start a New Project"**
3. Selecciona **"Login with GitHub"**
4. Autoriza Railway para acceder a tu GitHub

---

## 📦 PASO 2: Crear Proyecto

1. En el dashboard de Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio: **valentincolli/IN-WO**
4. Railway comenzará a construir automáticamente

**⏳ Espera 2-5 minutos** mientras Railway construye tu aplicación.

---

## ⚙️ PASO 3: Configurar Variables de Entorno

1. En tu proyecto de Railway, haz clic en el **servicio** (el rectángulo que aparece)
2. Ve a la pestaña **"Variables"** (en el menú lateral)
3. Haz clic en **"New Variable"** o **"Raw Editor"**

4. Agrega estas variables (una por una):

   **Variable 1:**
   ```
   NODE_ENV = production
   ```

   **Variable 2:**
   ```
   REACT_APP_API_URL = (déjalo vacío por ahora)
   ```

---

## 🔧 PASO 4: Configurar Comandos de Build y Start

1. En el mismo servicio, ve a la pestaña **"Settings"**
2. Busca la sección **"Deploy"**
3. En **"Build Command"**, déjalo vacío (Railway lo detectará automáticamente)
4. En **"Start Command"**, escribe exactamente esto:
   ```
   npm run build && node server.js
   ```
5. Haz clic en **"Save"** o simplemente cierra (se guarda automáticamente)

---

## 🌐 PASO 5: Obtener tu URL

1. Espera a que Railway termine de construir (verás "✅ Deploy successful")
2. Ve a la pestaña **"Settings"**
3. Busca la sección **"Networking"** o **"Domains"**
4. Haz clic en **"Generate Domain"** o busca el dominio que Railway ya creó
5. Railway te dará una URL como: `https://in-wo-production.up.railway.app`
6. **COPIA ESA URL COMPLETA** (la necesitarás en el siguiente paso)

---

## 🔗 PASO 6: Configurar la URL del Backend

1. Vuelve a la pestaña **"Variables"**
2. Busca la variable `REACT_APP_API_URL`
3. Haz clic en el lápiz (editar) o haz doble clic
4. Pega la URL que copiaste (ej: `https://in-wo-production.up.railway.app`)
5. Guarda

**⚠️ IMPORTANTE**: 
- Usa la URL completa con `https://`
- No agregues `/api` al final, solo la URL base

---

## 🔄 PASO 7: Redesplegar

1. Railway detectará automáticamente el cambio en las variables
2. Verás que comienza un nuevo despliegue
3. Espera 2-3 minutos mientras redespliega

---

## ✅ PASO 8: Probar tu Aplicación

1. Ve a la pestaña **"Settings"** → **"Networking"**
2. Haz clic en la URL que Railway te dio
3. Se abrirá tu aplicación en una nueva pestaña
4. Prueba:
   - ✅ Ver la página principal
   - ✅ Hacer login con un usuario
   - ✅ Agregar jugadores a un equipo
   - ✅ Verificar que los datos se guardan

---

## 🆘 Solución de Problemas

### ❌ Error: "Build failed"
**Solución:**
1. Ve a la pestaña **"Deployments"**
2. Haz clic en el deployment fallido
3. Revisa los logs para ver el error
4. Comúnmente es por:
   - Dependencias faltantes (verifica `package.json`)
   - Error de sintaxis (revisa los logs)

### ❌ La aplicación carga pero no funciona
**Solución:**
1. Verifica que `REACT_APP_API_URL` esté configurada correctamente
2. Abre la consola del navegador (F12) y revisa errores
3. Verifica que el backend esté corriendo (ve a `/api/health`)

### ❌ Error de CORS
**Solución:**
El backend ya tiene CORS configurado. Si persiste:
1. Ve a `server.js`
2. Busca `app.use(cors())`
3. Cámbialo por:
   ```javascript
   app.use(cors({
     origin: ['https://tu-url.railway.app'],
     credentials: true
   }));
   ```

### ❌ Los datos no se guardan
**Solución:**
1. Railway tiene persistencia automática
2. La carpeta `data/` se crea automáticamente
3. Revisa los logs para ver si hay errores de permisos

---

## 📋 Checklist Rápido

- [ ] Creé cuenta en Railway
- [ ] Conecté con GitHub
- [ ] Creé proyecto desde GitHub
- [ ] Configuré `NODE_ENV=production`
- [ ] Configuré Start Command: `npm run build && node server.js`
- [ ] Obtuve la URL de Railway
- [ ] Configuré `REACT_APP_API_URL` con la URL
- [ ] Esperé el redespliegue
- [ ] Probé la aplicación

---

## 💡 Tips

- **Logs en tiempo real**: Ve a "Deployments" → Click en el deployment → Verás los logs
- **Redesplegar manualmente**: Settings → "Redeploy"
- **Ver variables**: Variables → "Raw Editor" para ver todas juntas
- **Dominio personalizado**: Settings → Networking → "Custom Domain"

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando. Si tienes algún problema, revisa los logs en Railway o dime qué error ves.

**Tu URL será algo como:** `https://in-wo-production.up.railway.app`

---

¿En qué paso estás? ¿Necesitas ayuda con algo específico?
