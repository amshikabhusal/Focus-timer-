<?php
require_once 'config.php';

/**
 * Create a new user account
 */
function createUser($name, $email, $password) {
    global $pdo;
    
    try {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        
        $stmt->execute([$name, $email, $hashedPassword]);
        
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("User creation failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Authenticate user login
 */
function authenticateUser($email, $password) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT id, name, email, password 
            FROM users 
            WHERE email = ? AND active = 1
        ");
        
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            // Update last login
            $updateStmt = $pdo->prepare("
                UPDATE users 
                SET last_login = NOW() 
                WHERE id = ?
            ");
            $updateStmt->execute([$user['id']]);
            
            return $user;
        }
        
        return false;
    } catch (PDOException $e) {
        error_log("Authentication failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Check if user exists
 */
function userExists($email) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        return $stmt->fetch() !== false;
    } catch (PDOException $e) {
        error_log("User existence check failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Get user by ID
 */
function getUserById($userId) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT id, name, email, created_at, last_login 
            FROM users 
            WHERE id = ? AND active = 1
        ");
        
        $stmt->execute([$userId]);
        
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("Get user failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Require user to be logged in
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: signin.php');
        exit;
    }
}

/**
 * Logout user
 */
function logout() {
    session_destroy();
    header('Location: signin.php');
    exit;
}
?>
