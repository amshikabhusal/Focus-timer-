<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pomodoro & To-Do</title>
<style>
    body {
        margin: 0;
        font-family: Arial, sans-serif;
    }
    /* Navbar Styling */
    nav {
        background-color: #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
    }
    nav ul {
        list-style: none;
        display: flex;
        margin: 0;
        padding: 0;
    }
    nav ul li {
        margin: 0 15px;
    }
    nav ul li a {
        color: white;
        text-decoration: none;
        font-weight: bold;
    }
    nav ul li a:hover {
        text-decoration: underline;
    }
    /* Example Page Sections */
    section {
        padding: 20px;
    }
</style>
</head>
<body>

<!-- Navigation Bar -->
<nav>
    <ul>
        <li><a href="#pomodoro">Pomodoro Timer</a></li>
        <li><a href="#todo">To-Do List</a></li>
        <li><a href="#moodboard">Moodboard</a></li>
    </ul>
</nav>

<!-- Sections -->
<section id="pomodoro">
    <h1>Pomodoro Timer</h1>
    <p>Your pomodoro timer will go here.</p>
</section>

<section id="todo">
    <h1>To-Do List</h1>
    <p>Your to-do list will go here.</p>
</section>

<section id="moodboard">
    <h1>Moodboard</h1>
    <p>Your moodboard will go here.</p>
</section>

</body>
</html>
