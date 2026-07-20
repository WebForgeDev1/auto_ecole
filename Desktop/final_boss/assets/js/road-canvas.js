(function () {
  var canvas = document.getElementById('roadCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w, h, vanishY;
  var lamps = [];

  function resize() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vanishY = h * 0.38;
    if (lamps.length === 0) {
      for (var i = 0; i < 16; i++) {
        lamps.push({ seed: Math.random(), side: i % 2 === 0 ? -1 : 1 });
      }
    }
  }

  function easeIn(p) { return p * p; }

  function drawRoad(t) {
    ctx.clearRect(0, 0, w, h);
    var vanishX = w * 0.5;

    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0f0d09');
    g.addColorStop(0.42, '#17140f');
    g.addColorStop(1, '#1e1a12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    var roadHalfWidthBottom = w * 0.62;
    ctx.beginPath();
    ctx.moveTo(vanishX - roadHalfWidthBottom, h);
    ctx.lineTo(vanishX, vanishY);
    ctx.lineTo(vanishX, vanishY);
    ctx.lineTo(vanishX + roadHalfWidthBottom, h);
    ctx.closePath();
    var rg = ctx.createLinearGradient(0, vanishY, 0, h);
    rg.addColorStop(0, 'rgba(30,26,18,0.0)');
    rg.addColorStop(1, 'rgba(10,9,6,0.55)');
    ctx.fillStyle = rg;
    ctx.fill();

    var dashCount = 9;
    for (var i = 0; i < dashCount; i++) {
      var p0 = (i / dashCount + (reduced ? 0 : t * 0.05)) % 1;
      var p1 = p0 + 0.045;
      if (p1 > 1) continue;
      var y0 = vanishY + (h - vanishY) * easeIn(p0);
      var y1 = vanishY + (h - vanishY) * easeIn(p1);
      ctx.globalAlpha = 0.15 + 0.55 * easeIn(p0);
      ctx.strokeStyle = 'rgba(226,150,58,0.55)';
      ctx.beginPath();
      ctx.moveTo(vanishX, y0);
      ctx.lineTo(vanishX, y1);
      ctx.lineWidth = 1 + 4 * easeIn(p0);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (var j = 0; j < lamps.length; j++) {
      var lamp = lamps[j];
      var p = (lamp.seed + (reduced ? 0 : t * 0.035)) % 1;
      var depth = easeIn(p);
      var ly = vanishY + (h - vanishY) * depth;
      var spread = w * 0.05 + w * 0.5 * depth;
      var lx = vanishX + lamp.side * spread;
      var radius = 6 + 70 * depth;
      var alpha = 0.06 + 0.5 * depth;
      var glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
      glow.addColorStop(0, 'rgba(240,171,83,' + alpha + ')');
      glow.addColorStop(1, 'rgba(240,171,83,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, ly, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    var hg = ctx.createRadialGradient(vanishX, vanishY, 0, vanishX, vanishY, w * 0.35);
    hg.addColorStop(0, 'rgba(226,150,58,0.20)');
    hg.addColorStop(1, 'rgba(226,150,58,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(vanishX, vanishY, w * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  window.addEventListener('resize', resize);
  resize();

  if (reduced) {
    drawRoad(0);
  } else {
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = (ts - start) / 1000;
      drawRoad(t);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
