<?php
session_start();

// Toggle theme if requested
if (isset($_GET['theme'])) {
    $_SESSION['theme'] = ($_GET['theme'] === 'dark') ? 'dark' : 'light';
}

// Default theme is light
if (!isset($_SESSION['theme'])) {
    $_SESSION['theme'] = 'light';
}

$theme = $_SESSION['theme'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Agency</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            transition: all 0.3s ease;
        }

        /* Light Mode */
        body.light {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            color: #333;
        }
        body.light header {
            background: rgba(255, 255, 255, 0.95);
        }
        body.light .logo, body.light h1, body.light a {
            color: #000;
        }
        body.light .cta-button {
            background: #000;
            color: white;
        }

        /* Dark Mode */
        body.dark {
            background: #121212;
            color: #e0e0e0;
        }
        body.dark header {
            background: rgba(20, 20, 20, 0.95);
        }
        body.dark .logo, body.dark h1, body.dark a {
            color: white;
        }
        body.dark .cta-button {
            background: white;
            color: black;
        }

        header {
            position: fixed;
            top: 0; left: 0; right: 0;
            backdrop-filter: blur(10px);
            padding: 20px 40px;
            z-index: 1000;
            transition: all 0.3s ease;
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        .logo {
            font-weight: 700;
            font-size: 24px;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 40px;
        }

        .nav-links a {
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 120px 40px 80px;
        }

        .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin-bottom: 40px;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 700;
            margin-bottom: 30px;
            line-height: 1.2;
        }

        .hero-subtitle {
            font-size: 1.2rem;
            max-width: 600px;
            margin-bottom: 40px;
        }

        .cta-button {
            padding: 16px 32px;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

    </style>
</head>
<body class="<?php echo $theme; ?>">
    <!-- Header -->
    <header id="header">
        <nav>
            <div class="logo">Bee</div>
            <ul class="nav-links">
                <?php if ($theme === 'light'): ?>
                    <li><a href="?theme=dark">🌙 Dark</a></li>
                <?php else: ?>
                    <li><a href="?theme=light">☀️ Light</a></li>
                <?php endif; ?>
                <li><a href="features1.html">Features</a></li>
                <li><a href="aboutus.html">About us</a></li>
                <li><a href="history.html">History</a></li>
            </ul>
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="profile-image"></div>
        <h1>Focused work<br>Mindful breaks<br>Better results.</h1>
        <p class="hero-subtitle">Maintain your focus and get things done by working with bee</p>
        <a href="signin.php" class="cta-button">Start Buzzin</a>
    </section>
</body>
</html>
