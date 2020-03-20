'use strict';

export default class RadialProgress {
	constructor (el, value) {
		this.el = el;
		this.currentValue = value;
	}

	mount () {
		// Clear element contents
		this.el.innerHTML = '';

		// Create SVG to hold progress bar
		this.progressBar = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.progressBar.classList.add('radial-progress');
		this.el.appendChild(this.progressBar);

		let progressWidth = parseInt(getComputedStyle(this.progressBar).getPropertyValue('width'));

		this.progressBar.setAttribute('width', progressWidth);
		this.progressBar.setAttribute('height', progressWidth);
		this.progressBar.setAttribute('viewBox', '0 0 ' + progressWidth + ' ' + progressWidth);
		this.progressBar.innerHTML = '<circle cx="' + (progressWidth / 2) + '" cy="' + (progressWidth / 2) + '" r="' + (progressWidth / 2) + '" fill="none" class="meter"></circle><circle cx="' + (progressWidth / 2) + '" cy="' + (progressWidth / 2) + '" r="' + (progressWidth / 2) + '" fill="none" class="value"></circle>';

		// Adjust circle radius (So annoying we can't just set the stroke on the inside...)
		let meter = this.progressBar.querySelector('circle.meter');
		let value = this.progressBar.querySelector('circle.value');
		let meterWidth = parseInt(getComputedStyle(meter).getPropertyValue('stroke-width'));
		let valueWidth = parseInt(getComputedStyle(value).getPropertyValue('stroke-width'));

		meter.setAttribute('r', (progressWidth / 2) - (meterWidth / 2));
		value.setAttribute('r', (progressWidth / 2) - (valueWidth / 2));

		// Store length
		this.progressLength = value.getTotalLength();
		this.el.style.setProperty('--radial-progress-value-length', this.progressLength);

		// Set value
		this.value = this.currentValue;

		// Finish up
		setTimeout(() => {
			this.progressBar.classList.add('loaded');
		});
	}

	set value (newValue) {
		this.currentValue = parseInt(newValue);

		this.el.style.setProperty('--radial-progress-value', this.currentValue);
		this.el.style.setProperty('--radial-progress-value-offset', this.progressLength * (1 - (this.currentValue / 100)));
	}

	get value () {
		return this.currentValue;
	}
}
