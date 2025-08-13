<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

$error = '';
$success = '';

if ($_POST) {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Please fill in all fields.';
    } else {
        $user = authenticateUser($email, $password);
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['name'];
            header('Location: focus.html');
            exit;
        } else {
            $error = 'Invalid email or password.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - Bee</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/auth.css">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo">Bee</div>
                <h1>Welcome Back</h1>
                <p>Sign in to continue your productivity journey</p>
            </div>
            
            <?php if ($error): ?>
                <div class="alert error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>
            
            <form class="auth-form" method="POST" action="">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required 
                           value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                           placeholder="Enter your email">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required 
                           placeholder="Enter your password">
                </div>
                
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" name="remember">
                        <span class="checkmark"></span>
                        Remember me
                    </label>
                    <a href="forgot-password.php" class="forgot-link">Forgot password?</a>
                </div>
                
                <button type="submit" class="auth-button primary">Sign In</button>
            </form>
            
            <div class="auth-footer">
                <p>Don't have an account? <a href="signup.php">Sign up here</a></p>
                <div class="divider">
                    <span>or</span>
                </div>
                <a href="focus.html" class="auth-button secondary">Continue as Guest</a>
            </div>
        </div>
        
        <div class="auth-visual">
            <div class="visual-content">
                <h2>Boost Your Productivity</h2>
                <p>Join thousands of users who have transformed their work habits with Bee</p>
                <div class="feature-highlights">
                    <div class="highlight">
                        <span class="icon">⏱️</span>
                        <span>Pomodoro Timer</span>
                    </div>
                    <div class="highlight">
                        <span class="icon">📝</span>
                        <span>Task Management</span>
                    </div>
                    <div class="highlight">
                        <span class="icon">😊</span>
                        <span>Mood Tracking</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="js/auth.js"></script>
</body>
</html>
