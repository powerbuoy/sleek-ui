'use strict';

export default class Scrollspy {
	constructor (conf) {
		this.config = Object.assign({
			threshold: 0.75,
			selectors: ['#site-header, #site-footer, main > section'],
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

	init () {
		document.querySelectorAll(this.config.selectors.join(',')).forEach(el => {
			const elHeight = el.getBoundingClientRect().height;
			var th = this.config.threshold;

			// The element is too tall to ever hit the threshold - change threshold
			if (elHeight > (window.innerHeight * this.config.threshold)) {
				th = ((window.innerHeight * this.config.threshold) / elHeight) * this.config.threshold;
			}

			new IntersectionObserver(iEls => iEls.forEach(iEl => toggleViewClass(iEl)), {threshold: th}).observe(el);
		});
	}
}
