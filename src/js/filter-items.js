'use strict';

export default class FilterItems {
	constructor (form, conf) {
		this.form = form;
		this.selects = this.form.querySelectorAll('select');
		this.q = this.form.querySelector('[name="q"]');
		this.config = Object.assign({
			items: null
		}, conf);
	}

	mount () {
		this.filterItems();

		this.selects.forEach(select => {
			select.addEventListener('change', e => {
				this.form.dispatchEvent(new Event('submit', {bubbles: true}));
			});
		});

		this.q.addEventListener('input', e => {
			this.form.dispatchEvent(new Event('submit', {bubbles: true}));
		});

		this.form.addEventListener('submit', e => {
			e.preventDefault();

			this.filterItems();
		});
	}

	filterItems () {
		// Show all items by default
		this.config.items.forEach(el => el.classList.remove('filter-items--hidden'));

		// Store all <select>-element values
		var classes = [];

		this.selects.forEach(select => {
			if (select.value.length) {
				classes.push('.' + select.name + '-' + select.value);
			}
		});

		// If we have either <select> values or a search string
		if (classes.length || this.q.value.length) {
			// Hide all items
			this.config.items.forEach(el => el.classList.add('filter-items--hidden'));

			// Filter out the visible items
			const visibleItems = Array.from(this.config.items).filter(item => {
				var isClassMatch = false;
				var isQMatch = false;

				// If they match class
				if (classes.length) {
					isClassMatch = item.matches(classes.join(''));
				}
				else {
					isClassMatch = true;
				}

				// Or q
				if (this.q.value.length) {
					isQMatch = new RegExp(this.q.value, 'im').test(item.innerHTML);
				}
				else {
					isQMatch = true;
				}

				return isClassMatch && isQMatch;
			});

			// Show them
			visibleItems.forEach(el => el.classList.remove('filter-items--hidden'));
		}
	}
}
