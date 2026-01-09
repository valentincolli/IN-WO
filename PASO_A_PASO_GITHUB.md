# 📝 Guía Paso a Paso: Subir a GitHub y Desplegar

## 🎯 Objetivo
Subir tu proyecto a GitHub y luego desplegarlo en Railway.

---

## 📦 PASO 1: Preparar el Proyecto

### 1.1 Verificar que tienes Git
✅ Ya verificamos que Git está instalado

### 1.2 Verificar archivos importantes
Ya tienes:
- ✅ `.gitignore` (para no subir archivos innecesarios)
- ✅ `server.js` (modificado para producción)
- ✅ `package.json` (con scripts necesarios)
- ✅ `railway.json` (configuración de Railway)

---

## 🔐 PASO 2: Crear Cuenta en GitHub (si no tienes)

1. Ve a **https://github.com**
2. Haz clic en **"Sign up"**
3. Completa el formulario:
   - Username (ej: `tu-usuario`)
   - Email
   - Contraseña
4. Verifica tu email

---

## 📂 PASO 3: Crear Repositorio en GitHub

1. Una vez dentro de GitHub, haz clic en el **"+"** arriba a la derecha
2. Selecciona **"New repository"**
3. Completa:
   - **Repository name**: `IN-WO` (o el nombre que quieras)
   - **Description**: "Sistema de gestión de equipos para Infernal Wolves"
   - **Visibility**: Elige **Public** o **Private**
     - Public = cualquiera puede verlo (gratis)
     - Private = solo tú (requiere plan de pago o es gratis para estudiantes)
   - **NO marques** "Add a README file" (ya tienes archivos)
   - **NO marques** "Add .gitignore" (ya tienes uno)
   - **NO marques** "Choose a license"
4. Haz clic en **"Create repository"**

---

## 💻 PASO 4: Conectar tu Proyecto Local con GitHub

### 4.1 Abre PowerShell o Terminal en la carpeta del proyecto

Abre PowerShell y ejecuta estos comandos (uno por uno):

```powershell
# Ir a tu carpeta del proyecto
cd "C:\Users\Valentin Colli\Desktop\IN-WO"

# Verificar que estás en la carpeta correcta
pwd
```

### 4.2 Agregar todos los archivos

```powershell
# Agregar todos los archivos al staging
git add .
```

### 4.3 Hacer el primer commit

```powershell
# Crear el primer commit
git commit -m "Primer commit - Proyecto IN-WO"
```

### 4.4 Conectar con GitHub

GitHub te dará comandos después de crear el repositorio. Serán algo así:

```powershell
# Cambiar el nombre de la rama principal (si es necesario)
git branch -M main

# Agregar el repositorio remoto (REEMPLAZA 'tu-usuario' con tu usuario de GitHub)
git remote add origin https://github.com/tu-usuario/IN-WO.git

# Subir el código
git push -u origin main
```

**⚠️ IMPORTANTE**: 
- Reemplaza `tu-usuario` con tu usuario real de GitHub
- Si GitHub te pidió autenticación, puede pedirte usuario y contraseña
- Si tienes problemas, usa un Personal Access Token (ver abajo)

---

## 🔑 PASO 5: Autenticación con GitHub

Si te pide usuario y contraseña:

### Opción A: Personal Access Token (Recomendado)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Haz clic en **"Generate new token (classic)"**
3. Dale un nombre: "IN-WO Deployment"
4. Selecciona permisos:
   - ✅ `repo` (todos los permisos de repositorio)
5. Haz clic en **"Generate token"**
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Cuando Git te pida contraseña, pega el token (no tu contraseña de GitHub)

### Opción B: GitHub CLI (Más fácil)

```powershell
# Instalar GitHub CLI (si no lo tienes)
# Descarga desde: https://cli.github.com

# Autenticarse
gh auth login

# Seguir las instrucciones en pantalla
```

---

