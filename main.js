// Pixelate Background Effect on Scroll
class PixelateBackground {
    constructor() {
        this.container = document.querySelector('.pixelate-bg');
        this.canvas = this.container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.img = this.container.querySelector('img');
        this.hasSetup = false;
        this.srcCandidates = [
            './panamabeach.jpg',
            '../dp/panamabeach.jpg',
            '/panamabeach.jpg'
        ];

        this.maxPixelSize = 50;
        this.minPixelSize = 1;
        this.scrollRange = 2500;

        this.init();
    }

    init() {
        const tryNext = () => {
            if (this.hasSetup) return;
            const next = this.srcCandidates.shift();
            if (!next) {
                console.error('Failed to load any background image candidate.');
                return;
            }
            this.img.src = next;
        };

        this.img.onload = () => {
            if (this.hasSetup) return;
            this.hasSetup = true;
            this.setup();
        };

        this.img.onerror = () => {
            tryNext();
        };

        tryNext();
    }

    setup() {
        this.resize();
        this.updatePixelation();

        window.addEventListener('scroll', () => this.updatePixelation());
        window.addEventListener('resize', () => {
            this.resize();
            this.updatePixelation();
        });
    }

    resize() {
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
        this.computeScrollRange();
    }

    computeScrollRange() {
        const totalScrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        this.scrollRange = Math.max(2500, totalScrollable * 0.75);
    }

    updatePixelation() {
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / this.scrollRange, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const pixelSize = Math.max(
            this.minPixelSize,
            this.maxPixelSize - (this.maxPixelSize - this.minPixelSize) * eased
        );

        const overlay = document.querySelector('.bg-overlay');
        if (overlay) {
            overlay.style.opacity = 1 + (eased * 0.15);
        }

        this.drawPixelated(pixelSize);
    }

    drawPixelated(pixelSize) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);

        const imgRatio = this.img.naturalWidth / this.img.naturalHeight;
        const canvasRatio = w / h;
        let srcX = 0, srcY = 0, srcW = this.img.naturalWidth, srcH = this.img.naturalHeight;

        if (imgRatio > canvasRatio) {
            srcW = this.img.naturalHeight * canvasRatio;
            srcX = (this.img.naturalWidth - srcW) * 0.60;
        } else {
            srcH = this.img.naturalWidth / canvasRatio;
            srcY = (this.img.naturalHeight - srcH) * 0.79;
        }

        const scaledW = Math.ceil(w / pixelSize);
        const scaledH = Math.ceil(h / pixelSize);
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.drawImage(
            this.img,
            srcX, srcY, srcW, srcH,
            0, 0, scaledW, scaledH
        );
        this.ctx.drawImage(
            this.canvas,
            0, 0, scaledW, scaledH,
            0, 0, w, h
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelateBackground();
});

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.section-layout').forEach((el, i) => {
    el.setAttribute('data-scroll-animate', '');
    el.style.transitionDelay = `${i * 0.06}s`;
    scrollObserver.observe(el);
});

const topNav = document.querySelector('.top-nav');
if (topNav) {
    window.addEventListener('scroll', () => {
        topNav.classList.toggle('scrolled', window.scrollY > 50);
    });
}

const randomSites = [
    'https://www.approachwithalacrity.com/101-things-for-my-past-self/',
    'https://dearoldlove.tumblr.com/',
    'https://ajkprojects.com/stopactinglikeyourefamous',
    'https://www.archivebuttons.com/',
    'https://www.playphrase.me/#/search?q=would+just+like+to+say+thank+you&language=en',
    'https://www.myretrotvs.com/',
    'https://mmm.page/explore',
    'https://www.window-swap.com/Window',
    'https://scoreascore.com/homesick/',
    'https://virtocean.com/index.html',
    'https://physicsofbeauty.art/',
    'https://domenicobrz.github.io/webgl/',
    'https://johnnywebber.com/random-internet/',
    'https://blog.samaltman.com/idea-generation',
    'https://web.archive.org/web/20180611082710/http://indianexpress.com/article/sports/cricket/patrick-patterson-an-unquiet-mind-4762590/',
    'https://www.webworm.co/heart/',
    'https://www.theguardian.com/world/2016/may/07/discovered-our-parents-were-russian-spies-tim-alex-foley',
    'https://www.espncricinfo.com/story/rr-v-kxip-ipl-2020-rahul-tewatia-and-the-romance-of-the-struggle-1233680',
    'https://www.thecricketmonthly.com/story/1397584/the-burdens-of-being-rohit-sharma',
    'https://cooldudezone.substack.com/p/what-makes-a-story-worth-telling',
    'https://bakadesuyo.com/2015/03/key-to-happiness/',
    'https://pudding.cool/2023/09/invisible-epidemic/',
    'https://waitbutwhy.com/2015/12/the-tail-end.html',
    'https://blog.samaltman.com/what-i-wish-someone-had-told-me',
    'https://blog.samaltman.com/how-to-be-successful',
    'https://www.myinstants.com/en/index/us/',
    'https://paperme.pixzens.com/en',
    'https://www.ippractice.ca/patent-and-trademark-statistics/expiring-patents/',
    'https://www.galactanet.com/writing.html'
];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let fabState = 'idle';

