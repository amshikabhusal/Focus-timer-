<?php
session_start();

if (isset($_GET['theme'])) {
    $_SESSION['theme'] = ($_GET['theme'] === 'dark') ? 'dark' : 'light';
}

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
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
            transition: background 0.3s, color 0.3s;
        }
        body.light { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); color: #333; }
        body.dark { background: #121212; color: #f1f1f1; }

        header {
            position: fixed; top:0; left:0; right:0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px 40px; z-index:1000;
            transition: all 0.3s ease;
        }
        body.dark header { background: rgba(18, 18, 18, 0.95); }

        nav { display:flex; justify-content:space-between; align-items:center; max-width:1200px; margin:0 auto; }
        .logo { font-weight:700; font-size:24px; color:inherit; }
        .nav-links { display:flex; list-style:none; gap:40px; }
        .nav-links a { text-decoration:none; color:inherit; font-weight:500; transition: color 0.3s ease; }

        .hero {
            min-height:100vh; display:flex; flex-direction:column;
            justify-content:center; align-items:center; text-align:center;
            padding:120px 40px 80px;
        }
        .profile-image {
            width:120px; height:120px; border-radius:50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display:flex; align-items:center; justify-content:center;
            margin-bottom:40px; animation: float 3s ease-in-out infinite;
        }
        @keyframes float { 0%,100% {transform:translateY(0);} 50% {transform:translateY(-10px);} }
        .hero h1 { font-size: clamp(2.5rem,5vw,4rem); font-weight:700; margin-bottom:30px; line-height:1.2; }
        .hero-subtitle { font-size:1.2rem; max-width:600px; margin-bottom:40px; opacity:0.8; }

        .cta-button {
            background:#000; color:#fff; padding:16px 32px;
            border:none; border-radius:50px; font-size:1rem; font-weight:600;
            cursor:pointer; transition: all 0.3s ease; text-decoration:none; display:inline-block;
        }
        body.dark .cta-button { background:#fff; color:#000; }
        .cta-button:hover { transform:translateY(-2px); box-shadow:0 10px 25px rgba(0,0,0,0.2); }
    </style>
</head>
<body class="<?php echo $theme; ?>">

<header id="header">
    <nav>
        <div class="logo">
            <a href="index.html">
                <img src="bee.png" alt="Bee Logo" style="height:50px;">
            </a>Bee 
        </div>
        <ul class="nav-links">
            <?php if ($theme === 'light'): ?>
                <li><a href="?theme=dark">🌙 Dark Mode</a></li>
            <?php else: ?>
                <li><a href="?theme=light">☀️ Light Mode</a></li>
            <?php endif; ?>
            <li><a href="featurres1.html">Features</a></li>
            <li><a href="focus-timer/paidfac.php">Paid-features</a></li>
            <li><a href="aboutus.html">About us</a></li>
        </ul>
    </nav>
</header>


<section class="hero" id="home">
    <div class="profile-image"></div>
    <h1>Focused work<br>Mindful breaks<br>Better results.</h1>
    <p class="hero-subtitle">Maintain your focus and get things done by working with bee</p>
    <a href="signin.php" class="cta-button">Start buzzin</a>
</section>

<script>
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    header.style.boxShadow = (window.scrollY > 100) ? '0 2px 20px rgba(0,0,0,0.1)' : 'none';
});
</script>
</body>
</html>
