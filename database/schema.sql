-- FocusTimer+ Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS bee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bee;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_active (active)
);

-- Focus sessions table
CREATE TABLE focus_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_type ENUM('focus', 'break') DEFAULT 'focus',
    duration_minutes INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_started_at (started_at)
);

-- Todos table
CREATE TABLE todos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_completed (completed),
    INDEX idx_priority (priority)
);

-- Moods table
CREATE TABLE moods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    mood_type VARCHAR(50) NOT NULL,
    intensity INT CHECK (intensity >= 1 AND intensity <= 10),
    notes TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_logged_at (logged_at)
);

-- User preferences table
CREATE TABLE user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    focus_duration INT DEFAULT 25,
    break_duration INT DEFAULT 5,
    long_break_duration INT DEFAULT 15,
    sessions_until_long_break INT DEFAULT 4,
    sound_enabled BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COUNT(DISTINCT fs.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN fs.completed = TRUE THEN fs.id END) as completed_sessions,
    COUNT(DISTINCT t.id) as total_todos,
    COUNT(DISTINCT CASE WHEN t.completed = TRUE THEN t.id END) as completed_todos,
    COUNT(DISTINCT m.id) as mood_entries,
    AVG(m.intensity) as avg_mood_intensity
FROM users u
LEFT JOIN focus_sessions fs ON u.id = fs.user_id
LEFT JOIN todos t ON u.id = t.user_id
LEFT JOIN moods m ON u.id = m.user_id
WHERE u.active = TRUE
GROUP BY u.id, u.name, u.email;

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_preferences WHERE user_id IS NOT NULL);
