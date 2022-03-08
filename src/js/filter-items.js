'use strict';

export default class FilterItems {
	constructor (form, items) {
		this.form = form;
		this.inputs = this.form.querySelectorAll('select, input[type="checkbox"], input[type="radio"]');
		this.q = this.form.querySelector('[name="q"]');
		this.items = items;
	}

	mount () {
		this.filterItems();

		if (this.inputs.length) {
			this.inputs.forEach(input => {
				input.addEventListener('change', e => {
					this.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
				});
			});
		}

		if (this.q) {
			this.q.addEventListener('input', e => {
				this.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
			});
		}

		this.form.addEventListener('submit', e => {
			e.preventDefault();
			this.filterItems();
		});

		this.form.addEventListener('reset', e => {
			// NOTE: Need to wait for form to reset
			setTimeout(() => {
				this.filterItems();
			});
		});
	}

	filterItems () {
		// Show all items by default
		this.items.forEach(el => el.classList.remove('filter-items--hidden'));

		// Store all input values
		var classes = [];

		this.inputs.forEach(input => {
			if (input.nodeName === 'SELECT') {
				if (input.value.length) {
					classes.push('.' + input.name + '-' + input.value);
				}
			}
			else {
				if (input.checked && input.value.length) {
					classes.push('.' + input.name + '-' + input.value);
				}
			}
		});

		// If we have either <select> values or a search string
		if (classes.length || (this.q && this.q.value.length)) {
			// Hide all items
			this.items.forEach(el => el.classList.add('filter-items--hidden'));

			// Filter out the visible items
			const visibleItems = Array.from(this.items).filter(item => {
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
				if (this.q && this.q.value.length) {
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
