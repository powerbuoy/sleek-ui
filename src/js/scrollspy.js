'use strict';

export default class Scrollspy {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			threshold: 0,
			adjustThreshold: true,
			rootMargin: '0% 0% -15%',
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
		Array.from(this.el.children).forEach((child, index) => child.style.setProperty('--scrollspy-el-index', index));

		if (this.config.threshold !== 0 && this.config.adjustThreshold) {
			const elHeight = this.el.getBoundingClientRect().height;
			var th = this.config.threshold;

			// The element is too tall to ever hit the threshold - change threshold
			if (elHeight > (window.innerHeight * this.config.threshold)) {
				th = ((window.innerHeight * this.config.threshold) / elHeight) * this.config.threshold;

				this.config.threshold = th;
			}
		}

		new IntersectionObserver(
			entries => entries.forEach(
				entry => this.config.callback(entry)
			), this.config // NOTE: We pass our entire config so that user's can set root and rootMargin as well. Passing invalid properties (this.config.callback) doesn't seem to be a problem.
		).observe(this.el);
	}
}
