CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    profile_pic VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status ENUM('Present', 'Late', 'Absent') DEFAULT 'Absent',
    ip_address VARCHAR(45),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Admin Table
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sanctions Table
CREATE TABLE IF NOT EXISTS sanctions (
    sanction_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    type ENUM('Warning', 'Suspension', 'Termination', 'Other') NOT NULL,
    reason TEXT,
    date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Settings Table (Key-Value Store)
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT
);

-- Seed Default Settings
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('work_start_time', '09:00'),
('work_end_time', '17:00'),
('late_threshold_minutes', '15'),
('allowed_ip_range', '127.0.0.1,::1');

-- Seed Staff (Password: password123)
-- Hash: $2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m
INSERT IGNORE INTO staff (name, email, password, department, status) VALUES 
('John Doe', 'john@example.com', '$2b$10$4RgLxBOf9j.RLX9txhEjb.nFpKMFMSgAW9gmi2olXp1k8tqhAWX9m', 'Computer Science', 'Active');

-- Seed Admin (Password: admin123)
INSERT IGNORE INTO admins (name, email, password) VALUES 
('System Admin', 'admin@school.edu', '$2b$10$SUOU7cZRga3MFWXxHtdQD./M3S4Fgvd5iqt4exRr4UnKiOyW7Oiue');
