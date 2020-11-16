'use strict';

export default class SubmitOnchange {
	constructor (form, conf) {
		this.form = form;
		this.timeout = null;
		this.config = Object.assign({
			throttle: 0
		}, conf);
	}

	mount () {
		this.form.addEventListener('change', e => {
			if (this.config.throttle) {
				if (this.timeout) {
					clearTimeout(this.timeout);
				}

				this.timeout = setTimeout(() => {
					this.submit();
				}, this.config.throttle);
			}
			else {
				this.submit();
			}
		});
	}

	submit () {
		// Trigger onsubmit
		this.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));

		// Actually submit the form
		this.form.submit();
	}
}
