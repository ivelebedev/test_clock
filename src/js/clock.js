export default class Clock {
	
	constructor(canvas, width, height, offset) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.canvas.height = height;
		this.canvas.width  = width;

		this.center = [this.canvas.width / 2, this.canvas.height / 2];
		
		this.offset = offset;
	}
	
	drawAngle() {
		let ctx = this.ctx;
		let center = this.center;
		let offset = this.offset;
		
		ctx.strokeStyle = "#505363";
		ctx.beginPath();
		
		ctx.moveTo(center[0], offset);
		ctx.lineTo(center[0], center[1]);
		ctx.moveTo(offset, canvas.height - offset);
		ctx.lineTo(center[0], center[1]);
		ctx.moveTo(canvas.width - offset, canvas.height - offset);
		ctx.lineTo(center[0], center[1]);

		ctx.stroke();
	}
	
	drawRound(x, y, step) {
		let ctx = this.ctx;
		
		ctx.strokeStyle = this.getColour("#ed265d", "#b326ed", 0, 60, step);
		ctx.beginPath();
		ctx.arc(x, y, 8, 0, Math.PI*2, true);
		ctx.fillStyle = this.getColour("#ed265d", "#b326ed", 0, 60, step);
		ctx.fill();
		ctx.stroke();
	}

	drawTriangle(points) {
		let ctx = this.ctx;
		ctx.strokeStyle = "#505363";
		ctx.beginPath();
		
		ctx.moveTo(points[0].x, points[0].y);
		ctx.lineTo(points[1].x, points[1].y);
		ctx.lineTo(points[2].x, points[2].y);
		ctx.lineTo(points[0].x, points[0].y);
		
		ctx.closePath();
		ctx.fillStyle = "rgba(152, 158, 185, 0.1)";
		ctx.fill();
		
		let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

		gradient.addColorStop(0, '#ed265d');
		gradient.addColorStop(1, '#b326ed');

		ctx.strokeStyle = gradient;
		ctx.stroke();
	}

	getHourStep(step) {
		let canvas = this.canvas;
		let center = this.center;
		const y = (canvas.height - this.offset - center[1]) / 24
		return y * step;
	}
	
	getMinuteStep(step) {
		let canvas = this.canvas;
		let center = this.center;
		const x = (canvas.width - this.offset - center[0]) / 60;
		const y = (canvas.height  - this.offset - center[1]) / 60;
		return [x * step, y * step];
	}
	
	getSecondsStep(step) {
		let canvas = this.canvas;
		let center = this.center;
		const x = (center[0] - this.offset) / 60;
		const y = (canvas.height - this.offset - center[1]) / 60;
		return [x * step, y * step];
	}

	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	map(value, fromSource, toSource, fromTarget, toTarget) {
		return (value - fromSource) / (toSource - fromSource) * (toTarget - fromTarget) + fromTarget;
	}

	getColour(startColour, endColour, min, max, value) {
		const startRGB = this.hexToRgb(startColour);
		const endRGB = this.hexToRgb(endColour);
		const percentFade = this.map(value, min, max, 0, 1);

		let diffRed = endRGB.r - startRGB.r;
		let diffGreen = endRGB.g - startRGB.g;
		let diffBlue = endRGB.b - startRGB.b;

		diffRed = (diffRed * percentFade) + startRGB.r;
		diffGreen = (diffGreen * percentFade) + startRGB.g;
		diffBlue = (diffBlue * percentFade) + startRGB.b;

		const result = "rgb(" + Math.round(diffRed) + ", " + Math.round(diffGreen) + ", " + Math.round(diffBlue) + ")";
		return result;
	}
	
	render(hours, minutes, seconds) {
		let canvas = this.canvas;
		let ctx = this.ctx;
		let center = this.center;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		this.drawAngle();
		this.drawTriangle([{ "x": center[0], "y" : center[1] - this.getHourStep(hours)}, { "x": center[0] + this.getSecondsStep(seconds)[0], "y" : center[1] + this.getSecondsStep(seconds)[1]}, { "x": center[0] - this.getMinuteStep(minutes)[0], "y" : center[1] + this.getMinuteStep(minutes)[1]}]);
		this.drawRound(center[0], center[1] - this.getHourStep(hours), hours);
		this.drawRound(center[0] + this.getSecondsStep(seconds)[0], center[1] + this.getSecondsStep(seconds)[1], seconds);
		this.drawRound(center[0] - this.getMinuteStep(minutes)[0], center[1] + this.getMinuteStep(minutes)[1], minutes);
	}
	
}