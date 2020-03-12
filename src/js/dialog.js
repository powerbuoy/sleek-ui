'use strict';

export class DialogTrigger {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			target: document.getElementById(this.el.getAttribute('href').substr(1)),
			templateDialog: null
		}, conf);
		this.openEvent = new CustomEvent('sleek-ui-dialog-trigger-open', {
			bubbles: true,
			detail: {
				dialog: this.config.target,
				data: this.el.dataset.dialogData || null
			}
		});
	}

	mount () {
		this.el.addEventListener('click', e => {
			e.preventDefault();

			this.el.dispatchEvent(this.openEvent);

			// The target is a template
			if (this.config.target.nodeName.toLowerCase() === 'script') {
				if (this.config.templateDialog) {
					this.config.templateDialog.className = 'dialog dialog--no-transition ' + this.config.target.className;
					this.config.templateDialog.innerHTML = this.config.target.innerHTML + '<a class="dialog__close">&times;</a>';

					// HACK: Wait for dialog--no-transition to kick in (for some reason I need around 50ms...)
					setTimeout(() => {
						this.config.templateDialog.classList.remove('dialog--no-transition');
						this.config.templateDialog.sleekDialog.open();
					}, 50);
				}
				else {
					console.error('DialogTrigger points to a script but no template dialog is specified');
				}
			}
			// The target is a dialog element
			else {
				this.config.target.sleekDialog.open();
			}
		});
	}
}

export default class Dialog {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({}, conf);
		this.openEvent = new CustomEvent('sleek-ui-dialog-open', {
			bubbles: true,
			detail: {
				dialog: this.el
			}
		});
		this.closeEvent = new CustomEvent('sleek-ui-dialog-close', {
			bubbles: true,
			detail: {
				dialog: this.el
			}
		});
	}

	mount () {
		// Insert methods
		this.el.sleekDialog = {
			open: () => {
				document.documentElement.classList.add('dialog-open');
				document.documentElement.classList.add('dialog-open--' + this.el.id);
				this.el.classList.add('open');
				this.el.dispatchEvent(this.openEvent);
			},
			close: () => {
				document.documentElement.classList.remove('dialog-open');
				document.documentElement.classList.remove('dialog-open--' + this.el.id);
				this.el.classList.remove('open');
				this.el.dispatchEvent(this.closeEvent);
			},
			isOpen: () => {
				return this.el.classList.contains('open');
			},
			isClosed: () => {
				return !this.el.classList.contains('open');
			},
			getStatus: () => {
				return this.el.classList.contains('open') ? 'open' : 'close';
			}
		};

		// Insert backdrop
		var backdrop = document.createElement('div');

		backdrop.classList.add('backdrop');
		this.el.parentNode.insertBefore(backdrop, this.el.nextSibling);

		backdrop.addEventListener('click', e => {
			if (e.target === backdrop) {
				this.el.sleekDialog.close();
			}
		});

		// Insert close button
		var close = document.createElement('a');

		close.classList.add('dialog__close');
		close.innerHTML = '&times;';
		this.el.appendChild(close);

		this.el.addEventListener('click', e => {
			if (e.target.classList.contains('dialog__close')) {
				e.preventDefault();
				this.el.sleekDialog.close();
			}
		});
	}
}
