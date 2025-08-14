<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

$error = '';
$success = '';

if ($_POST) {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    // Validation
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password)) {
        $error = 'Please fill in all fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } elseif (userExists($email)) {
        $error = 'An account with this email already exists.';
    } else {
        $user_id = createUser($name, $email, $password);
        if ($user_id) {
            $_SESSION['user_id'] = $user_id;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_name'] = $name;
            header('Location: signin.php');
            exit;
        } else {
            $error = 'Failed to create account. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - Bee</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/auth.css">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo">Bee</div>
                <h1>Create Account</h1>
                <p>Start your productivity journey today</p>
            </div>
            
            <?php if ($error): ?>
                <div class="alert error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <form class="auth-form" method="POST" action="">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" required 
                           value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>"
                           placeholder="Enter your full name">
                </div>
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required 
                           value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                           placeholder="Enter your email">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required 
                           placeholder="Create a password (min. 6 characters)">
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required 
                           placeholder="Confirm your password">
                </div>
                
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" name="terms" required>
                        <span class="checkmark"></span>
                        I agree to the <a href="terms.html">Terms of Service</a>
                    </label>
                </div>
                
                <button type="submit" class="auth-button primary">Create Account</button>
            </form>
            
            <div class="auth-footer">
                <p>Already have an account? <a href="signin.php">Sign in here</a></p>
                <div class="divider">
                    <span>or</span>
                </div>
                <a href="focus.html" class="auth-button secondary">Continue as Guest</a>
            </div>
        </div>
        
        <div class="auth-visual">
            <div class="visual-content">
                <h2>Join the Community</h2>
                <p>Thousands of users have already improved their productivity with Bee</p>
                <div class="stats-grid">
                    <div class="stat">
                        <div class="stat-number">10K+</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">1M+</div>
                        <div class="stat-label">Focus Sessions</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">95%</div>
                        <div class="stat-label">Satisfaction Rate</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="js/auth.js"></script>
</body>
</html>
