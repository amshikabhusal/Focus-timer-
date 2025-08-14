<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "focus_timer";

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$conn->query("CREATE DATABASE IF NOT EXISTS $dbname");
$conn->select_db($dbname);

$conn->query("CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_paid TINYINT(1) NOT NULL DEFAULT 0
)");

$conn->query("CREATE TABLE IF NOT EXISTS sessions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    work_minutes INT NOT NULL,
    break_minutes INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$result = $conn->query("SELECT COUNT(*) as count FROM users");
$row = $result->fetch_assoc();
if ($row['count'] == 0) {
    $conn->query("INSERT INTO users (username, password, is_paid) VALUES ('test','12345',0)");
}

if (!isset($_SESSION['user_id'])) $_SESSION['user_id'] = 1;
$user_id = $_SESSION['user_id'];

$query = $conn->prepare("SELECT is_paid FROM users WHERE id = ?");
$query->bind_param("i", $user_id);
$query->execute();
$result = $query->get_result()->fetch_assoc();
$is_paid = $result['is_paid'] ?? 0;

if (isset($_POST['upgrade'])) {
    $update = $conn->prepare("UPDATE users SET is_paid=1 WHERE id=?");
    $update->bind_param("i", $user_id);
    $update->execute();
    $is_paid = 1;
}

if (isset($_POST['complete_session']) && $is_paid) {
    $work = intval($_POST['work']);
    $break = intval($_POST['break']);
    $stmt = $conn->prepare("INSERT INTO sessions (user_id, work_minutes, break_minutes) VALUES (?, ?, ?)");
    $stmt->bind_param("iii", $user_id, $work, $break);
    $stmt->execute();
    exit('ok');
}

$history = [];
if ($is_paid) {
    $stmt = $conn->prepare("SELECT * FROM sessions WHERE user_id=? ORDER BY completed_at DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) $history[] = $row;
}

if (isset($_GET['theme'])) {
    $_SESSION['theme'] = ($_GET['theme'] === 'dark') ? 'dark' : 'light';
}
if (!isset($_SESSION['theme'])) $_SESSION['theme'] = 'light';
$theme = $_SESSION['theme'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Focus Timer Paid Features</title>
<style>
/* ---------- CSS VARIABLES FOR THEMES ---------- */
:root{
  --bg: #f4f6f8;
  --panel: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --primary: #2563eb;
  --primary-600:#1d4ed8;
  --ring: rgba(37, 99, 235, .35);
  --border:#e5e7eb;
  --success:#16a34a;
  --warn-bg:#fff7ed;
  --warn-text:#9a3412;
  --shadow: 0 10px 25px rgba(2,6,23,.08);
  --shadow-strong: 0 12px 30px rgba(2,6,23,.12);
  --table-stripe:#f9fafb;
}
body.dark{
  --bg:#0b0f1a;
  --panel:#0f172a;
  --text:#e5e7eb;
  --muted:#94a3b8;
  --primary:#60a5fa;
  --primary-600:#3b82f6;
  --ring: rgba(96,165,250,.35);
  --border:#1f2937;
  --success:#22c55e;
  --warn-bg:#1f2937;
  --warn-text:#fbbf24;
  --shadow: 0 10px 25px rgba(0,0,0,.35);
  --shadow-strong: 0 12px 30px rgba(0,0,0,.45);
  --table-stripe:#0b1220;
}

/* ---------- GLOBAL ---------- */
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji","Segoe UI Emoji";
  background: var(--bg);
  color: var(--text);
  transition: background .3s, color .3s;
}

/*  LAYOUT */
.wrapper{
  max-width: 980px;
  margin: 32px auto;
  padding: 0 16px;
}
.header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 20px;
}
.brand{
  display:flex;align-items:center;gap:10px;
}
.brand .logo{
  width:40px;height:40px;display:grid;place-items:center;border-radius:12px;
  background: linear-gradient(135deg, var(--primary), var(--success));
  color:#fff; font-weight:800; box-shadow: var(--shadow);
}
.brand h1{
  font-size: clamp(20px, 2.2vw, 28px);
  margin:0;
}
.theme-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 14px;border-radius:999px;text-decoration:none;
  background: var(--panel); border:1px solid var(--border);
  color: var(--text); box-shadow: var(--shadow);
  transition: transform .08s ease, background .2s, border-color .2s;
}
.theme-btn:hover{ transform: translateY(-1px); }
.theme-btn span.badge{
  font-size:12px; color: var(--muted);
}

