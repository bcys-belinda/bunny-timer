(() => {
  const $ = (s) => document.querySelector(s);
  const card = $(".timer-card");
  const timeEl = $("#time");
  const statusEl = $("#status");
  const minutesInput = $("#minutes");
  const startBtn = $("#start");
  const pauseBtn = $("#pause");
  const resetBtn = $("#reset");
  const ring = $(".ring-progress");
  const bunny = $("#bunny");
  const carrotsEl = $("#carrots");

  const CIRC = 2 * Math.PI * 96;
  ring.style.strokeDasharray = CIRC;

  const state = {
    total: 25 * 60 * 1000,
    remaining: 25 * 60 * 1000,
    endAt: null,
    tick: null,
    done: Number(localStorage.getItem("bunnyCarrots") || 0)
  };

  const fmt = (ms) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = String(s % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${String(m).padStart(2, "0")}:${sec}`;
  };

  function render() {
    timeEl.textContent = fmt(state.remaining);
    const progress = 1 - state.remaining / state.total;
    ring.style.strokeDashoffset = CIRC * (1 - progress);
    document.title = state.endAt ? `${fmt(state.remaining)} · Bunny Focus` : "Bunny Focus Timer 🐰";
    carrotsEl.textContent = "🥕".repeat(Math.min(state.done, 12)) + (state.done > 12 ? ` ×${state.done}` : "");
  }

  function setMode(mode, msg) {
    card.classList.remove("running", "paused");
    if (mode) card.classList.add(mode);
    statusEl.textContent = msg;
    const running = mode === "running";
    startBtn.disabled = running;
    pauseBtn.disabled = !running;
    minutesInput.disabled = running;
    document.querySelectorAll("[data-step], .chip").forEach((b) => (b.disabled = running));
  }

  function setLength(min) {
    min = Math.min(180, Math.max(1, Math.round(Number(min) || 25)));
    minutesInput.value = min;
    state.total = state.remaining = min * 60 * 1000;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", Number(c.dataset.min) === min));
    setMode(null, "ready to hop in");
    render();
  }

  function start() {
    if (state.remaining <= 0) state.remaining = state.total;
    state.endAt = Date.now() + state.remaining;
    setMode("running", "hop hop, focusing…");
    state.tick = setInterval(() => {
      state.remaining = state.endAt - Date.now();
      if (state.remaining <= 0) return finish();
      render();
    }, 250);
    render();
  }

  function pause() {
    clearInterval(state.tick);
    state.remaining = state.endAt - Date.now();
    state.endAt = null;
    setMode("paused", "nibbling a snack — paused");
    render();
  }

  function reset() {
    clearInterval(state.tick);
    state.endAt = null;
    state.remaining = state.total;
    setMode(null, "ready to hop in");
    render();
  }

  function finish() {
    clearInterval(state.tick);
    state.endAt = null;
    state.remaining = 0;
    state.done++;
    localStorage.setItem("bunnyCarrots", state.done);
    setMode(null, "all done! have a carrot 🥕");
    render();
    const r = bunny.getBoundingClientRect();
    window.burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 24);
    chime();
  }

  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [660, 880, 990].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        o.type = "sine";
        g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.18 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.5);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.18);
        o.stop(ctx.currentTime + i * 0.18 + 0.55);
      });
    } catch (_) { /* audio unavailable */ }
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);
  minutesInput.addEventListener("change", () => setLength(minutesInput.value));
  document.querySelectorAll("[data-step]").forEach((b) =>
    b.addEventListener("click", () => setLength(Number(minutesInput.value) + Number(b.dataset.step)))
  );
  document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => setLength(c.dataset.min)));

  bunny.addEventListener("click", (e) => {
    bunny.classList.remove("boop");
    void bunny.offsetWidth;
    bunny.classList.add("boop");
    window.burstConfetti(e.clientX, e.clientY, 6);
  });
  bunny.addEventListener("animationend", (e) => {
    if (e.animationName === "boop") bunny.classList.remove("boop");
  });

  document.addEventListener("keydown", (e) => {
    if (e.target === minutesInput) return;
    if (e.code === "Space") { e.preventDefault(); state.endAt ? pause() : start(); }
    if (e.key === "r") reset();
  });

  // Meeting countdown
  const ev = window.NEXT_EVENT;
  if (ev && ev.start) {
    const startAt = new Date(ev.start);
    $("#eventCard").hidden = false;
    $("#eventTitle").textContent = ev.title;
    $("#eventTime").textContent = startAt.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
    const cd = $("#eventCountdown");
    const update = () => {
      const left = startAt - Date.now();
      cd.textContent = left > 0 ? `in ${fmt(left)}` : "happening now 🐇";
    };
    update();
    setInterval(update, 1000);
  }

  setLength(25);
})();
