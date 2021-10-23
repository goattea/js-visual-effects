/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("effect-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = {
	x: canvas.width / 2,
	y: canvas.height / 2,
};

class Particle {
	constructor() {
		this.radius = Math.random() * 20 + 5;
		this.x = mouse.x;
		this.y = mouse.y;
		this.color = 220;

		this.opacity = 1;
		this.fadeRate = 0.01; //Math.random() * 0.1;
		this.isVisible = true;

		this.vx = this.#getRandomDirectionVelocity();
		this.vy = this.#getRandomDirectionVelocity();
	}

	#getRandomDirectionVelocity() {
		return (Math.random() * 5 + 1) * (Math.random() < 0.5 ? 1 : -1);
	}

	update() {
		if (this.x >= canvas.width - this.radius || this.x <= this.radius) {
			this.vx *= -1;
		}
		if (this.y >= canvas.height - this.radius || this.y <= this.radius) {
			this.vy *= -1;
		}

		this.x += this.vx;
		this.y += this.vy;

		this.opacity -= this.fadeRate;
		this.isVisible = this.opacity > 0;
	}

	draw() {
		ctx.save();
		ctx.fillStyle = `hsla(${this.color}, 100%, 50%, ${this.opacity})`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.restore();
	}
}

let particles = [];

// resize canvas on resize event
addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	particles = [];
});

addEventListener("mousedown", (e) => {
	mouse.x = e.x;
	mouse.y = e.y;
});

function animateLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	particles.push(new Particle());
	particles.forEach((p) => {
		p.update();
		p.draw();
	});
	particles = particles.filter((p) => p.isVisible);
	window.requestAnimationFrame(animateLoop);
}

window.requestAnimationFrame(animateLoop);
