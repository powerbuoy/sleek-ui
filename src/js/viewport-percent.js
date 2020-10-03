'use strict';

export default class ViewportPercent {
	constructor (el, config) {
		this.el = el;
	}

	mount () {
		// Get dimensions
		this.getWindowDimensions();
		this.getElementDimensions();

		// Calculate percentage
		requestAnimationFrame(() => {
			this.calculate();
		});

		// Re-calculate dimensions on resize
		window.addEventListener('resize', () => {
			this.getWindowDimensions();
			this.getElementDimensions();

			requestAnimationFrame(() => {
				this.calculate();
			});
		}, {passive: true});

		// Re-calculate percentage on scroll
		window.addEventListener('scroll', () => {
			this.getElementDimensions();

			requestAnimationFrame(() => {
				this.calculate();
			});
		}, {passive: true});
	}

	calculate () {
		this.percent = 0;

		// The element is below the viewport - no movement
		if (this.elDim.top >= this.winDim.height) {
			this.percent = 0;
		}
		// The element is above the viewport - 100% movement
		else if ((this.elDim.top + this.elDim.height) <= 0) {
			this.percent = 1;
		}
		// The element is somewhere inside the viewport
		else {
			const totalScrollDistance = this.winDim.height + this.elDim.height;
			const scrolledSoFar = totalScrollDistance - this.elDim.bottom;

			this.percent = scrolledSoFar / totalScrollDistance;
		}

		this.el.style.setProperty('--viewport-percent', this.percent);
	}

	// Get element dimensions
	getElementDimensions () {
		// An img
		if (this.el.nodeName.toLowerCase() === 'img') {
			// Img is loaded
			if (img.complete) {
				this.elDim = this.el.getBoundingClientRect();
			}
			// Img isn't loaded
			else {
				img.addEventListener('load', () => {
					this.elDim = this.el.getBoundingClientRect();

					requestAnimationFrame(() => {
						this.calculate();
					});
				});
			}
		}
		// Not an img
		else {
			this.elDim = this.el.getBoundingClientRect();
		}
	}

	// http://stackoverflow.com/questions/5484578/how-to-get-document-height-and-width-without-using-jquery
	getWindowDimensions () {
		this.winDim = {
			width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
		};
	}
}
