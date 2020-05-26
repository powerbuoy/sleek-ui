'use strict';

export default class DocumentOutline {
	constructor (wrap) {
		this.wrap = wrap || document.body;
	}

	generateOutline () {
		const firstHeading = this.wrap.querySelector('h1, h2, h3, h4, h5, h6');

		if (firstHeading) {
			const firstHeadingLevel = firstHeading.tagName.toLowerCase();
			const topLevelHeadings = this.wrap.querySelectorAll(firstHeadingLevel);

			return this.generate(topLevelHeadings);
		}

		return null;
	}

	generate (headings, k) {
		let key = k || 0;
		let html = '<ol>';

		headings.forEach((el, i) => {
			const level = parseInt(el.tagName.substr(1));
			const text = el.innerText;
			const slug = text.replace(/^[^a-z]+|[^\w:.-]+/gi, '').toLowerCase(); // https://stackoverflow.com/questions/9635625/javascript-regex-to-remove-illegal-characters-from-dom-id
			const id = `document-outline-${slug}-${level}-${i}-${key}`;

			el.id = id;
			html += `<li><a href="#${id}">${text}</a>`;

			const nextHeadings = this.nextUntil(el, 'h' + level, 'h' + (level + 1));

			if (nextHeadings.length) {
				html += this.generate(nextHeadings, i);
			}

			html += '</li>';
		});

		html += '</ol>';

		return html;
	}

	nextUntil (elem, selector, filter) {
		var siblings = [];

		elem = elem.nextElementSibling;

		while (elem) {
			if (elem.matches(selector)) {
				break;
			}
			else if (elem.matches(filter)) {
				siblings.push(elem);
			}

			elem = elem.nextElementSibling;
		}

		return siblings;
	}
}
