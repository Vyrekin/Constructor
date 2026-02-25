/**
 * Lightweight background: soft floating orbs. No lines, no blur, low count — smooth 60fps.
 */
(function () {
    var canvas = document.getElementById('bg-particles');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var orbs = [];
    var startTime = Date.now();

    var CONFIG = {
        count: 18,
        radiusMin: 80,
        radiusMax: 220,
        speed: 0.0012,
        colorLight: { r: 67, g: 97, b: 238, a: 0.14 },
        colorLight2: { r: 76, g: 201, b: 240, a: 0.1 },
        colorDark: { r: 99, g: 102, b: 241, a: 0.12 },
        colorDark2: { r: 56, g: 189, b: 248, a: 0.08 }
    };

    function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = window.innerWidth;
        var h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        initOrbs(w, h);
    }

    function initOrbs(w, h) {
        orbs = [];
        for (var i = 0; i < CONFIG.count; i++) {
            orbs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                radius: CONFIG.radiusMin + Math.random() * (CONFIG.radiusMax - CONFIG.radiusMin),
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                ampX: 0.08 * w + Math.random() * 0.06 * w,
                ampY: 0.06 * h + Math.random() * 0.05 * h,
                tint: Math.random()
            });
        }
    }

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function drawOrb(x, y, radius, theme) {
        var c1 = theme === 'dark' ? CONFIG.colorDark : CONFIG.colorLight;
        var c2 = theme === 'dark' ? CONFIG.colorDark2 : CONFIG.colorLight2;
        var g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(' + c1.r + ',' + c1.g + ',' + c1.b + ',' + (c1.a * 0.9) + ')');
        g.addColorStop(0.4, 'rgba(' + c1.r + ',' + c1.g + ',' + c1.b + ',' + (c1.a * 0.4) + ')');
        g.addColorStop(0.7, 'rgba(' + c2.r + ',' + c2.g + ',' + c2.b + ',' + (c2.a * 0.2) + ')');
        g.addColorStop(1, 'rgba(' + c2.r + ',' + c2.g + ',' + c2.b + ', 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function tick() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var theme = getTheme();
        var t = (Date.now() - startTime) * CONFIG.speed;

        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < orbs.length; i++) {
            var o = orbs[i];
            var x = (w * 0.5) + (o.x - w * 0.5) + Math.sin(t + o.phaseX) * o.ampX + Math.cos(t * 0.7 + o.phaseY) * (o.ampX * 0.5);
            var y = (h * 0.5) + (o.y - h * 0.5) + Math.cos(t * 0.8 + o.phaseY) * o.ampY + Math.sin(t * 0.6 + o.phaseX) * (o.ampY * 0.5);
            drawOrb(x, y, o.radius, theme);
        }

        requestAnimationFrame(tick);
    }

    window.addEventListener('resize', function () { resize(); });
    resize();
    tick();
})();
