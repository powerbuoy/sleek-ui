'use strict';

export default class Dialog {
	constructor (conf) {
		this.config = Object.assign({
			triggers: document.querySelectorAll('a[href$="-dialog"]')
		}, conf);
	}

	init () {
		this.initTemplateDialog();
		this.initDialogs();
		this.initTriggers();
	}

	initTemplateDialog () {
		this.templateDialog = document.createElement('div');

		this.templateDialog.classList.add('dialog');
		document.body.appendChild(this.templateDialog);
	}

	initDialogs () {
		document.querySelectorAll('div.dialog').forEach(dialog => {
			// Insert methods
			dialog.sleekDialog = {
				open: () => {
					document.documentElement.classList.add('dialog-open');
					document.documentElement.classList.add('dialog-open--' + dialog.id);
					dialog.classList.add('open');
				},
				close: () => {
					document.documentElement.classList.remove('dialog-open');
					document.documentElement.classList.remove('dialog-open--' + dialog.id);
					dialog.classList.remove('open');
				},
				isOpen: () => {
					return dialog.classList.contains('open');
				},
				isClosed: () => {
					return !dialog.classList.contains('open');
				},
				getStatus: () => {
					return dialog.classList.contains('open') ? 'open' : 'close';
				}
			};

			// Insert backdrop
			var backdrop = document.createElement('div');

			backdrop.classList.add('backdrop');
			dialog.parentNode.insertBefore(backdrop, dialog.nextSibling);

			backdrop.addEventListener('click', e => {
				if (e.target === backdrop) {
					dialog.sleekDialog.close();
				}
			});

			// Insert close button
			var close = document.createElement('a');

			close.classList.add('dialog__close');
			close.innerHTML = '&times;';
			dialog.appendChild(close);

			dialog.addEventListener('click', e => {
				if (e.target.classList.contains('dialog__close')) {
					e.preventDefault();
					dialog.sleekDialog.close();
				}
			});
		});
	}

	initTriggers () {
		this.config.triggers.forEach(el => {
			el.addEventListener('click', e => {
				e.preventDefault();

				var target = document.getElementById(el.getAttribute('href').substr(1));

				if (target) {
					// The target is a template
					if (target.nodeName.toLowerCase() === 'script') {
						this.templateDialog.className = 'dialog dialog--no-transition ' + target.className;
						this.templateDialog.innerHTML = target.innerHTML + '<a class="dialog__close">&times;</a>';

						// HACK: Wait for dialog--no-transition to kick in (for some reason I need around 50ms...)
						setTimeout(() => {
							this.templateDialog.classList.remove('dialog--no-transition');
							this.templateDialog.sleekDialog.open();
						}, 50);
					}
					// The target is a dialog element
					else {
						target.sleekDialog.open();
					}
				}
			});
		});
	}
}
