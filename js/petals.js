(() => {
  const layer = document.querySelector(".petals");
  const shapes = ["🌸", "✿", "🍃", "❀"];

  function spawnPetal() {
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    p.style.left = Math.random() * 100 + "vw";
    p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
    p.style.animationDuration = 8 + Math.random() * 6 + "s";
    layer.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
  }

  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(spawnPetal, 1400);
  }

  window.burstConfetti = (x, y, count = 14) => {
    const bits = ["🥕", "💗", "🌷", "✨"];
    for (let i = 0; i < count; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.textContent = bits[i % bits.length];
      c.style.left = x + "px";
      c.style.top = y + "px";
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      c.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      c.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      document.body.appendChild(c);
      c.addEventListener("animationend", () => c.remove());
    }
  };
})();
