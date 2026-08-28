-- =====================================================
-- System Logs (Audit Trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_logs (
  log_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED DEFAULT NULL COMMENT 'User who performed the action',
  action        VARCHAR(50) NOT NULL COMMENT 'Action type: login, create, update, delete, etc.',
  module_key    VARCHAR(50) NOT NULL COMMENT 'Module: students, staff, tasks, auth, etc.',
  entity_id     INT UNSIGNED DEFAULT NULL COMMENT 'ID of the affected entity',
  entity_type   VARCHAR(50) DEFAULT NULL COMMENT 'Type of entity: student, staff, user, etc.',
  description   TEXT DEFAULT NULL COMMENT 'Human-readable description',
  ip_address    VARCHAR(45) DEFAULT NULL,
  user_agent    VARCHAR(500) DEFAULT NULL,
  old_values    JSON DEFAULT NULL COMMENT 'Previous state (for updates)',
  new_values    JSON DEFAULT NULL COMMENT 'New state (for creates/updates)',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_logs_user      (user_id),
  INDEX idx_logs_action    (action),
  INDEX idx_logs_module    (module_key),
  INDEX idx_logs_entity    (module_key, entity_id),
  INDEX idx_logs_created   (created_at),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
