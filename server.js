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

// Asegurar que el directorio de datos existe
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creando directorio de datos:', error);
  }
}

// Inicializar directorio al arrancar
ensureDataDir();

// Función para obtener la ruta del archivo del equipo
function getTeamFilePath(username) {
  const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return path.join(DATA_DIR, `${safeUsername}_team.json`);
}

// GET: Obtener equipo de un usuario
app.get('/api/teams/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const filePath = getTeamFilePath(username);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const team = JSON.parse(data);
      console.log(`Equipo cargado para ${username} (${team.length} miembros) desde: ${filePath}`);
      res.json({ success: true, team });
    } catch (error) {
      // Si el archivo no existe, devolver array vacío
      if (error.code === 'ENOENT') {
        console.log(`No se encontró equipo para ${username} en: ${filePath}`);
        res.json({ success: true, team: [] });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error leyendo equipo:', error);
    res.status(500).json({ success: false, error: 'Error al leer el equipo' });
  }
});

// POST: Guardar equipo de un usuario
app.post('/api/teams/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { team } = req.body;
    
    if (!Array.isArray(team)) {
      return res.status(400).json({ success: false, error: 'El equipo debe ser un array' });
    }
    
    const filePath = getTeamFilePath(username);
    await fs.writeFile(filePath, JSON.stringify(team, null, 2), 'utf8');
    
    console.log(`Equipo guardado para ${username} (${team.length} miembros) en: ${filePath}`);
    res.json({ success: true, message: 'Equipo guardado correctamente' });
  } catch (error) {
    console.error('Error guardando equipo:', error);
    res.status(500).json({ success: false, error: 'Error al guardar el equipo' });
  }
});

// DELETE: Limpiar equipo de un usuario
app.delete('/api/teams/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const filePath = getTeamFilePath(username);
    
    try {
      await fs.unlink(filePath);
      res.json({ success: true, message: 'Equipo eliminado correctamente' });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({ success: true, message: 'El equipo ya estaba vacío' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar el equipo' });
  }
});

// GET: Listar todos los equipos (opcional, para administración)
app.get('/api/teams', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const teams = {};
    
    for (const file of files) {
      if (file.endsWith('_team.json')) {
        const username = file.replace('_team.json', '');
        const filePath = path.join(DATA_DIR, file);
        const data = await fs.readFile(filePath, 'utf8');
        teams[username] = JSON.parse(data);
      }
    }
    
    res.json({ success: true, teams });
  } catch (error) {
    console.error('Error listando equipos:', error);
    res.status(500).json({ success: false, error: 'Error al listar equipos' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Servidor funcionando correctamente' });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos (JS, CSS, imágenes, etc.)
  app.use(express.static(path.join(__dirname, 'build'), {
    maxAge: '1y',
    etag: false
  }));
  
  // Todas las rutas que no sean /api van al frontend (SPA routing)
  app.get('*', (req, res, next) => {
    // Excluir rutas de API y archivos estáticos
    if (req.path.startsWith('/api') || req.path.startsWith('/static')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📁 Datos guardados en: ${DATA_DIR}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Frontend servido desde: ${path.join(__dirname, 'build')}`);
  }
});
