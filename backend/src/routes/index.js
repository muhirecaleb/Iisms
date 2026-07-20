const fs = require('fs');
const path = require('path');
const router = require('express').Router();

const MODULES_DIR = path.join(__dirname, '../modules');

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Auto-discover and register module routes
const moduleDirs = fs.readdirSync(MODULES_DIR);

moduleDirs.forEach((moduleName) => {
  const modulePath = path.join(MODULES_DIR, moduleName);
  const stats = fs.statSync(modulePath);

  if (stats.isDirectory()) {
    // Check for nested system modules
    if (moduleName === 'system') {
      const systemModules = fs.readdirSync(modulePath);
      systemModules.forEach((sysModule) => {
        const sysRoutesPath = path.join(modulePath, sysModule, `${sysModule}.routes.js`);
        if (fs.existsSync(sysRoutesPath)) {
          const sysRouter = require(sysRoutesPath);
          router.use(`/system/${sysModule}`, sysRouter);
          console.log(`  ✓ Module registered: /api/v1/system/${sysModule}`);
        }
      });
      return;
    }

    // Regular module
    const routesFile = path.join(modulePath, `${moduleName}.routes.js`);
    if (fs.existsSync(routesFile)) {
      const moduleRouter = require(routesFile);
      router.use(`/${moduleName}`, moduleRouter);
      console.log(`  ✓ Module registered: /api/v1/${moduleName}`);
    }
  }
});

module.exports = router;
