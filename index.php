<?php
session_start();

// Handle session logging
if ($_POST['action'] ?? '' === 'log_session') {
    $sessions = $_SESSION['focus_sessions'] ?? 0;
    $_SESSION['focus_sessions'] = $sessions + 1;
    echo json_encode(['total_sessions' => $_SESSION['focus_sessions']]);
    exit;
}

// Get current session count
$total_sessions = $_SESSION['focus_sessions'] ?? 0;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FocusTimer+ | Anti-Distraction Study Timer</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
            position: relative;
            overflow: hidden;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .header {
            margin-bottom: 2rem;
        }

        .logo {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #666;
            font-size: 1rem;
            font-weight: 400;
        }

        .timer-display {
            font-size: 4rem;
            font-weight: 300;
            color: #333;
            margin: 2rem 0;
            font-variant-numeric: tabular-nums;
            letter-spacing: -0.02em;
        }

        .timer-label {
            font-size: 1.2rem;
            color: #667eea;
            font-weight: 500;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .controls {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin: 2rem 0;
        }

        .btn {
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: #f8f9fa;
            color: #666;
            border: 2px solid #e9ecef;
        }

        .btn-secondary:hover {
            background: #e9ecef;
            transform: translateY(-2px);
        }

        .progress-ring {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 1rem auto;
        }

        .progress-ring svg {
            transform: rotate(-90deg);
            width: 100%;
            height: 100%;
        }

        .progress-ring-circle {
            fill: none;
            stroke: #e9ecef;
            stroke-width: 8;
        }

        .progress-ring-progress {
            fill: none;
            stroke: #667eea;
            stroke-width: 8;
            stroke-linecap: round;
            transition: stroke-dashoffset 1s ease;
        }

        .break-content {
            display: none;
            background: #f8f9fa;
            border-radius: 16px;
            padding: 2rem;
            margin: 2rem 0;
            border-left: 4px solid #28a745;
        }

        .break-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        .quote {
            font-size: 1.1rem;
            font-style: italic;
            color: #495057;
            margin-bottom: 1rem;
            line-height: 1.6;
        }

        .quote-author {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 500;
        }

        .stats {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1rem;
            margin-top: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-size: 1.5rem;
            font-weight: 600;
            color: #667eea;
        }

        .stat-label {
            font-size: 0.8rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .timer-display.pulse {
            animation: pulse 1s ease-in-out infinite;
        }

        @media (max-width: 600px) {
            .container {
                padding: 2rem 1.5rem;
            }
            
            .timer-display {
                font-size: 3rem;
            }
            
            .controls {
                flex-direction: column;
                align-items: center;
            }
            
            .btn {
                width: 100%;
                max-width: 200px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FocusTimer+</div>
            <div class="subtitle">Anti-Distraction Study Timer</div>
        </div>

        <div class="timer-label" id="timerLabel">Focus Session</div>
        
        <div class="progress-ring">
            <svg>
                <circle class="progress-ring-circle" cx="100" cy="100" r="90"></circle>
                <circle class="progress-ring-progress" cx="100" cy="100" r="90" id="progressCircle"></circle>
            </svg>
            <div class="timer-display" id="timerDisplay">25:00</div>
        </div>

        <div class="controls">
            <button class="btn btn-primary" id="startBtn" onclick="toggleTimer()">Start</button>
            <button class="btn btn-secondary" id="resetBtn" onclick="resetTimer()">Reset</button>
        </div>

        <div class="break-content" id="breakContent">
            <div class="quote" id="quoteText"></div>
            <div class="quote-author" id="quoteAuthor"></div>
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-number" id="sessionsCount"><?php echo $total_sessions; ?></div>
                <div class="stat-label">Sessions</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="todayTime">0h</div>
                <div class="stat-label">Today</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="streakCount">0</div>
                <div class="stat-label">Streak</div>
            </div>
        </div>
    </div>

    <script>
        class FocusTimer {
            constructor() {
                this.focusTime = 25 * 60; // 25 minutes in seconds
                this.breakTime = 5 * 60;  // 5 minutes in seconds
                this.currentTime = this.focusTime;
                this.isRunning = false;
                this.isBreak = false;
                this.interval = null;
                this.totalSessions = <?php echo $total_sessions; ?>;
                this.todayMinutes = parseInt(localStorage.getItem('todayMinutes') || '0');
                this.streak = parseInt(localStorage.getItem('streak') || '0');
                
                this.initializeProgress();
                this.updateStats();
                this.loadQuotes();
            }

            initializeProgress() {
                const circle = document.getElementById('progressCircle');
                const radius = 90;
                const circumference = 2 * Math.PI * radius;
                
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference;
            }

            updateProgress() {
                const circle = document.getElementById('progressCircle');
                const radius = 90;
                const circumference = 2 * Math.PI * radius;
                const totalTime = this.isBreak ? this.breakTime : this.focusTime;
                const progress = (totalTime - this.currentTime) / totalTime;
                const offset = circumference - (progress * circumference);
                
                circle.style.strokeDashoffset = offset;
                circle.style.stroke = this.isBreak ? '#28a745' : '#667eea';
            }

            formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }

            updateDisplay() {
                document.getElementById('timerDisplay').textContent = this.formatTime(this.currentTime);
                this.updateProgress();
            }

            toggleTimer() {
                const startBtn = document.getElementById('startBtn');
                const timerDisplay = document.getElementById('timerDisplay');
                
                if (this.isRunning) {
                    this.pause();
                    startBtn.textContent = 'Start';
                    timerDisplay.classList.remove('pulse');
                } else {
                    this.start();
                    startBtn.textContent = 'Pause';
                    timerDisplay.classList.add('pulse');
                }
            }

            start() {
                this.isRunning = true;
                this.interval = setInterval(() => {
                    this.currentTime--;
                    this.updateDisplay();
                    
                    if (this.currentTime <= 0) {
                        this.complete();
                    }
                }, 1000);
            }

            pause() {
                this.isRunning = false;
                clearInterval(this.interval);
            }

            reset() {
                this.pause();
                this.currentTime = this.isBreak ? this.breakTime : this.focusTime;
                this.updateDisplay();
                document.getElementById('startBtn').textContent = 'Start';
                document.getElementById('timerDisplay').classList.remove('pulse');
                
                if (this.isBreak) {
                    this.switchToFocus();
                }
            }

            complete() {
                this.pause();
                document.getElementById('startBtn').textContent = 'Start';
                document.getElementById('timerDisplay').classList.remove('pulse');
                
                if (this.isBreak) {
                    this.switchToFocus();
                } else {
                    this.switchToBreak();
                    this.logSession();
                }
                
                // Play completion sound (if browser supports it)
                this.playNotificationSound();
            }

            switchToBreak() {
                this.isBreak = true;
                this.currentTime = this.breakTime;
                document.getElementById('timerLabel').textContent = 'Break Time';
                document.getElementById('breakContent').classList.add('active');
                this.showRandomQuote();
                this.updateDisplay();
            }

            switchToFocus() {
                this.isBreak = false;
                this.currentTime = this.focusTime;
                document.getElementById('timerLabel').textContent = 'Focus Session';
                document.getElementById('breakContent').classList.remove('active');
                this.updateDisplay();
            }

            async logSession() {
                try {
                    const response = await fetch('', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'action=log_session'
                    });
                    
                    const data = await response.json();
                    this.totalSessions = data.total_sessions;
                    this.todayMinutes += 25;
                    this.streak++;
                    
                    localStorage.setItem('todayMinutes', this.todayMinutes.toString());
                    localStorage.setItem('streak', this.streak.toString());
                    
                    this.updateStats();
                } catch (error) {
                    console.error('Error logging session:', error);
                }
            }

            updateStats() {
                document.getElementById('sessionsCount').textContent = this.totalSessions;
                document.getElementById('todayTime').textContent = Math.floor(this.todayMinutes / 60) + 'h';
                document.getElementById('streakCount').textContent = this.streak;
            }

            loadQuotes() {
                this.quotes = [
                    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
                    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
                    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
                    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
                    { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
                    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
                    { text: "Study while others are sleeping; work while others are loafing.", author: "William A. Ward" },
                    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
                    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
                    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" }
                ];
            }

            showRandomQuote() {
                const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
                document.getElementById('quoteText').textContent = `"${randomQuote.text}"`;
                document.getElementById('quoteAuthor').textContent = `— ${randomQuote.author}`;
            }

            playNotificationSound() {
                // Create a simple beep sound using Web Audio API
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                } catch (error) {
                    console.log('Audio notification not supported');
                }
            }
        }

        // Initialize the timer
        const timer = new FocusTimer();

        // Global functions for button clicks
        function toggleTimer() {
            timer.toggleTimer();
        }

        function resetTimer() {
            timer.reset();
        }

        // Reset daily stats at midnight
        function checkNewDay() {
            const lastDate = localStorage.getItem('lastDate');
            const today = new Date().toDateString();
            
            if (lastDate !== today) {
                localStorage.setItem('todayMinutes', '0');
                localStorage.setItem('lastDate', today);
                timer.todayMinutes = 0;
                timer.updateStats();
            }
        }

        // Check for new day on load
        checkNewDay();

        // Update display initially
        timer.updateDisplay();
    </script>
</body>
</html>
