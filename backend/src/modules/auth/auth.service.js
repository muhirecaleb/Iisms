const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../../config/database");
const env = require("../../config/environment");
const { UnauthorizedError, NotFoundError } = require("../../utils/errors");
const { maskEmail } = require("../../utils/helpers");
const logger = require("../../utils/logger");

class AuthService {
  async _isPasswordValid(storedPassword, providedPassword) {
    if (!storedPassword || !providedPassword) {
      return false;
    }

    if (
      storedPassword.startsWith("$2") ||
      storedPassword.startsWith("$2a") ||
      storedPassword.startsWith("$2b")
    ) {
      try {
        return await bcrypt.compare(providedPassword, storedPassword);
      } catch {
        return false;
      }
    }

    return storedPassword === providedPassword;
  }

  async login(username, password) {
    const [users] = await db.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.username = ? AND u.deleted_at IS NULL`,
      [username],
    );

    if (users.length === 0) {
      await this._logAttempt(null, username, "failed_password");
      throw new UnauthorizedError("Invalid username or password");
    }

    const user = users[0];

    if (user.status === "locked") {
      throw new UnauthorizedError("Account is locked. Contact administrator.");
    }

    const valid = await this._isPasswordValid(user.password_hash, password);
    if (!valid) {
      await this._logAttempt(user.user_id, username, "failed_password");
      throw new UnauthorizedError("Invalid username or password");
    }

    await this._logAttempt(user.user_id, username, "success");

    return {
      user: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role_name,
      },
      requiresOtp: true,
    };
  }

  async sendOtp(userId) {
    const [users] = await db.query(
      "SELECT email FROM users WHERE user_id = ? AND deleted_at IS NULL",
      [userId],
    );
    if (users.length === 0) {
      throw new NotFoundError("User not found");
    }

    const email = users[0].email;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    await db.query(
      `INSERT INTO otp_codes (user_id, code_hash, channel, expires_at)
       VALUES (?, ?, 'email', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [userId, codeHash, env.otp.devMode ? 60 : 10],
    );

    logger.info(`OTP for user ${userId}: ${code}`);

    return {
      maskedEmail: maskEmail(email),
      expiresIn: 600,
      devMode: env.otp.devMode,
      ...(env.otp.devMode && { devCode: code }),
    };
  }

  async verifyOtp(userId, code) {
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const [otps] = await db.query(
      `SELECT * FROM otp_codes 
       WHERE user_id = ? AND code_hash = ? AND consumed_at IS NULL 
       AND expires_at > NOW() AND attempts < max_attempts`,
      [userId, codeHash],
    );

    if (otps.length === 0) {
      // Increment attempts for any pending OTPs
      await db.query(
        `UPDATE otp_codes SET attempts = attempts + 1 
         WHERE user_id = ? AND consumed_at IS NULL AND expires_at > NOW()`,
        [userId],
      );
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const otp = otps[0];
    await db.query(
      "UPDATE otp_codes SET consumed_at = NOW() WHERE otp_id = ?",
      [otp.otp_id],
    );

    const [users] = await db.query(
      `SELECT u.*, r.role_name, r.role_id 
       FROM users u JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = ?`,
      [userId],
    );
    const user = users[0];

    // Load permissions
    const [perms] = await db.query(
      "SELECT module_key, can_view, can_create, can_edit, can_delete FROM role_permissions WHERE role_id = ?",
      [user.role_id],
    );
    const permissions = {};
    for (const p of perms) {
      permissions[p.module_key] = {
        canView: !!p.can_view,
        canCreate: !!p.can_create,
        canEdit: !!p.can_edit,
        canDelete: !!p.can_delete,
      };
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        sub: user.user_id,
        username: user.username,
        role: user.role_name,
        permissions,
      },
      env.jwt.accessSecret,
      { expiresIn: env.jwt.accessExpiry },
    );

    const refreshToken = jwt.sign(
      { sub: user.user_id },
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiry },
    );

    // Store refresh token hash
    const refreshHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    await db.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [userId, refreshHash],
    );

    // Update last login
    await db.query("UPDATE users SET last_login_at = NOW() WHERE user_id = ?", [
      userId,
    ]);

    return {
      user: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role_name,
        permissions: Object.keys(permissions),
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async refresh(token) {
    if (!token) {
      throw new UnauthorizedError("Refresh token required");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [tokens] = await db.query(
      "SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = FALSE AND expires_at > NOW()",
      [tokenHash],
    );
    if (tokens.length === 0) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    try {
      const decoded = jwt.verify(token, env.jwt.refreshSecret);

      // Revoke old token (rotation)
      await db.query(
        "UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?",
        [tokenHash],
      );

      // Issue new tokens
      const [users] = await db.query(
        `SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?`,
        [decoded.sub],
      );
      const user = users[0];

      const newAccessToken = jwt.sign(
        { sub: user.user_id, username: user.username, role: user.role_name },
        env.jwt.accessSecret,
        { expiresIn: env.jwt.accessExpiry },
      );

      const newRefreshToken = jwt.sign(
        { sub: user.user_id },
        env.jwt.refreshSecret,
        { expiresIn: env.jwt.refreshExpiry },
      );

      const newHash = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");
      await db.query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
        [user.user_id, newHash],
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  async logout(userId) {
    await db.query(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?",
      [userId],
    );
  }

  async getProfile(userId) {
    const [users] = await db.query(
      `SELECT u.user_id, u.username, u.full_name, u.email, u.phone, u.last_login_at,
              r.role_name, r.role_id
       FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ? AND u.deleted_at IS NULL`,
      [userId],
    );
    if (users.length === 0) {
      throw new NotFoundError("User not found");
    }

    const [perms] = await db.query(
      "SELECT module_key FROM role_permissions WHERE role_id = ? AND can_view = TRUE",
      [users[0].role_id],
    );

    return {
      ...users[0],
      permissions: perms.map((p) => p.module_key),
    };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const [users] = await db.query(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [userId],
    );
    if (users.length === 0) {
      throw new NotFoundError("User not found");
    }

    const valid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      hash,
      userId,
    ]);
  }

  async _logAttempt(userId, username, status) {
    await db.query(
      "INSERT INTO login_logs (user_id, username_attempted, ip_address, user_agent, status) VALUES (?, ?, ?, ?, ?)",
      [userId, username, "req.ip", "req.headers.user-agent", status],
    );
  }
}

module.exports = new AuthService();
