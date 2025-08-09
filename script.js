const hourEl = document.getElementById('hour');
const minuteEl = document.getElementById('minute');
const ampmEl = document.getElementById('ampm');
const dateEl = document.getElementById('date');
const toggleFormat = document.getElementById('toggleFormat');

const alarmToggle = document.getElementById('alarmToggle');
const alarmHour = document.getElementById('alarmHour');
const alarmMinute = document.getElementById('alarmMinute');
const periodAM = document.getElementById('periodAM');
const periodPM = document.getElementById('periodPM');

const alarmDisplay = document.getElementById('alarmDisplay');
const alarmStatus = document.getElementById('alarmStatus');

const sarcasticMessage = document.getElementById('sarcasticMessage');
const alarmIcon = document.querySelector('.alarm-icon');

const testAlarmBtn = document.getElementById('testAlarmBtn');
const snoozeBtn = document.getElementById('snoozeBtn');

const alarmSound = document.getElementById('alarmSound');

// Prevent user from changing alarm volume
let lastVolume = alarmSound.volume;

alarmSound.addEventListener('volumechange', () => {
  if (alarmSound.volume < lastVolume) {
    // User decreased volume, increase it back
    alarmSound.volume = Math.min(lastVolume + 0.1, 1);
  } else if (alarmSound.volume > lastVolume) {
    // User increased volume, decrease it back
    alarmSound.volume = Math.max(lastVolume - 0.1, 0);
  }
  lastVolume = alarmSound.volume;
});


let is24Hour = false;
let alarmTime = null;
let prankAlarmTime = null;
let alarmTimeout = null;
let prankAlarmTimeout = null;
let isAlarmOn = false;
let isPrankOn = false;
let quoteInterval = null;

const sarcasticMessages = [
   "Wake up, you beautiful disaster ‼️",
  "The snooze button is judging you 😴",
  "Be a human wakeup 🔔"
];

function populateTimeSelectors() {
  for(let i=1; i<=12; i++){
    const option = document.createElement('option');
    option.value = i.toString().padStart(2,'0');
    option.textContent = i;
    alarmHour.appendChild(option);
  }
  for(let i=0; i<60; i++){
    const option = document.createElement('option');
    option.value = i.toString().padStart(2,'0');
    option.textContent = i.toString().padStart(2,'0');
    alarmMinute.appendChild(option);
  }
}
populateTimeSelectors();

function setPeriod(period) {
  if(period === 'AM'){
    periodAM.classList.add('active');
    periodAM.setAttribute('aria-pressed', 'true');
    periodPM.classList.remove('active');
    periodPM.setAttribute('aria-pressed', 'false');
  } else {
    periodPM.classList.add('active');
    periodPM.setAttribute('aria-pressed', 'true');
    periodAM.classList.remove('active');
    periodAM.setAttribute('aria-pressed', 'false');
  }
}
periodAM.addEventListener('click', () => setPeriod('AM'));
periodPM.addEventListener('click', () => setPeriod('PM'));

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();

  if(!is24Hour){
    ampmEl.style.display = 'block';
    const period = h >= 12 ? 'PM' : 'AM';
    ampmEl.textContent = period;
    h = h % 12;
    if(h === 0) h = 12;
  } else {
    ampmEl.style.display = 'none';
  }

  hourEl.textContent = h.toString().padStart(2,'0');
  minuteEl.textContent = m.toString().padStart(2,'0');
  dateEl.textContent = now.toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'});

}
setInterval(updateClock, 1000);

toggleFormat.addEventListener('change', () => {
  is24Hour = toggleFormat.checked;
  updateClock();
});

function getAlarmDate() {
  let h = parseInt(alarmHour.value, 10);
  const m = parseInt(alarmMinute.value, 10);
  const period = periodAM.classList.contains('active') ? 'AM' : 'PM';

  if(period === 'PM' && h !== 12) {
    h += 12;
  } else if(period === 'AM' && h === 12) {
    h = 0;
  }

  const now = new Date();
  let alarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

  if(alarm < now) {
    alarm.setDate(alarm.getDate() + 1);
  }
  return alarm;
}

function getPrankAlarmDate(mainAlarm) {
  // Get the hours and minutes from the main alarm
  let hours = mainAlarm.getHours();
  let minutes = mainAlarm.getMinutes();

  // Convert total time into minutes since midnight
  let totalMinutes = hours * 60 + minutes;

  // Calculate half of that time
  let halfMinutes = Math.floor(totalMinutes / 2);

  // Create the prank time as half of the main alarm time
  let prankTime = new Date(mainAlarm);
  prankTime.setHours(Math.floor(halfMinutes / 60), halfMinutes % 60, 0, 0);

  // If prank time has already passed today, set for the next day
  const now = new Date();
  if (prankTime < now) {
    prankTime.setDate(prankTime.getDate() + 1);
  }

  return prankTime;
}