function setFabState(state) {
    fabState = state;
    const fab = document.getElementById('circular-reveal');
    if (!fab) return;
    fab.dataset.state = state;
    fab.setAttribute('aria-pressed', state !== 'idle' ? 'true' : 'false');
}

function playRocketAnimation(onComplete) {
    const overlay = document.getElementById('rocket-overlay');
    const canvas = document.getElementById('rocket-canvas');
    if (!overlay || !canvas) { onComplete(); return; }
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const W = window.innerWidth;
    const H = window.innerHeight;

    overlay.classList.add('active');

    const OUTLINE = '#1a1a2e';
    const GROUND_Y = H * 0.82;

    function drawTint(alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    function drawGround() {
        ctx.save();
        ctx.fillStyle = 'rgba(20, 50, 20, 0.7)';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        for (let x = 0; x <= W; x += 40) {
            ctx.lineTo(x, GROUND_Y - Math.sin(x * 0.03) * 8 - Math.cos(x * 0.07) * 4);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#2d5a2d';
        ctx.lineWidth = 2;
        for (let i = 0; i < W; i += 25) {
            const gy = GROUND_Y - Math.sin(i * 0.03) * 8;
            ctx.beginPath();
            ctx.moveTo(i, gy);
            ctx.quadraticCurveTo(i - 4, gy - 12, i - 2, gy - 18);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i, gy);
            ctx.quadraticCurveTo(i + 5, gy - 14, i + 3, gy - 20);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawBottleRocket(bx, by, fuseGlow) {
        ctx.save();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 3;
        ctx.fillStyle = '#2d8a4e';
        ctx.beginPath();
        ctx.moveTo(bx - 14, by);
        ctx.lineTo(bx - 16, by - 30);
        ctx.quadraticCurveTo(bx - 16, by - 42, bx - 8, by - 44);
        ctx.lineTo(bx - 6, by - 60);
        ctx.lineTo(bx + 6, by - 60);
        ctx.lineTo(bx + 8, by - 44);
        ctx.quadraticCurveTo(bx + 16, by - 42, bx + 16, by - 30);
        ctx.lineTo(bx + 14, by);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(bx - 10, by - 38, 4, 20);

        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 2;
        ctx.fillRect(bx - 3, by - 115, 6, 60);
        ctx.strokeRect(bx - 3, by - 115, 6, 60);

        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(bx, by - 135);
        ctx.lineTo(bx - 10, by - 115);
        ctx.lineTo(bx + 10, by - 115);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#e63946';
        ctx.fillRect(bx - 8, by - 115, 16, 24);
        ctx.strokeRect(bx - 8, by - 115, 16, 24);

        ctx.fillStyle = '#ffd60a';
        ctx.fillRect(bx - 9, by - 97, 18, 5);
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx - 9, by - 97, 18, 5);

        ctx.strokeStyle = fuseGlow > 0 ? '#ff6f00' : '#555';
        ctx.lineWidth = fuseGlow > 0 ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(bx, by - 91);
        ctx.quadraticCurveTo(bx + 10, by - 82, bx + 8, by - 74);
        ctx.stroke();

        if (fuseGlow > 0) {
            ctx.save();
            ctx.fillStyle = '#ffd60a';
            ctx.shadowColor = '#ff9800';
            ctx.shadowBlur = 15 + fuseGlow * 8;
            ctx.beginPath();
            ctx.arc(bx + 8, by - 74, 4 + fuseGlow * 2, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 6; i++) {
                const a = Math.random() * Math.PI * 2;
                const d = 8 + Math.random() * 12;
                ctx.fillStyle = ['#ff6f00','#ffd60a','#ff4d6d','#ffb703'][i % 4];
                ctx.beginPath();
                ctx.arc(bx + 8 + Math.cos(a)*d, by - 74 + Math.sin(a)*d, 1.5 + Math.random()*2, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    function drawKid(kx, ky, frame, armAngle) {
        ctx.save();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 3;
        const legBob = Math.sin(frame * 0.3) * 3;
        const bodyBob = Math.abs(Math.sin(frame * 0.3)) * 2;

        ctx.fillStyle = '#4a6fa5';
        ctx.beginPath();
        ctx.moveTo(kx - 6, ky - 28 + bodyBob);
        ctx.lineTo(kx - 10 + legBob, ky);
        ctx.lineTo(kx - 4 + legBob, ky);
        ctx.lineTo(kx - 2, ky - 28 + bodyBob);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(kx + 2, ky - 28 + bodyBob);
        ctx.lineTo(kx + 4 - legBob, ky);
        ctx.lineTo(kx + 10 - legBob, ky);
        ctx.lineTo(kx + 6, ky - 28 + bodyBob);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.ellipse(kx - 7 + legBob, ky + 2, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(kx + 7 - legBob, ky + 2, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#f77f00';
        ctx.beginPath();
        ctx.moveTo(kx - 14, ky - 28 + bodyBob);
        ctx.lineTo(kx - 12, ky - 56 + bodyBob);
        ctx.quadraticCurveTo(kx, ky - 62 + bodyBob, kx + 12, ky - 56 + bodyBob);
        ctx.lineTo(kx + 14, ky - 28 + bodyBob);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#e5a56e';
        ctx.beginPath();
        ctx.moveTo(kx - 13, ky - 50 + bodyBob);
        ctx.lineTo(kx - 24, ky - 36 + bodyBob);
        ctx.stroke();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(kx - 13, ky - 50 + bodyBob);
        ctx.lineTo(kx - 24, ky - 36 + bodyBob);
        ctx.stroke();

        ctx.strokeStyle = '#e5a56e';
        ctx.lineWidth = 5;
        const armEndX = kx + 13 + Math.cos(armAngle) * 22;
        const armEndY = ky - 50 + bodyBob + Math.sin(armAngle) * 22;
        ctx.beginPath();
        ctx.moveTo(kx + 13, ky - 50 + bodyBob);
        ctx.lineTo(armEndX, armEndY);
        ctx.stroke();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(kx + 13, ky - 50 + bodyBob);
        ctx.lineTo(armEndX, armEndY);
        ctx.stroke();

        if (armAngle < 0) {
            ctx.save();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(armEndX, armEndY);
            ctx.lineTo(armEndX + 14, armEndY - 8);
            ctx.stroke();
            ctx.fillStyle = '#e63946';
            ctx.beginPath();
            ctx.arc(armEndX + 16, armEndY - 9, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffd60a';
            ctx.shadowColor = '#ff9800';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(armEndX + 16, armEndY - 18);
            ctx.quadraticCurveTo(armEndX + 20, armEndY - 12, armEndX + 16, armEndY - 10);
            ctx.quadraticCurveTo(armEndX + 12, armEndY - 12, armEndX + 16, armEndY - 18);
            ctx.fill();
            ctx.restore();
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = OUTLINE;
        ctx.fillStyle = '#e5a56e';
        ctx.beginPath();
        ctx.arc(kx, ky - 70 + bodyBob, 16, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(kx - 16, ky - 74 + bodyBob);
        ctx.lineTo(kx - 12, ky - 90 + bodyBob);
        ctx.lineTo(kx - 6, ky - 78 + bodyBob);
        ctx.lineTo(kx, ky - 92 + bodyBob);
        ctx.lineTo(kx + 6, ky - 78 + bodyBob);
        ctx.lineTo(kx + 12, ky - 88 + bodyBob);
        ctx.lineTo(kx + 16, ky - 74 + bodyBob);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(kx - 6, ky - 72 + bodyBob, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(kx + 6, ky - 72 + bodyBob, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(kx - 4, ky - 71 + bodyBob, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(kx + 8, ky - 71 + bodyBob, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(kx - 5, ky - 73 + bodyBob, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(kx + 7, ky - 73 + bodyBob, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(kx, ky - 66 + bodyBob, 7, 0.1, Math.PI - 0.1);
        ctx.stroke();
        ctx.restore();
    }

    function drawFlyingRocket(rx, ry, trail) {
        ctx.save();
        for (let i = trail.length - 1; i >= 0; i--) {
            const t = trail[i];
            const alpha = (i / trail.length) * 0.6;
            ctx.fillStyle = `rgba(255, 140, 0, ${alpha})`;
            ctx.shadowColor = '#ff6f00';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(t.x + (Math.random()-0.5)*8, t.y, 6 + (trail.length - i) * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(t.x + (Math.random()-0.5)*6, t.y + 4, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 3;
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(rx, ry - 30);
        ctx.lineTo(rx - 12, ry - 10);
        ctx.lineTo(rx + 12, ry - 10);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.fillRect(rx - 10, ry - 10, 20, 30);
        ctx.strokeRect(rx - 10, ry - 10, 20, 30);
        ctx.fillStyle = '#ffd60a';
        ctx.fillRect(rx - 11, ry + 10, 22, 6);
        ctx.strokeRect(rx - 11, ry + 10, 22, 6);
        ctx.fillStyle = '#264653';
        ctx.beginPath();
        ctx.moveTo(rx - 10, ry + 16);
        ctx.lineTo(rx - 20, ry + 28);
        ctx.lineTo(rx - 10, ry + 20);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx + 10, ry + 16);
        ctx.lineTo(rx + 20, ry + 28);
        ctx.lineTo(rx + 10, ry + 20);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ffd60a';
        ctx.shadowColor = '#ff9800';
        ctx.shadowBlur = 20;
        const flicker = Math.random() * 8;
        ctx.beginPath();
        ctx.moveTo(rx - 8, ry + 20);
        ctx.quadraticCurveTo(rx - 4, ry + 38 + flicker, rx, ry + 44 + flicker);
        ctx.quadraticCurveTo(rx + 4, ry + 38 + flicker, rx + 8, ry + 20);
        ctx.fill();
        ctx.fillStyle = '#ff6f00';
        ctx.beginPath();
        ctx.moveTo(rx - 5, ry + 20);
        ctx.quadraticCurveTo(rx - 2, ry + 32 + flicker, rx, ry + 36 + flicker);
        ctx.quadraticCurveTo(rx + 2, ry + 32 + flicker, rx + 5, ry + 20);
        ctx.fill();
        ctx.restore();
    }

    function drawEpicBurst(cx, cy, progress, particles, burstFrame) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (progress < 0.25) {
            const glowAlpha = (1 - progress / 0.25);
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
            grad.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`);
            grad.addColorStop(0.2, `rgba(255, 220, 150, ${glowAlpha * 0.6})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, 180, 0, Math.PI * 2);
            ctx.fill();
        }

        const dt = 1/60;

        particles.forEach((p) => {
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.history.push({x: p.x, y: p.y});
            if (p.history.length > 5) p.history.shift();

            let alpha = Math.max(0, 1 - Math.pow(progress, 2.5));
            if (p.flicker && burstFrame % 4 < 2) alpha *= 0.4;
            if (alpha <= 0) return;

            if (p.history.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.history[0].x, p.history[0].y);
                for (let j = 1; j < p.history.length; j++) {
                    ctx.lineTo(p.history[j].x, p.history[j].y);
                }
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = alpha * 0.8;
                ctx.lineWidth = p.size;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = alpha;
            ctx.fill();
        });

        ctx.restore();
    }

    function drawFlash(progress) {
        ctx.save();
        ctx.globalAlpha = progress;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    const bottleX = W * 0.55;
    const bottleY = GROUND_Y;
    const kidStartX = bottleX - 80;
    const kidTargetX = bottleX - 40;
    const epicColors = ['#ffdf00', '#ff8c00', '#ff0055', '#e600ff', '#00ffd5', '#ffffff'];
    const explosionParticles = [];
    for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() > 0.85 ? (Math.random() * 2000 + 800) : (Math.random() * 800 + 300);
        explosionParticles.push({
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 2.5 + 2,
            color: epicColors[Math.floor(Math.random() * epicColors.length)],
            friction: 0.95 + Math.random() * 0.03,
            gravity: 150 + Math.random() * 100,
            flicker: Math.random() > 0.5,
            history: [],
            x: 0,
            y: 0
        });
    }

    let phase = 'walk';
    let frame = 0;
    let kidX = kidStartX;
    let rocketY = bottleY - 100;
    let rocketTrail = [];
    let fuseTimer = 0;
    let launchTimer = 0;
    let explodeTimer = 0;
    let flashTimer = 0;
    let burstFrame = 0;
    let armAngle = 0.4;

    let bgFireworks = [];
    const dt = 1/60;

    function spawnBgFirework(isHeavy = false) {
        const particles = [];
        const color = epicColors[Math.floor(Math.random() * epicColors.length)];
        const particleCount = isHeavy ? 40 : 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (isHeavy ? 400 : 200) + 100;
            particles.push({
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 1.5 + 1.0,
                color: Math.random() > 0.5 ? color : '#ffffff',
                friction: 0.92,
                gravity: 100,
                x: 0,
                y: 0
            });
        }
        bgFireworks.push({
            x: Math.random() * W,
            y: H,
            vy: -(Math.random() * 10 + 15),
            explodeHeight: H * 0.05 + Math.random() * (H * 0.6),
            state: 'flying',
            timer: 0,
            particles: particles,
            trail: []
        });
    }

    function processBgFireworks() {
        ctx.save();
        for (let i = bgFireworks.length - 1; i >= 0; i--) {
            let fw = bgFireworks[i];
            if (fw.state === 'flying') {
                fw.y += fw.vy;
                fw.trail.push({x: fw.x, y: fw.y});
                if (fw.trail.length > 5) fw.trail.shift();

                if (fw.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(fw.trail[0].x, fw.trail[0].y);
                    for (let j = 1; j < fw.trail.length; j++) {
                        ctx.lineTo(fw.trail[j].x, fw.trail[j].y);
                    }
                    ctx.strokeStyle = '#ffa000';
                    ctx.globalAlpha = 0.5;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                if (fw.y <= fw.explodeHeight) {
                    fw.state = 'explode';
                    fw.particles.forEach(p => { p.x = fw.x; p.y = fw.y; });
                }
            } else if (fw.state === 'explode') {
                fw.timer += dt;
                let progress = fw.timer / 0.8;
                if (progress >= 1) {
                    bgFireworks.splice(i, 1);
                    continue;
                }

                ctx.globalCompositeOperation = 'lighter';
                fw.particles.forEach(p => {
                    p.vx *= p.friction;
                    p.vy *= p.friction;
                    p.vy += p.gravity * dt;
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;

                    let alpha = Math.max(0, 1 - Math.pow(progress, 1.5));
                    if (alpha > 0) {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = alpha;
                        ctx.fill();
                    }
                });
                ctx.globalCompositeOperation = 'source-over';
            }
        }
        ctx.restore();
    }

    function tick() {
        frame++;
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (phase === 'walk' && Math.random() < 0.03) spawnBgFirework();
        if (phase === 'light' && Math.random() < 0.08) spawnBgFirework();
        if (phase === 'fuse' && Math.random() < 0.15) spawnBgFirework();
        if (phase === 'launch' && Math.random() < 0.3) spawnBgFirework(Math.random() > 0.5);
        if (phase === 'explode' && Math.random() < 0.35) spawnBgFirework(true);
        if (phase === 'flash' && Math.random() < 0.2) spawnBgFirework();

        if (phase === 'walk') {
            drawTint(0.55);
            drawGround();
            processBgFireworks();
            drawBottleRocket(bottleX, bottleY, 0);
            kidX += 6;
            if (kidX >= kidTargetX) {
                kidX = kidTargetX;
                phase = 'light';
                frame = 0;
            }
            drawKid(kidX, GROUND_Y, frame, 0.4);
        }
        else if (phase === 'light') {
            drawTint(0.55);
            drawGround();
            processBgFireworks();
            drawBottleRocket(bottleX, bottleY, 0);
            armAngle = 0.4 - (Math.min(frame, 15) / 15) * 1.0;
            drawKid(kidX, GROUND_Y, 0, armAngle);
            if (frame > 18) {
                phase = 'fuse';
                frame = 0;
                fuseTimer = 0;
            }
        }
        else if (phase === 'fuse') {
            drawTint(0.55);
            drawGround();
            processBgFireworks();
            fuseTimer += 1/60;
            const glow = 0.5 + Math.sin(fuseTimer * 18) * 0.5;
            drawBottleRocket(bottleX, bottleY, glow);
            drawKid(kidX - fuseTimer * 70, GROUND_Y, frame, 0.4);
            if (fuseTimer > 0.6) {
                phase = 'launch';
                rocketY = bottleY - 100;
                launchTimer = 0;
            }
        }
        else if (phase === 'launch') {
            drawTint(0.55);
            drawGround();
            processBgFireworks();
            ctx.save();
            ctx.strokeStyle = OUTLINE;
            ctx.lineWidth = 3;
            ctx.fillStyle = '#2d8a4e';
            ctx.beginPath();
            ctx.moveTo(bottleX - 14, bottleY);
            ctx.lineTo(bottleX - 16, bottleY - 30);
            ctx.quadraticCurveTo(bottleX - 16, bottleY - 42, bottleX - 8, bottleY - 44);
            ctx.lineTo(bottleX - 6, bottleY - 60);
            ctx.lineTo(bottleX + 6, bottleY - 60);
            ctx.lineTo(bottleX + 8, bottleY - 44);
            ctx.quadraticCurveTo(bottleX + 16, bottleY - 42, bottleX + 16, bottleY - 30);
            ctx.lineTo(bottleX + 14, bottleY);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.restore();

            const kidBack = kidX - 60;
            drawKid(kidBack, GROUND_Y, 0, 0.4);

            launchTimer += 1/60;
            const accel = 1 + launchTimer * 8;
            rocketY -= accel * 6;
            rocketTrail.push({ x: bottleX + (Math.random()-0.5)*3, y: rocketY + 25 });
            if (rocketTrail.length > 25) rocketTrail.shift();
            drawFlyingRocket(bottleX, rocketY, rocketTrail);

            if (rocketY < H * 0.4) {
                phase = 'explode';
                explodeTimer = 0;
                burstFrame = 0;
                explosionParticles.forEach(p => {
                    p.x = bottleX;
                    p.y = rocketY;
                    p.history = [];
                });
            }
        }
        else if (phase === 'explode') {
            drawTint(0.3 + explodeTimer * 0.4);
            processBgFireworks();
            explodeTimer += 1/60;
            burstFrame++;
            const progress = Math.min(explodeTimer / 1.3, 1);
            drawEpicBurst(bottleX, rocketY, progress, explosionParticles, burstFrame);
            if (explodeTimer > 1.1) {
                phase = 'flash';
                flashTimer = 0;
            }
        }
        else if (phase === 'flash') {
            processBgFireworks();
            flashTimer += 1/60;
            burstFrame++;
            const progress = Math.min(flashTimer / 0.4, 1);
            drawEpicBurst(bottleX, rocketY, 1, explosionParticles, burstFrame);
            drawFlash(progress);
            if (flashTimer > 0.5) {
                overlay.classList.remove('active');
                onComplete();
                return;
            }
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

function triggerRandomSite() {
    if (fabState !== 'idle' || !randomSites.length) return;
    const url = randomSites[Math.floor(Math.random() * randomSites.length)];

    if (prefersReducedMotion) {
        setFabState('idle');
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
    }

    setFabState('fusing');
    playRocketAnimation(() => {
        setFabState('idle');
        window.open(url, '_blank', 'noopener,noreferrer');
    });
}

(function initFab() {
    const fab = document.getElementById('circular-reveal');
    if (!fab) return;
    fab.addEventListener('click', () => triggerRandomSite());
    fab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerRandomSite();
        }
    });
})();