/* CARD / PANEL  */
.card{
  background: var(--panel);
  border:1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 20px;
}

/*  TIMER SECTION  */
.timer{
  display:grid; gap:12px; justify-items:center;
}
.controls{
  display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:center;
}
.input{
  display:flex; align-items:center; gap:8px; background: transparent;
  border:1.5px solid var(--border); border-radius: 12px; padding:10px 12px; min-width: 120px;
}
.input input{
  width:80px; border:none; outline:none; background:transparent;
  color:var(--text); font-size:16px;
}
.select{
  border:1.5px solid var(--border); border-radius: 12px; padding:10px 12px;
  background: transparent; color: var(--text);
}
button, .btn{
  appearance:none; border:none; cursor:pointer; border-radius: 12px;
  padding: 12px 18px; font-weight:600;
  background: var(--primary); color:#fff; box-shadow: var(--shadow-strong);
  transition: transform .06s ease, box-shadow .2s, background .2s;
}
button:hover, .btn:hover{ transform: translateY(-1px); }
button:active, .btn:active{ transform: translateY(0); }
button:focus-visible, .btn:focus-visible, .input:focus-within, .select:focus{
  outline: 2px solid transparent; box-shadow: 0 0 0 4px var(--ring);
}
#countdown{
  font-variant-numeric: tabular-nums;
  font-size: clamp(20px, 3.5vw, 28px);
  font-weight: 800; letter-spacing: .5px;
  padding: 10px 14px; border-radius: 12px;
  background: linear-gradient(180deg, rgba(0,0,0,.03), rgba(0,0,0,.08));
  color: var(--text);
  width: fit-content; margin-top: 6px;
}

/* ---------- PREMIUM INFO ---------- */
.premium-info{
  background: var(--warn-bg);
  color: var(--warn-text);
  border:1px dashed var(--border);
  border-radius: 16px;
  padding: 16px 18px;
}
.premium-info h2{ margin:0 0 8px 0; }
.premium-info ul{ margin: 8px 0 0 18px; }

/* ---------- HISTORY ---------- */
.history{ margin-top: 18px; }
.table-wrap{
  overflow:auto; border:1px solid var(--border); border-radius: 14px;
  box-shadow: var(--shadow);
}
.history table{
  width:100%; border-collapse: collapse; min-width: 420px; background: var(--panel);
}
.history th, .history td{
  padding: 12px 10px; text-align:left; border-bottom:1px solid var(--border);
  font-size: 14px;
}
.history th{
  position:sticky; top:0; background: var(--panel);
  text-transform: uppercase; letter-spacing:.04em; font-size:12px; color: var(--muted);
}
.history tbody tr:nth-child(odd){ background: var(--table-stripe); }
.history .pill{
  display:inline-block; padding:4px 8px; border-radius: 999px;
  font-size:12px; background: rgba(22,163,74,.12); color: var(--success);
  border:1px solid rgba(22,163,74,.25);
}


.buy-btn{
  background: var(--success);
  box-shadow: var(--shadow-strong);
  padding: 12px 18px; border-radius: 12px; font-weight:700;
}

.section{ margin-top: 18px; }
.subtle{ color: var(--muted); font-size: 14px; }

@media (max-width:520px){
  .header{ flex-direction:column; gap:12px; align-items:flex-start; }
  .brand h1{ font-size: 22px; }
}
</style>
</head>
<body class="<?= $theme ?>">

