'use strict';

import Glide from '@glidejs/glide';

//////////////////////////
// Modify the active class
export var SlideshowVisibleClass = function (Glide, Components, Events) {
	var Component = {
		mount () {
			this.setVisibleClasses();
		},

		setVisibleClasses () {
			if (Glide.settings.perView > 1) {
				const glideEl = Components.Html.root;
				const active = Components.Html.slides[Glide.index];

				// Calculate how many on each side we need to add visible classes to
				if (Glide.settings.focusAt === 'center') {
					var numBefore = Math.ceil((Glide.settings.perView - 1) / 2);
					var numAfter = numBefore;
				}
				else {
					var numBefore = Glide.settings.focusAt;
					var numAfter = Glide.settings.perView - Glide.settings.focusAt - 1;
				}

				// Remove visible classes
				glideEl.querySelectorAll('.glide__slide--visible').forEach(slide => {
					slide.classList.remove('glide__slide--visible');
				});

				// Add visible class to active slide
				active.classList.add('glide__slide--visible');

				// Add visible classes to next siblings
				var next = active.nextElementSibling;

				if (next) {
					next.classList.add('glide__slide--visible');

					for (let i = 0; i < numAfter - 1; i++) {
						if (next && (next = next.nextElementSibling)) {
							next.classList.add('glide__slide--visible');
						}
					}
				}

				// Add visible classes to previous siblings
				var prev = active.previousElementSibling;

				if (prev) {
					prev.classList.add('glide__slide--visible');

					for (let i = 0; i < numBefore - 1; i++) {
						prev = prev.previousElementSibling;

						if (prev) {
							prev.classList.add('glide__slide--visible');
						}
					}
				}
			}
			else {
				Components.Html.root.querySelectorAll('.glide__slide--visible').forEach(slide => {
					slide.classList.remove('glide__slide--visible');
				});
				Components.Html.slides[Glide.index].classList.add('glide__slide--visible');
			}
		}
	};

	Events.on('run', () => {
		Component.setVisibleClasses();
	});

	return Component;
};

export default class Slideshow {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			type: 'carousel',
			perView: 1,
			focusAt: 'center',
			animationDuration: 800,
			autoplay: 6000,
			beforeBullets: '',
			afterBullets: ''
		}, conf);

		this.init();
	}

	init () {
		// Make sure we have some slides
		if (this.el.children.length) {
			//////////////////////////////
			// Use --slideshow-gap for gap
			if (!this.config.gap) {
				const gap = (parseFloat(window.getComputedStyle(this.el).getPropertyValue('--slideshow-gap')) * 16); // NOTE: Assume rem use

				this.config.gap = isNaN(gap) ? 32 : gap;
			}

			// Make sure we're not trying to focus outside of page
			if (this.config.focusAt !== 'center' && this.config.focusAt > (this.config.perView - 1)) {
				this.config.focusAt = this.config.perView - 1;
			}

			////////////////
			// Create markup
			this.el.classList.add('glide');

			const trackEl = document.createElement('div');
			const slidesEl = document.createElement('div');

			trackEl.classList.add('glide__track');
			trackEl.setAttribute('data-glide-el', 'track');
			slidesEl.classList.add('glide__slides');

			// Create prev/next buttons
			const buttons = document.createElement('div');

			buttons.classList.add('slideshow-nav');
			buttons.setAttribute('data-glide-el', 'controls');
			buttons.innerHTML = '<a data-glide-dir="<" class="slideshow-prev">&larr;</a><a data-glide-dir=">" class="slideshow-next">&rarr;</a>';

			// Create bullets
			const nav = document.createElement('div');

			nav.classList.add('slideshow-bullets');
			nav.setAttribute('data-glide-el', 'controls[nav]');

			let bullets = this.config.beforeBullets;

			// Add classes to existing markup
			[...this.el.children].forEach((child, index) => {
				bullets += '<a data-glide-dir="=' + index + '">' + (index + 1) + '</a>'

				child.classList.add('glide__slide');
				slidesEl.appendChild(child);
			});

			nav.innerHTML = bullets + this.config.afterBullets;

			/////////////////////////////////
			// Now move everything into place
			trackEl.appendChild(slidesEl);
			this.el.appendChild(trackEl);
			this.el.appendChild(buttons);
			this.el.appendChild(nav);

			////////////////
			// Create slider
			this.el.glidejs = new Glide(this.el, this.config);
		}
	}

	mount (components) {
		if (this.el.glidejs) {
			this.el.glidejs.mount(components);
		}
	}
}
