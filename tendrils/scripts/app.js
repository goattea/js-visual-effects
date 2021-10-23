/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("effect-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const CURVE_X = 0;
const CURVE_Y = 1;
const CURVE_BOTH = 2;

const COMPOSITE_MODES = [
	"source-over",
	//"source-in",
	//"source-out",
	//"source-atop",
	"destination-over",
	//"destination-in",
	//"destination-out",
	//"destination-atop",
	"lighter",
	//"copy",
	"xor",
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"color-dodge",
	"color-burn",
	"hard-light",
	"soft-light",
	"difference",
	"exclusion",
	"hue",
	"saturation",
	"color",
	"luminosity",
];
let currentCompositeMode = 0;
const DISPLAY_MODE = document.getElementById("current-composite-op");
DISPLAY_MODE.innerText = COMPOSITE_MODES[currentCompositeMode];

let currentColor = 220;

class Segment {
	constructor(x, y, radius, angle, color, curveDirection) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.angle = angle;
		this.color = color;
		this.curveDirection = curveDirection;
	}

	draw() {
		ctx.fillStyle = this.color;
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.stroke();
	}
}

class Tendril {
	#segments = [];

	constructor() {
		this.radius = 50;
		this.x = canvas.width / 2 - this.radius / 2;
		this.y = canvas.height / 2 - this.radius / 2 + 100;

		this.opacity = 0.6;
		this.vx = this.#getRandomDirectionVelocity();
		this.vy = this.#getRandomDirectionVelocity();

		this.curveIntensity = Math.random() * 2 + 1;
		this.angleIncrement = Math.max(Math.random() * 0.2, 0.1);
		this.#createSegments();
	}

	#getRandomDirectionVelocity() {
		return Math.random() * 3 * (Math.random() < 0.5 ? 1 : -1);
	}

	#getCurves(angle, curveDirection) {
		let xCurve =
			curveDirection === CURVE_X || curveDirection === CURVE_BOTH
				? Math.sin(angle) * this.curveIntensity
				: 0;
		let yCurve =
			curveDirection === CURVE_Y || curveDirection === CURVE_BOTH
				? Math.cos(angle) * this.curveIntensity
				: 0;
		return { xCurve, yCurve };
	}

	#createSegments() {
		let angle = 0;

		let curveDirection = Math.floor(Math.random() * 3);
		for (let r = this.radius; r >= 0; r -= 0.5) {
			angle += this.angleIncrement;
			let { xCurve, yCurve } = this.#getCurves(angle, curveDirection);

			this.#segments.push(
				new Segment(
					this.x + xCurve,
					this.y + yCurve,
					r,
					angle,
					`hsla(${currentColor}, ${(r / this.radius) * 100}%, 50%, 1)`,
					curveDirection
				)
			);

			this.x += this.vx;
			this.y += this.vy;
		}
	}

	update() {
		let wiggleScaleIncrement = 100 / this.#segments.length / 100;
		let wiggleScale = 0;

		this.#segments.forEach((s) => {
			s.color = `hsla(${currentColor}, ${
				(s.radius / this.radius) * 100
			}%, 50%, 1)`;
			s.angle += this.angleIncrement;
			let { xCurve, yCurve } = this.#getCurves(s.angle, s.curveDirection);
			s.x += xCurve * wiggleScale;
			s.y += yCurve * wiggleScale;
			wiggleScale += wiggleScaleIncrement;
		});
	}

	draw() {
		ctx.save();
		ctx.globalCompositeOperation = COMPOSITE_MODES[currentCompositeMode];
		ctx.globalAlpha = this.opacity;
		this.#segments.forEach((s) => s.draw());
		ctx.restore();
	}
}

let tendrils = [];

function generateTendrils() {
	let number = Math.floor(Math.random() * 15 + 5);
	tendrils = [];
	for (let i = 1; i <= number; i++) {
		tendrils.push(new Tendril());
	}
}

// resize canvas on resize event
addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	generateTendrils();
});

addEventListener("mousedown", (e) => {
	generateTendrils();
});

addEventListener("keydown", (e) => {
	switch (e.key) {
		case "ArrowRight":
			if (currentCompositeMode === COMPOSITE_MODES.length - 1) {
				currentCompositeMode = 0;
			} else {
				currentCompositeMode++;
			}
			break;
		case "ArrowLeft":
			if (currentCompositeMode === 0) {
				currentCompositeMode = COMPOSITE_MODES.length - 1;
			} else {
				currentCompositeMode--;
			}
			break;

		case "r":
		case "R":
			currentCompositeMode = 0;
			break;

		case "ArrowUp":
			currentColor += 20;
			if (currentColor >= 360) currentColor = 0;
			break;
		case "ArrowDown":
			currentColor -= 20;
			if (currentColor < 0) currentColor = 360;
			break;
	}

	console.log(e.key, COMPOSITE_MODES[currentCompositeMode]);
	DISPLAY_MODE.innerText = COMPOSITE_MODES[currentCompositeMode];
});

function animateLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	tendrils.forEach((p) => {
		p.update();
		p.draw();
	});
	window.requestAnimationFrame(animateLoop);
}

generateTendrils();

window.requestAnimationFrame(animateLoop);
