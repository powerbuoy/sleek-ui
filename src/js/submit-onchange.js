'use strict';

export default class SubmitOnchange {
	constructor (form) {
		this.form = form;
	}

	mount () {
		this.form.addEventListener('change', e => {
			// Trigger onsubmit
			this.form.dispatchEvent(new Event('submit', {bubbles: true}));

			// Actually submit the form
			this.form.submit();
		});
	}
}