## ✅ PASO 6: Verificar que se Subió

1. Ve a tu repositorio en GitHub: `https://github.com/tu-usuario/IN-WO`
2. Deberías ver todos tus archivos
3. Si ves los archivos, ¡perfecto! ✅

---

## 🚂 PASO 7: Desplegar en Railway

Ahora que tu código está en GitHub:

### 7.1 Crear cuenta en Railway

1. Ve a **https://railway.app**
2. Haz clic en **"Login"**
3. Selecciona **"Login with GitHub"**
4. Autoriza Railway para acceder a tu GitHub

### 7.2 Crear Proyecto

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio **IN-WO**
4. Railway comenzará a construir automáticamente

### 7.3 Configurar Variables de Entorno

1. En tu proyecto de Railway, haz clic en el servicio
2. Ve a la pestaña **"Variables"**
3. Haz clic en **"New Variable"**
4. Agrega estas variables (una por una):

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   
   **Variable 2:**
   - Name: `REACT_APP_API_URL`
   - Value: (déjalo vacío por ahora, lo agregaremos después)

### 7.4 Configurar Build y Start

1. Ve a la pestaña **"Settings"**
2. Busca **"Build Command"** y déjalo vacío (Railway lo detectará)
3. En **"Start Command"**, escribe:
   ```
   npm run build && node server.js
   ```

### 7.5 Obtener tu URL

1. Espera a que Railway termine de construir (2-5 minutos)
2. Ve a la pestaña **"Settings"**
3. Busca **"Networking"** o **"Generate Domain"**
4. Railway te dará una URL como: `https://tu-proyecto.up.railway.app`
5. **COPIA ESA URL**

### 7.6 Configurar la URL del Backend

1. Vuelve a **"Variables"**
2. Edita la variable `REACT_APP_API_URL`
3. Pega la URL que copiaste (ej: `https://tu-proyecto.up.railway.app`)
4. Guarda

### 7.7 Esperar el Redespliegue

Railway detectará el cambio y redesplegará automáticamente. Espera 2-3 minutos.

---

## 🎉 PASO 8: ¡Probar tu Aplicación!

1. Abre la URL que Railway te dio
2. Deberías ver tu aplicación funcionando
3. Prueba hacer login
4. Prueba agregar jugadores a un equipo

---

## 🆘 Si Algo Sale Mal

### Error: "Repository not found"
- Verifica que el nombre del repositorio sea correcto
- Verifica que tengas permisos

### Error: "Authentication failed"
- Usa un Personal Access Token en lugar de contraseña
- O usa GitHub CLI

### Error en Railway: "Build failed"
- Revisa los logs en Railway
- Verifica que `package.json` tenga todas las dependencias
- Verifica que el comando de inicio sea correcto

### La aplicación no carga
- Verifica que `REACT_APP_API_URL` esté configurada
- Revisa los logs en Railway
- Espera unos minutos más (a veces tarda)

---

## 📋 Checklist Final

Antes de desplegar:
- [ ] Creé cuenta en GitHub
- [ ] Creé repositorio en GitHub
- [ ] Subí el código a GitHub
- [ ] Creé cuenta en Railway
- [ ] Conecté Railway con GitHub
- [ ] Configuré variables de entorno
- [ ] Configuré Start Command
- [ ] Obtuve la URL de Railway
- [ ] Configuré REACT_APP_API_URL con la URL

Después del despliegue:
- [ ] La aplicación carga
- [ ] Puedo hacer login
- [ ] Los datos se guardan

---

## 💡 Tips

- **Guarda tus URLs**: Anota la URL de Railway y de GitHub
- **Revisa los logs**: Si algo falla, los logs en Railway te dirán qué pasó
- **Backup**: Los datos se guardan en Railway, pero haz backup de la carpeta `data/` si es importante

---

¿Necesitas ayuda con algún paso específico? ¡Dime en qué paso estás y te ayudo!
