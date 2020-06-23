'use strict';

import Flickity from 'flickity';

export default class Slideshow {
	constructor (el, conf) {
		this.el = el;
		this.config = Object.assign({
			wrapAround: true,
			cellAlign: 'left'
		}, conf);
	}

	mount () {
		this.el.flickity = new Flickity(this.el, this.config);
	}
}
