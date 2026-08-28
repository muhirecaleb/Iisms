-- =====================================================
-- Notifications Table
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL COMMENT 'Recipient user',
  type            ENUM('task_assigned', 'task_completed', 'task_updated',
                       'student_added', 'student_updated', 'student_promoted',
                       'staff_added', 'staff_updated',
                       'role_changed', 'user_created',
                       'system', 'info', 'warning', 'success')
                  NOT NULL DEFAULT 'info',
  title           VARCHAR(255) NOT NULL,
  message         TEXT NOT NULL,
  module_key      VARCHAR(50)  DEFAULT NULL COMMENT 'Related module (students, staff, tasks, etc.)',
  entity_id       INT UNSIGNED DEFAULT NULL COMMENT 'ID of the related entity',
  is_read         TINYINT(1)   NOT NULL DEFAULT 0,
  created_by      INT UNSIGNED DEFAULT NULL COMMENT 'User who triggered the notification',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_notifications_user   (user_id),
  INDEX idx_notifications_read   (user_id, is_read),
  INDEX idx_notifications_created (created_at),
  FOREIGN KEY (user_id)    REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