function updateAlarmDisplay() {
  if(!alarmTime) {
    alarmDisplay.textContent = '--:--';
    alarmStatus.textContent = 'Alarm disabled';
    return;
  }

  let h = alarmTime.getHours();
  let m = alarmTime.getMinutes();
  let period = '';

  if(!is24Hour) {
    period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if(h === 0) h = 12;
  }

  alarmDisplay.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')} ${period}`;
  alarmStatus.textContent = isAlarmOn ? 'Alarm enabled' : 'Alarm disabled';
}

function clearAlarms() {
  if(alarmTimeout) {
    clearTimeout(alarmTimeout);
    alarmTimeout = null;
  }
  if(prankAlarmTimeout) {
    clearTimeout(prankAlarmTimeout);
    prankAlarmTimeout = null;
  }
  if(quoteInterval) {
    clearInterval(quoteInterval);
    quoteInterval = null;
  }
  sarcasticMessage.classList.remove('show');
  alarmIcon.classList.remove('show');
  alarmSound.loop = false;
  alarmSound.pause();
  alarmSound.currentTime = 0;
  isPrankOn = false;
}

const funnyQuotes = [
 "Keep the good job you are sleeping good 👏🏻",
  "You are crushing it 🔥",
  "You are at a record time 😄"
];

function spawnFunnyQuote() {
  const quote = document.createElement("div");
  quote.className = "funny-quote";
  quote.innerText = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
  
  quote.style.left = Math.random() * (window.innerWidth - 200) + "px";
  quote.style.top = Math.random() * (window.innerHeight - 100) + "px";

  document.body.appendChild(quote);

  setTimeout(() => {
    quote.remove();
  }, 4000);
}

function startQuoteSpam() {
  if (quoteInterval) return;
  quoteInterval = setInterval(() => {
    spawnFunnyQuote();
  }, 500);
}

function scheduleAlarms() {
  clearAlarms();

  if(!alarmTime) return;

  const now = new Date();
  const timeToAlarm = alarmTime - now;
  const timeToPrank = prankAlarmTime - now;

  if(timeToPrank > 0) {
    prankAlarmTimeout = setTimeout(triggerPrankAlarm, timeToPrank);
  }

  if(timeToAlarm > 0) {
    alarmTimeout = setTimeout(triggerMainAlarm, timeToAlarm);
  }
}

function triggerPrankAlarm() {
  isPrankOn = true;
  alarmSound.play();
  alarmSound.loop = true;
  startQuoteSpam();
  showSarcasticMessage();

  alarmIcon.classList.add('show');
  sarcasticMessage.classList.add('show');
}

function triggerMainAlarm() {
  isAlarmOn = false;
  alarmToggle.checked = false;
  alarmStatus.textContent = 'Alarm ringing!';
  alarmSound.play();
  alarmSound.loop = true;
  startQuoteSpam();
  sarcasticMessage.textContent = "Okay, okay! Time to get up!";
  sarcasticMessage.classList.add('show');
  alarmIcon.classList.add('show');
}

function showSarcasticMessage() {
  const msg = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
  sarcasticMessage.textContent = msg;
}


alarmToggle.addEventListener('change', () => {
  if(alarmToggle.checked){
    alarmTime = getAlarmDate();
    prankAlarmTime = getPrankAlarmDate(alarmTime);
    isAlarmOn = true;
    updateAlarmDisplay();
    scheduleAlarms();
  } else {
    isAlarmOn = false;
    alarmTime = null;
    prankAlarmTime = null;
    updateAlarmDisplay();
    clearAlarms();
  }
});

testAlarmBtn.addEventListener('click', () => {
  if(!isAlarmOn) {
    alarmToggle.checked = true;
    alarmTime = getAlarmDate();
    prankAlarmTime = getPrankAlarmDate(alarmTime);
    isAlarmOn = true;
    updateAlarmDisplay();
    scheduleAlarms();
  }
  triggerPrankAlarm();
});

snoozeBtn.addEventListener('click', () => {
  if(!isAlarmOn) return;
  clearAlarms();
  if(alarmTime){
    alarmTime = new Date(Date.now() + 5 * 60000);
    prankAlarmTime = getPrankAlarmDate(alarmTime);
    updateAlarmDisplay();
    scheduleAlarms();
    sarcasticMessage.textContent = "Snoozed for 5 minutes... Good luck!";
    sarcasticMessage.classList.add('show');
    alarmIcon.classList.remove('show');
    alarmSound.pause();
    alarmSound.currentTime = 0;
  }
});

updateAlarmDisplay();
updateClock();