<div class="wrapper">
  <div class="header">
    <div class="brand">
      <div class="logo">bee</div>
      <div>
        <h1>Bee</h1>
        <div class="subtle"><?= $is_paid ? 'Premium member' : 'Free plan' ?></div>
      </div>
    </div>

    <!-- Keep the original link behavior; just styled prettier -->
    <a href="?theme=<?= $theme=='light'?'dark':'light' ?>" class="theme-btn" title="Toggle theme">
      <?= $theme=='light'?'🌙 Dark mode':'☀️ Light mode' ?>
      <span class="badge">switch</span>
    </a>
  </div>

  <form method="POST" id="upgradeForm" class="card section">
    <?php if($is_paid): ?>
      <div class="timer">
        <div class="subtle">Set your timer</div>

        <div class="controls">
          <label class="input">
            <span>Work</span>
            <input type="number" id="workTime" placeholder="Work min" value="25" min="1" />
          </label>
          <label class="input">
            <span>Break</span>
            <input type="number" id="breakTime" placeholder="Break min" value="5" min="1" />
          </label>
          <select id="alertSound" class="select" aria-label="Alert sound">
            <option value="bell">Bell</option>
            <option value="beep">Beep</option>
            <option value="chime">Chime</option>
          </select>
          <button type="button" onclick="startTimer()">Start Focus</button>
        </div>

        <p id="countdown">00:00</p>
      </div>

      <div class="history section">
        <h3>Focus Session History</h3>
        <?php if(count($history)==0): ?>
          <p class="subtle">No sessions yet. Your completed sessions will appear here.</p>
        <?php else: ?>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Work</th>
                  <th>Break</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
              <?php foreach($history as $s): ?>
                <tr>
                  <td><span class="pill"><?= $s['work_minutes'] ?> min</span></td>
                  <td><span class="pill"><?= $s['break_minutes'] ?> min</span></td>
                  <td><?= $s['completed_at'] ?></td>
                </tr>
              <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </div>

      <div class="premium-info section">
        <h2>Premium Member</h2>
        <p>You are enjoying all features! Price: <strong>$5/month</strong></p>
        <ul>
          <li>Custom focus timer durations</li>
          <li>Session history tracking</li>
          <li>Custom alert sounds</li>
          <li>Dark/Light mode toggle</li>
        </ul>
      </div>

    <?php else: ?>
      <div class="premium-info">
        <h2>Upgrade to Premium</h2>
        <p>Unlock all premium features for <strong>$5/month</strong>:</p>
        <ul>
          <li>Custom focus timer (any duration)</li>
          <li>Focus session history tracking</li>
          <li>Custom alert sounds</li>
          <li>Dark/Light mode toggle</li>
        </ul>
        <button class="buy-btn" name="upgrade" type="submit">Upgrade Now</button>
      </div>
    <?php endif; ?>
  </form>
</div>

<script>
let timerInterval;
function startTimer() {
  clearInterval(timerInterval);
  const workMin = parseInt(document.getElementById('workTime').value);
  const breakMin = parseInt(document.getElementById('breakTime').value);
  if (isNaN(workMin) || isNaN(breakMin) || workMin <= 0 || breakMin <= 0){
    alert("Please enter valid minutes."); return;
  }
  let work = workMin * 60;
  let brk = breakMin * 60;
  let phase = "Work";
  let remaining = work;

  const countdownEl = document.getElementById('countdown');
  const sound = document.getElementById('alertSound').value;
  const audio = new Audio(sound + ".mp3");

  updateCountdown(countdownEl, remaining, phase);

  timerInterval = setInterval(() => {
    remaining--;
    if (remaining < 0) {
      if (phase === "Work") {
        audio.play();
        phase = "Break";
        remaining = brk;
        updateCountdown(countdownEl, remaining, phase);
      } else {
        clearInterval(timerInterval);
        countdownEl.textContent = "Session Complete!";
        audio.play();
        saveSession(workMin, breakMin);
      }
    } else {
      updateCountdown(countdownEl, remaining, phase);
    }
  }, 1000);
}

function updateCountdown(el, seconds, phase){
  el.textContent = formatTime(seconds) + " — " + phase;
}

function formatTime(seconds){
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function saveSession(work, brk){
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "", true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send("complete_session=1&work=" + encodeURIComponent(work) + "&break=" + encodeURIComponent(brk));
}
</script>

</body>
</html>
