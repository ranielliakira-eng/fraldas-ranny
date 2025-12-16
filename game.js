var clickTag = "https://www.google.com/maps/dir/?api=1&destination=Estrada+do+Jaguaré+1706+São+Paulo";

const baby = document.getElementById("baby");
const finalScreen = document.getElementById("finalScreen");
const cta = document.getElementById("cta");
const giggle = document.getElementById("giggle");
const handHint = document.getElementById("handHint");

let step = 0;
let dragged = null;
let offsetX = 0;
let offsetY = 0;

/* INICIAR DRAG */
document.querySelectorAll(".draggable").forEach(el => {
  el.addEventListener("mousedown", start);
  el.addEventListener("touchstart", start, { passive: false });
});

function start(e) {
  e.preventDefault();
  dragged = e.target;
  handHint.classList.add("hidden");

  const p = e.touches ? e.touches[0] : e;
  offsetX = p.clientX - dragged.offsetLeft;
  offsetY = p.clientY - dragged.offsetTop;

  document.addEventListener("mousemove", move);
  document.addEventListener("touchmove", move, { passive: false });
  document.addEventListener("mouseup", end);
  document.addEventListener("touchend", end);
}

/* MOVIMENTO */
function move(e) {
  if (!dragged) return;
  const p = e.touches ? e.touches[0] : e;

  dragged.style.left = (p.clientX - offsetX) + "px";
  dragged.style.top  = (p.clientY - offsetY) + "px";
}

/* FINAL DO DRAG */
function end() {
  if (!dragged) return;

  if (
    parseInt(dragged.dataset.step) === step &&
    checkCollision(dragged, baby)
  ) {
    dragged.classList.add("hidden");
    giggle.currentTime = 0;
    giggle.play();
    step++;

    if (step === 1) document.getElementById("diaperClean").classList.remove("hidden");
    if (step === 2) document.getElementById("bottle").classList.remove("hidden");
    if (step === 3) finalScreen.style.display = "flex";

    if (step < 3) handHint.classList.remove("hidden");
  }

  document.removeEventListener("mousemove", move);
  document.removeEventListener("touchmove", move);
  document.removeEventListener("mouseup", end);
  document.removeEventListener("touchend", end);

  dragged = null;
}

/* COLISÃO */
function checkCollision(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

/* CTA */
cta.addEventListener("click", () => {
  window.location.href = clickTag;
});
