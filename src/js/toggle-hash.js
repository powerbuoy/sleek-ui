'use strict';

export default class ToggleHash {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			hash: this.el.getAttribute('href'),
			defaultText: this.el.innerText,
			toggleText: this.el.innerText
		}, conf);
	}

	mount () {
		if (this.config.hash === window.location.hash) {
			this.onAdd();
		}

		this.el.addEventListener('click', e => {
			e.preventDefault();
			e.stopPropagation();

			this.toggleHash();
		});
	}

	toggleHash () {
		// Hash already set in URL - remove it
		if (this.config.hash === window.location.hash) {
			// Remember scroll position
			const st = window.pageYOffset;

			window.location.hash = '#';

			window.scrollTo({top: st});

			// Remove single #
			if ('replaceState' in window.history) {
				window.history.replaceState('', document.title, window.location.pathname + window.location.search);
			}

			this.onRemove();
		}
		// Hash not set - add it
		else {
			// Remember scroll position
			const st = window.pageYOffset;

			window.location.hash = this.config.hash;

			window.scrollTo({top: st});

			this.onAdd();
		}
	}

	onAdd () {
		// Change text of link
		if (this.config.defaultText !== this.config.toggleText) {
			this.el.innerText = this.config.toggleText;
		}

		// Update classes
		document.documentElement.classList.add('hash-active', 'hash-active-' + this.config.hash.substr(1));
	}

	onRemove () {
		// Change text of link
		if (this.config.defaultText !== this.config.toggleText) {
			this.el.innerText = this.config.defaultText;
		}

		// Update classes
		document.documentElement.classList.remove('hash-active', 'hash-active-' + this.config.hash.substr(1));
	}
}
