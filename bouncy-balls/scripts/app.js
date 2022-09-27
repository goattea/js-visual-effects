/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("effect-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const BASE_RADIUS = 20;
const BALL_COUNT = 10;

class Ball {
	constructor() {
		this.radius = BASE_RADIUS;
		this.gradientStartOffset = this.radius * 0.3;
		this.x = Math.random() * (canvas.width - BASE_RADIUS);
		this.y = Math.random() * (canvas.height - BASE_RADIUS);

		this.color = Math.floor(Math.random() * 360);

		this.randomizeDirection();

		this.collisionHandled = false;
	}

	randomizeDirection() {
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
	}

	draw() {
		ctx.save();

		let rg = ctx.createRadialGradient(
			this.x - this.gradientStartOffset,
			this.y - this.gradientStartOffset,
			3,
			this.x,
			this.y,
			this.radius
		);

		rg.addColorStop(0, "white");
		rg.addColorStop(1, `hsl(${this.color}, 100%, 50%)`);
		ctx.fillStyle = rg;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.restore();
	}
}

let balls = [];

function generateBalls() {
	balls = [];
	for (let i = 0; i < BALL_COUNT; i++) {
		balls.push(new Ball());
	}
}

// resize canvas on resize event
addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	generateBalls();
});

addEventListener("mousedown", (e) => {
	mouse.x = e.x;
	mouse.y = e.y;
});

function collisionHandler() {
	balls.forEach((ball) => (ball.collisionHandled = false));
	for (let a = 0; a < balls.length; a++) {
		if (balls[a].collisionHandled) continue;
		for (let b = 0; b < balls.length; b++) {
			if (balls[a] === balls[b]) continue;
			if (balls[b].collisionHandled) continue;
			let xDistance = balls[a].x + balls[a].vx - (balls[b].x + balls[b].vx);
			let yDistance = balls[a].y + balls[a].vy - (balls[b].y + balls[b].vy);
			let distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
			if (distance <= BASE_RADIUS * 2) {
				balls[a].collisionHandled = true;
				balls[a].randomizeDirection();
				balls[b].collisionHandled = true;
				balls[a].randomizeDirection();
			}
		}
	}
}

function animateLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	balls.forEach((p) => {
		p.update();
		p.draw();
	});
	collisionHandler();
	window.requestAnimationFrame(animateLoop);
}

generateBalls();
window.requestAnimationFrame(animateLoop);
