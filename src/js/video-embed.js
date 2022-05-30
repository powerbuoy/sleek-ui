'use strict';

export default class VideoEmbed {
	constructor (el, data, config) {
		this.el = el;
		this.data = data;
		this.config = Object.assign({
			api: true,
			buildHTML: true
		}, config);

		this.ytPlayStates = {
			'??': 'unknown',
			'-1': 'unstarted',
			'0': 'ended',
			'1': 'playing',
			'2': 'paused',
			'3': 'buffering',
			'5': 'video-cued'
		};

		this.readyEvent = new CustomEvent('sleek-ui/video-embed/ready', {bubbles: true});
	}

	mount () {
		if (this.config.buildHTML) {
			this.buildHTML();
		}
		else {
			this.wrapEl = this.el;
		}

		// Enable Vimeo / YT APIs
		if (this.config.api) {
			// Convert data-src to src so we can load APIs
			if (this.el.dataset.src) {
				this.el.setAttribute('src', this.el.dataset.src);
			}

			// YouTube
			if (this.data.provider_name === 'YouTube') {
				// Add "enablejsapi"
				let src = this.el.getAttribute('src');

				if (src.indexOf('enablejsapi=1') === -1) {
					if (src.indexOf('?') === -1) {
						src = src + '?enablejsapi=1';
					}
					else {
						src = src + '&enablejsapi=1';
					}

					this.el.setAttribute('src', src);
				}

				// Add callback
				const old = window.onYouTubeIframeAPIReady;

				window.onYouTubeIframeAPIReady = () => {
					if (old) {
						old();
					}

					this.initYouTube();
				};

				this.addScript('https://www.youtube.com/iframe_api');
			}
			// Vimeo
			else if (this.data.provider_name === 'Vimeo') {
				this.addVimeoScript('https://player.vimeo.com/api/player.js').then(() => this.initVimeo());
			}
		}
		else {
			this.toggleSrc();
			this.el.dispatchEvent(this.readyEvent);
		}
	}

	buildHTML () {
		let embedEl, videoEl, titleEl;

		// Wrapper
		this.wrapEl = document.createElement('figure');
		this.wrapEl.classList.add('video-embed', 'video-embed--' + this.data.provider_name);

		// Video/Image wrapper
		embedEl = document.createElement('div');
		embedEl.classList.add('embed');

		// Image wrapper
		this.thumbnailEl = document.createElement('div');
		this.thumbnailEl.classList.add('thumbnail');
		this.thumbnailEl.appendChild(this.buildThumbnailHTML());

		// Title
		if (this.data.title) {
			titleEl = document.createElement('figcaption');
			titleEl.innerHTML = this.data.title;
		}

		// The iframe is already wrapped in a div.video
		if (this.el.parentNode.matches('div.video')) {
			this.el.parentNode.parentNode.insertBefore(this.wrapEl, this.el.parentNode);
			embedEl.appendChild(this.el.parentNode);
		}
		// Create the div.video
		else {
			videoEl = document.createElement('div');
			videoEl.classList.add('video');

			this.el.parentNode.insertBefore(this.wrapEl, this.el);

			videoEl.appendChild(this.el);
			embedEl.appendChild(videoEl);
		}

		embedEl.appendChild(this.thumbnailEl);
		this.wrapEl.appendChild(embedEl);

		if (this.data.title) {
			this.wrapEl.appendChild(titleEl);
		}
	}

	buildThumbnailHTML () {
		const img = document.createElement('img');

		img.setAttribute('loading', 'lazy');
		img.src = this.data.thumbnail_url || 'https://placehold.it/800x600?text=N/A';

		return img;
	}

	initYouTube () {
		this.ytPlayer = new YT.Player(this.el, {
			events: {
				onReady: e => {
					this.el.dispatchEvent(this.readyEvent);
					this.wrapEl.classList.add('video-embed--state-' + (this.ytPlayStates[e.data] || 'unknown'));
				},
				onStateChange: e => {
					for (var [key, value] of Object.entries(this.ytPlayStates)) {
						this.wrapEl.classList.remove('video-embed--state-' + value);
					}

					this.wrapEl.classList.add('video-embed--state-' + (this.ytPlayStates[e.data] || 'unknown'));
				}
			}
		});

		if (this.thumbnailEl) {
			this.thumbnailEl.addEventListener('click', e => {
				this.play();
			});
		}
	}

	initVimeo () {
		this.vimeoPlayer = new Vimeo.Player(this.el);

		this.vimeoPlayer.ready().then(() => this.el.dispatchEvent(this.readyEvent));

		this.vimeoPlayer.on('play', () => {
			this.wrapEl.classList.add('video-embed--state-playing');
		});

		this.vimeoPlayer.on('ended', () => {
			this.wrapEl.classList.remove('video-embed--state-playing');
		});

		this.vimeoPlayer.on('pause', () => {
			this.wrapEl.classList.remove('video-embed--state-playing');
		});

		if (this.thumbnailEl) {
			this.thumbnailEl.addEventListener('click', e => {
				this.play();
			});
		}
	}

	play () {
		if (this.vimeoPlayer) {
			this.vimeoPlayer.play();
		}
		else if (this.ytPlayer) {
			this.ytPlayer.playVideo();
		}
	}

	pause () {
		if (this.vimeoPlayer) {
			this.vimeoPlayer.pause();
		}
		else if (this.ytPlayer) {
			this.ytPlayer.pauseVideo();
		}
	}

	addScript (src) {
		return new Promise((resolve, reject) => {
			const existingScript = document.querySelector('script[src="' + src + '"]');

			if (!existingScript) {
				const script = document.createElement('script');

				script.src = src;

				document.body.appendChild(script);
				script.addEventListener('load', () => resolve(script));
			}
			else {
				resolve(existingScript);
			}
		});
	}

	// NOTE: We need to make sure Vimeo has actually loaded here
	addVimeoScript (src) {
		return new Promise((resolve, reject) => {
			const existingScript = document.querySelector('script[src="' + src + '"]');

			if (existingScript) {
				if (typeof Vimeo === 'undefined') {
					existingScript.addEventListener('load', () => resolve(existingScript));
				}
				else {
					resolve(existingScript);
				}
			}
			else {
				const script = document.createElement('script');

				script.src = src;

				document.body.appendChild(script);
				script.addEventListener('load', () => resolve(script));
			}
		});
	}

	// Non API version, just toggle data-src on click of thumbnail
	toggleSrc () {
		const src = this.el.dataset.src || this.el.getAttribute('src');

		this.el.removeAttribute('src');

		if (this.thumbnailEl) {
			this.thumbnailEl.addEventListener('click', e => {
				this.el.setAttribute('src', src + '&autoplay=true');
				this.wrapEl.classList.add('video-embed--state-playing');
			});
		}
	}
}
