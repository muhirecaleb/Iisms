const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const authController = require("../modules/auth/auth.controller");
const { loginSchema } = require("../modules/auth/auth.validation");

const MODULES_DIR = path.join(__dirname, "../modules");

// Health check endpoint (no auth required)
router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Compatibility login endpoint for clients calling /api/v1/login
router.post(
  "/login",
  validate(loginSchema),
  authController.login,
);
router.get("/login", (req, res) => {
  res.status(405).json({
    success: false,
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: "Use POST /api/v1/login with { username, password }",
    },
  });
});

// Compatibility change-password endpoint for clients calling /api/v1/change-password
router.put("/change-password", (req, res, next) => {
  authController.changePassword(req, res, next);
});

// Auto-discover and register module routes
const moduleDirs = fs.readdirSync(MODULES_DIR);

moduleDirs.forEach((moduleName) => {
  const modulePath = path.join(MODULES_DIR, moduleName);
  const stats = fs.statSync(modulePath);

  if (stats.isDirectory()) {
    // Check for nested system modules
    if (moduleName === "system") {
      const systemModules = fs.readdirSync(modulePath);
      systemModules.forEach((sysModule) => {
        const sysRoutesPath = path.join(
          modulePath,
          sysModule,
          `${sysModule}.routes.js`,
        );
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
