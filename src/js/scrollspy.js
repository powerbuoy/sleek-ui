'use strict';

export default class Scrollspy {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			rootMargin: '0% 0% 50%',
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
		new IntersectionObserver(
			entries => entries.forEach(
				entry => this.config.callback(entry)
			), this.config // NOTE: We pass our entire config so that user's can set root and rootMargin as well. Passing invalid properties (this.config.callback) doesn't seem to be a problem.
		).observe(this.el);
	}
}
