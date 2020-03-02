'use strict';

export default class Scrollspy {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			threshold: 0.75,
			callback: (entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('in-view', 'was-in-view');
				}
				else {
					entry.target.classList.remove('in-view');
				}
			}
		}, conf);
	}

	mount () {
		const elHeight = this.el.getBoundingClientRect().height;
		var th = this.config.threshold;

		// The element is too tall to ever hit the threshold - change threshold
		if (elHeight > (window.innerHeight * this.config.threshold)) {
			th = ((window.innerHeight * this.config.threshold) / elHeight) * this.config.threshold;
		}

		console.log(th);

		new IntersectionObserver(entries => entries.forEach(entry => this.config.callback(entry)), {threshold: th}).observe(this.el);
	}
}
