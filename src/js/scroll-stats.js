'use strict';

export default class ScrollStats {
	constructor (conf) {
		this.config = Object.assign({
			classEl: document.documentElement,
			farThreshold: 100
		}, conf);
		this.lastScrollTop = 0;
		this.lastScrollTopNS = 0;
	}

	mount () {
		this.setScrollStats();

		window.addEventListener('scroll', e => {
			this.setScrollStats();
		}, {passive: true});
	}

	setScrollStats () {
		const st = Math.max((document.documentElement.scrollTop || document.body.scrollTop), 0);
		const sh = document.documentElement.scrollHeight;

		// If user has scrolled at all
		if (Math.abs(this.lastScrollTopNS - st) > 0) {
			if (st > this.lastScrollTopNS) {
				this.config.classEl.classList.remove('scrolling-up', 'scrolling-up-far');
				this.config.classEl.classList.add('scrolling-down', 'has-scrolled-down');
			}
			else {
				this.config.classEl.classList.remove('scrolling-down', 'scrolling-down-far');
				this.config.classEl.classList.add('scrolling-up', 'has-scrolled-up');
			}

			this.lastScrollTopNS = st;
		}

		// If user has scrolled past sensitivity
		if (Math.abs(this.lastScrollTop - st) > this.config.farThreshold) {
			if (st > this.lastScrollTop) {
				this.config.classEl.classList.remove('scrolling-up-far');
				this.config.classEl.classList.add('scrolling-down-far', 'has-scrolled-down-far');
			}
			else {
				this.config.classEl.classList.remove('scrolling-down-far');
				this.config.classEl.classList.add('scrolling-up-far', 'has-scrolled-up-far');
			}

			this.lastScrollTop = st;
		}

		// User has scrolled down more than half the page
		if (st > sh / 2) {
			this.config.classEl.classList.add('scrolling-down-halfway');
		}
		else {
			this.config.classEl.classList.remove('scrolling-down-halfway');
		}

		// If user is not at the top of the page
		if (st) {
			this.config.classEl.classList.add('has-scrolled');
			this.config.classEl.classList.remove('at-top');
		}
		// User is at top
		else {
			this.config.classEl.classList.add('at-top');
			this.config.classEl.classList.remove(
				'has-scrolled', 'scrolling-down', 'has-scrolled-down', 'scrolling-down-far', 'has-scrolled-down-far',
				'scrolling-up', 'has-scrolled-up', 'scrolling-up-far', 'has-scrolled-up-far'
			);
		}
	}
}
