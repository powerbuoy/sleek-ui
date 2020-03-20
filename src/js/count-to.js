'use strict';

export default class CountTo {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			from: 0,
			to: null,
			duration: 2,
			locale: 'en-US',
			prefix: '',
			suffix: '',
			options: {
				maximumFractionDigits: 0 // TODO: Should depend on whether input is int or float
			}
		}, conf);
	}

	mount () {
		const countTo = parseInt(this.config.to); // TODO: Add support for float
		const step = countTo / this.config.duration;
		var currentVal = this.config.from;
		var dt;
		var time;

		this.el.innerHTML = currentVal;

		const increaseCount = () => {
			dt = Date.now() - time;
			time = Date.now();

			currentVal += (step * (dt / 1000));

			if (currentVal >= countTo) {
				currentVal = countTo;
			}
			else {
				requestAnimationFrame(increaseCount);
			}

			this.el.innerHTML = this.config.prefix + currentVal.toLocaleString(this.config.locale, this.config.options) + this.config.suffix;
		};

		new IntersectionObserver(entries => entries.forEach((entry) => {
			if (entry.isIntersecting) {
				time = Date.now();

				requestAnimationFrame(increaseCount);
			}
		}), {threshold: 1}).observe(this.el);
	}
}
