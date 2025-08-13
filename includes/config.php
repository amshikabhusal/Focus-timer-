<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'bee');
define('DB_USER', 'root');
define('DB_PASS', '');

// Application configuration
define('APP_NAME', 'bee');
define('APP_URL', 'http://localhost');
define('SESSION_LIFETIME', 86400); // 24 hours

// Security settings
define('PASSWORD_MIN_LENGTH', 6);
define('SESSION_COOKIE_SECURE', false); // Set to true in production with HTTPS
define('SESSION_COOKIE_HTTPONLY', true);

// Initialize database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Session configuration
// ini_set('session.cookie_lifetime', SESSION_LIFETIME);
// ini_set('session.cookie_secure', SESSION_COOKIE_SECURE);
// ini_set('session.cookie_httponly', SESSION_COOKIE_HTTPONLY);
// ini_set('session.use_strict_mode', 1);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
