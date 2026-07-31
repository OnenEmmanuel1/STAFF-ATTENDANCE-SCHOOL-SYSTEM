USE attendance_system;

-- Ensure staff table has profile_pic column if table already existed
SET @dbname = DATABASE();
SET @tablename = "staff";
SET @columnname = "profile_pic";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE staff ADD COLUMN profile_pic VARCHAR(255) DEFAULT NULL;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 1. SEED SETTINGS
-- ============================================
INSERT INTO settings (setting_key, setting_value) VALUES 
('work_start_time', '09:00'),
('work_end_time', '17:00'),
('late_threshold_minutes', '15'),
('allowed_ip_range', '127.0.0.1,::1'),
('school_name', 'St. Jude International Academy')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- ============================================
-- 2. SEED ADMINS
-- Admin 1 & 2 Password: admin123
-- ============================================
INSERT INTO admins (admin_id, name, email, password) VALUES 
(1, 'System Admin', 'admin@school.edu', '$2b$10$SUOU7cZRga3MFWXxHtdQD./M3S4Fgvd5iqt4exRr4UnKiOyW7Oiue'),
(2, 'Sarah Jenkins (Principal)', 's.jenkins@school.edu', '$2b$10$SUOU7cZRga3MFWXxHtdQD./M3S4Fgvd5iqt4exRr4UnKiOyW7Oiue')
ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password);

-- ============================================
-- 3. SEED STAFF MEMBERS
-- Staff Password: password123
-- ============================================
INSERT INTO staff (staff_id, name, email, password, department, status) VALUES 
(1, 'John Doe', 'john@example.com', '$2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m', 'Computer Science', 'Active'),
(2, 'Alice Smith', 'alice.smith@school.edu', '$2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m', 'Mathematics', 'Active'),
(3, 'Robert Brown', 'robert.brown@school.edu', '$2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m', 'Science', 'Active'),
(4, 'Emily Davis', 'emily.davis@school.edu', '$2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m', 'English & Literature', 'Active'),
(5, 'Michael Wilson', 'michael.wilson@school.edu', '$2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m', 'Physical Education', 'Active'),
(6, 'Jessica Taylor', 'jessica.taylor@school.edu', '$2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m', 'Art & Music', 'Inactive')
ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), department = VALUES(department), status = VALUES(status);

-- ============================================
-- 4. SEED ATTENDANCE RECORDS
-- ============================================
INSERT IGNORE INTO attendance (staff_id, date, check_in_time, check_out_time, status, ip_address) VALUES 
-- Staff 1 (John Doe)
(1, CURRENT_DATE - INTERVAL 4 DAY, '08:52:00', '17:05:00', 'Present', '127.0.0.1'),
(1, CURRENT_DATE - INTERVAL 3 DAY, '08:58:00', '17:00:00', 'Present', '127.0.0.1'),
(1, CURRENT_DATE - INTERVAL 2 DAY, '09:25:00', '17:10:00', 'Late',    '127.0.0.1'),
(1, CURRENT_DATE - INTERVAL 1 DAY, '08:50:00', '16:55:00', 'Present', '127.0.0.1'),
(1, CURRENT_DATE,                  '08:45:00', NULL,       'Present', '127.0.0.1'),

-- Staff 2 (Alice Smith)
(2, CURRENT_DATE - INTERVAL 4 DAY, '08:45:00', '17:00:00', 'Present', '127.0.0.1'),
(2, CURRENT_DATE - INTERVAL 3 DAY, '08:50:00', '17:15:00', 'Present', '127.0.0.1'),
(2, CURRENT_DATE - INTERVAL 2 DAY, '08:55:00', '17:02:00', 'Present', '127.0.0.1'),
(2, CURRENT_DATE - INTERVAL 1 DAY, '09:18:00', '17:00:00', 'Late',    '127.0.0.1'),
(2, CURRENT_DATE,                  '08:50:00', NULL,       'Present', '127.0.0.1'),

-- Staff 3 (Robert Brown)
(3, CURRENT_DATE - INTERVAL 4 DAY, '09:40:00', '17:00:00', 'Late',    '127.0.0.1'),
(3, CURRENT_DATE - INTERVAL 3 DAY, '09:35:00', '17:00:00', 'Late',    '127.0.0.1'),
(3, CURRENT_DATE - INTERVAL 2 DAY, NULL,       NULL,       'Absent',  NULL),
(3, CURRENT_DATE - INTERVAL 1 DAY, '08:55:00', '17:00:00', 'Present', '127.0.0.1'),
(3, CURRENT_DATE,                  '09:20:00', NULL,       'Late',    '127.0.0.1');

-- ============================================
-- 5. SEED NOTIFICATIONS
-- ============================================
INSERT IGNORE INTO notifications (staff_id, title, message, is_read) VALUES 
(1, 'Welcome to Attendance System', 'Your staff account has been registered successfully.', TRUE),
(1, 'Late Check-in Alert', 'You checked in at 09:25 AM 2 days ago, which is after the 09:15 AM threshold.', FALSE),
(3, 'Attendance Notice', 'You have been marked absent for 1 day this week.', FALSE);

-- ============================================
-- 6. SEED SANCTIONS
-- ============================================
INSERT IGNORE INTO sanctions (staff_id, type, reason, date) VALUES 
(3, 'Warning', 'Repeated tardiness and 1 unexcused absence within a single week.', CURRENT_DATE - INTERVAL 1 DAY);

-- ============================================
-- 7. SEED ADMIN LOGS
-- ============================================
INSERT IGNORE INTO admin_logs (admin_id, action, details) VALUES 
(1, 'System Initialization', 'Database tables and initial settings created.'),
(1, 'Added Staff', 'Registered new staff member: Alice Smith (Mathematics).'),
(2, 'Issued Warning', 'Issued warning sanction to Robert Brown due to tardiness.');
