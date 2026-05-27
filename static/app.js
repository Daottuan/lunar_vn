function updateClock(){

const now = new Date()

const h = String(
now.getHours()
).padStart(2,'0')

const m = String(
now.getMinutes()
).padStart(2,'0')

const s = String(
now.getSeconds()
).padStart(2,'0')

document.getElementById(
'clock'
).innerText =
`${h}:${m}:${s}`
}

updateClock()

setInterval(updateClock,1000)

const lunarDay = Number(document.body.dataset.lunarDay);

const moon = document.getElementById("moon");
const moonText = document.getElementById("moon-text");

function updateMoon(day) {

  let shadow = 0;
  let text = "";

  if (day === 15) {
    shadow = 60;
    text = "Trăng tròn";
  } else if (day === 1 || day === 30) {
    shadow = 0;
    text = "Trăng non";
  } else if (day < 15) {
    shadow = day * 5;
    text = "Trăng đang tròn";
  } else {
    shadow = (30 - day) * 5;
    text = "Trăng đang khuyết";
  }

  moon.style.setProperty("--shadow-pos", `${80 - shadow}px`);
  moonText.textContent = text;
}

updateMoon(lunarDay);