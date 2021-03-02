'use strict';

export default class GoogleMap {
	//////////////
	// Constructor
	constructor (mapEl, conf) {
		this.mapEl = mapEl;
		this.config = conf;
		this.markers = [];
		this.kmlLayers = [];

		// We will most likely need an info window
		this.infoWindow = new google.maps.InfoWindow();

		// Create bounds
		this.markerBounds = new google.maps.LatLngBounds();

		// Default map options
		this.mapOptions = {
			zoom: this.config.zoom || 2,
			scrollWheel: this.config.scrollWheel || false,
			center: this.config.center || {lat: 0, lng: 0},
			mapTypeControl: false, // Will be true if more than one map type is specified
			streetViewControl: this.config.streetViewControl || false,
			styles: this.config.styles || null
		};

		// Add map types
		var firstMapType = null;

		if (this.config.mapTypes && this.config.mapTypes.length) {
			// Just one type
			if (this.config.mapTypes.length === 1) {
				// Just a string, assume it's an existing mapTypeId
				if (typeof this.config.mapTypes[0] === 'string') {
					this.mapOptions.mapTypeId = this.config.mapTypes[0];
				}
				// Not a string - assumed to be a style object
				else {
					this.mapOptions.styles = this.config.mapTypes[0].styles;
				}
			}
			// Several types
			else {
				var mapTypeIds = [];

				// Show map type controls
				this.mapOptions.mapTypeControl = true;

				// Add all types
				for (var i = 0; i < this.config.mapTypes.length; i++) {
					if (typeof this.config.mapTypes[i] === 'string') {
						mapTypeIds.push(this.config.mapTypes[i]);
					}
					else {
						mapTypeIds.push('styled_map_' + this.config.mapTypes[i].name.replace(/\W/g, '_'));
					}
				}

				firstMapType = mapTypeIds[0];
				this.mapOptions.mapTypeControlOptions = {
					mapTypeIds: mapTypeIds
				};
			}
		}

		// Create the map
		this.map = new google.maps.Map(this.mapEl, this.mapOptions);

		// Now create the styled map types (because we need the map to do so)
		if (this.config.mapTypes && this.config.mapTypes.length > 1) {
			for (var i = 0; i < this.config.mapTypes.length; i++) {
				if (typeof this.config.mapTypes[i] !== 'string') {
					this.map.mapTypes.set(
						'styled_map_' + this.config.mapTypes[i].name.replace(/\W/g, '_'),
						new google.maps.StyledMapType(this.config.mapTypes[i].styles, {name: this.config.mapTypes[i].name})
					);
				}
			}
		}

		// Finally set the first map type as active
		if (firstMapType) {
			this.map.setMapTypeId(firstMapType);
		}

		// Geolocation
		if (this.config.geolocation) {
			this.addGeolocation();
		}

		// Markers
		if (this.config.markers && this.config.markers.length) {
			this.addMarkers(this.config.markers);
		}

		// KML Layers
		if (this.config.kmlLayers && this.config.kmlLayers.length) {
			this.addKmlLayers(this.config.kmlLayers);
			this.addKmlToggler();
		}
	}

	///////////////
	// Geolocation
	addGeolocation () {
		this.geolocationControl = document.createElement('div');
		this.geolocationControl.classList.add('sleek-map-geolocation');
		this.geolocationControl.addEventListener('click', () => {
			if (!this.geolocationMarker) {
				this.watchPosition();
			}
			else {
				this.map.panTo(this.geolocationMarker.getPosition());
			}
		});

		this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(this.geolocationControl);
	}

	/////////////////////////////
	// Setup geolocation watching
	watchPosition () {
		this.geolocationControl.classList.remove('error');
		this.geolocationControl.classList.add('loading');

		this.geolocationId = navigator.geolocation.watchPosition(
			position => {
				this.geolocationControl.classList.remove('error');
				this.geolocationControl.classList.remove('loading');

				if (this.geolocationMarker) {
					this.updateGeolocationMarker({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					}, position.coords.accuracy);
				}
				else {
					this.addGeolocationMarker({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					}, position.coords.accuracy);

					this.map.panTo({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					});
				}
			},
			error => {
				this.geolocationControl.classList.remove('loading');
				this.geolocationControl.classList.add('error');
			},
			{
				timeout: this.config.geolocation.timeout || 5000,
				maximumAge: this.config.geolocation.maximumAge || 0,
				enableHighAccuracy: this.config.geolocation.enableHighAccuracy || false
			}
		);
	}

	////////////////////////////////////
	// Create marker and accuracy circle
	addGeolocationMarker (position, radius) {
		this.geolocationMarker = new google.maps.Marker({
			map: this.map,
			position: position,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 5,
				fillColor: '#1758ce',
				fillOpacity: 1,
				strokeColor: '#1758ce',
				strokeOpacity: 1,
				strokeWeight: 0
			}
		});

		this.geolocationAccuracy = new google.maps.Circle({
			map: this.map,
			strokeColor: '#1758ce',
			strokeOpacity: 1,
			strokeWeight: 1,
			fillColor: '#1758ce',
			fillOpacity: 0.35,
			center: position,
			radius: radius
		});
	}

	////////////////////////////////////
	// Update marker and accuracy circle
	updateGeolocationMarker (position, radius) {
		this.geolocationMarker.setPosition(position);
		this.geolocationAccuracy.setCenter(position);
		this.geolocationAccuracy.setRadius(radius);
	}

	//////////////
	// Add markers
	addMarkers (markers) {
		// Go through all the markers
		markers.forEach(marker => {
			var args = {
				map: this.map,
				position: {
					lat: marker.lat,
					lng: marker.lng
				}
			};

			// Check for custom icon
			if (marker.icon) {
				args.icon = GoogleMap.parseIconObject(marker.icon);
			}
			else if (this.config.defaultMarkerIcon) {
				args.icon = this.config.defaultMarkerIcon;
			}

			// Create marker
			var gMarker = new google.maps.Marker(args);

			// Custom properties
			if (marker.customProperties) {
				gMarker.customProperties = marker.customProperties;
			}

			// Info window
			if (marker.infoWindow) {
				gMarker.addListener('click', () => {
					this.infoWindow.setContent('<div class="google-map-info-window">' + marker.infoWindow + '</div>');
					this.infoWindow.open(this.map, gMarker);
				});
			}

			this.markers.push(gMarker);
			this.markerBounds.extend(gMarker.getPosition());
		});

		// Center on markers (unless specific center is asked for)
		if (this.markers.length && !this.config.center) {
			if (this.markers.length === 1) {
				this.map.setCenter(this.markers[0].getPosition());
			}
			else {
				this.map.fitBounds(this.markerBounds);
			}
		}

		// Center on markers on map type change
		google.maps.event.addListener(this.map, 'maptypeid_changed', () => {
			if (this.markers.length === 1) {
				this.map.setCenter(this.markers[0].getPosition());
			}
			else {
				this.map.fitBounds(this.markerBounds);
			}
		});
	}

	/////////////////
	// Add KML layers
	addKmlLayers (layers) {
		// Add each layer
		layers.forEach(layer => {
			var kmlLayer = new google.maps.KmlLayer({
				map: this.map,
				url: layer.url
			});

			if (layer.customProperties) {
				kmlLayer.customProperties = layer.customProperties;
			}

			this.kmlLayers.push(kmlLayer);
		});

		// Center on KML files on map type change
		google.maps.event.addListener(this.map, 'maptypeid_changed', () => {
			this.map.fitBounds(this.kmlLayers[0].getDefaultViewport());
		});
	}

	///////////////////////////////////
	// Add toggle button for KML layers
	addKmlToggler () {
		this.kmlLayers.forEach(kmlLayer => {
			if (kmlLayer.customProperties && kmlLayer.customProperties.togglable) {
				let toggleText = kmlLayer.customProperties.togglable;
				let isActive = true;
				const toggler = document.createElement('div');

				if (toggleText === true) {
					toggleText = ['Show KML Layer', 'Hide KML Layer'];
				}
				else if (typeof toggleText === 'string') {
					toggleText = [toggleText, toggleText];
				}

				toggler.classList.add('sleek-map-kml-toggler');
				toggler.classList.add('active');
				toggler.innerHTML = toggleText[1];

				this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggler);

				toggler.addEventListener('click', () => {
					this.map.fitBounds(kmlLayer.getDefaultViewport());

					if (isActive) {
						toggler.classList.remove('active');
						toggler.innerHTML = toggleText[0];
						kmlLayer.setMap(null);
						isActive = false;
					}
					else {
						toggler.classList.add('active');
						toggler.innerHTML = toggleText[1];
						kmlLayer.setMap(this.map);
						isActive = true;
					}
				});
			}
		});
	}

	//////////////////////////
	// Fill in icon properties
	static parseIconObject (icon) {
		const defaultIconSize = 32;
		let newIcon = {};

		newIcon = {
			url: icon.url
		};

		// Icon size is also specified
		if (icon.size) {
			// As object
			if (typeof icon.size === 'object') {
				newIcon.scaledSize = icon.size;
			}
			// As single value
			else {
				newIcon.scaledSize = {
					width: icon.size,
					height: icon.size
				};
			}
		}
		// Default size
		else {
			newIcon.scaledSize = {
				width: defaultIconSize,
				height: defaultIconSize
			};
		}

		// Icon anchor also specified
		if (icon.anchor) {
			// As object
			if (typeof icon.anchor === 'object') {
				newIcon.anchor = icon.anchor;
			}
			// As single value
			else {
				newIcon.anchor = {
					x: icon.anchor,
					y: icon.anchor
				};
			}
		}
		// Default anchor
		else {
			newIcon.anchor = {
				x: defaultIconSize / 2,
				y: defaultIconSize / 2
			};
		}

		return newIcon;
	}

	//////////////////////////////////////////
	// Parse a map element for data-attributes
	static parseMapEl (mapEl, mapStyles) {
		var config = {};

		// Zoom
		if (mapEl.dataset.zoom) {
			config.zoom = parseInt(mapEl.dataset.zoom);
		}

		// Center
		if (mapEl.dataset.lat && mapEl.dataset.lng) {
			config.center = {
				lat: parseFloat(mapEl.dataset.lat),
				lng: parseFloat(mapEl.dataset.lng)
			};
		}

		// Marker icon can be a string or JSON array
		if (mapEl.dataset.markerIcon) {
			try {
				config.defaultMarkerIcon = JSON.parse(mapEl.dataset.markerIcon);
			}
			catch (e) {
				config.defaultMarkerIcon = {
					url: mapEl.dataset.markerIcon
				};
			}

			config.defaultMarkerIcon = GoogleMap.parseIconObject(config.defaultMarkerIcon);
		}

		// Styles can be a string or JSON array
		if (mapEl.dataset.styles) {
			try {
				config.styles = JSON.parse(mapEl.dataset.styles);
			}
			catch (e) {
				// If styles is just a string - check if it's defined in mapStyles
				if (typeof mapStyles[mapEl.dataset.styles] !== 'undefined') {
					config.styles = JSON.parse(mapStyles[mapEl.dataset.styles]);
				}
			}
		}

		// Types can be either string or JSON array
		if (mapEl.dataset.mapTypes) {
			try {
				config.mapTypes = JSON.parse(mapEl.dataset.mapTypes);

				// If map type styles is just a string - map it to the mapStyles
				for (var i = 0; i < config.mapTypes.length; i++) {
					if (typeof config.mapTypes[i].styles === 'string' && typeof mapStyles[config.mapTypes[i].styles] !== 'undefined') {
						config.mapTypes[i].styles = JSON.parse(mapStyles[config.mapTypes[i].styles]);
					}
				}
			}
			catch (e) {
				config.mapTypes = [mapEl.dataset.mapTypes];
			}
		}

		// Geolocation can be either empty (indicating true) or JSON object
		if (typeof mapEl.dataset.geolocation !== 'undefined') {
			try {
				config.geolocation = JSON.parse(mapEl.dataset.geolocation);
			}
			catch (e) {
				config.geolocation = true;
			}
		}

		// KML Layers can be either string or JSON array
		if (mapEl.dataset.kmlLayers) {
			try {
				config.kmlLayers = JSON.parse(mapEl.dataset.kmlLayers);

				// If an array of URLs is passed in - convert to valid object
				for (var i = 0; i < config.kmlLayers.length; i++) {
					if (typeof config.kmlLayers[i] === 'string') {
						config.kmlLayers[i] = {
							url: config.kmlLayers[i]
						};
					}
				}
			}
			catch (e) {
				config.kmlLayers = [{
					url: mapEl.dataset.kmlLayers
				}];
			}
		}

		// Markers are stored as direct children of the mapEl
		if (mapEl.children.length) {
			var markers = [];

			for (var i = 0; i < mapEl.children.length; i++) {
				if (mapEl.children[i].dataset.lat && mapEl.children[i].dataset.lng) {
					var marker = {
						lat: parseFloat(mapEl.children[i].dataset.lat),
						lng: parseFloat(mapEl.children[i].dataset.lng)
					};

					// Icon can be string (src) or JSON object
					if (mapEl.children[i].dataset.icon) {
						try {
							marker.icon = JSON.parse(mapEl.children[i].dataset.icon);
						}
						catch (e) {
							marker.icon = {
								url: mapEl.children[i].dataset.icon
							};
						}
					}

					// Custom properties
					if (mapEl.children[i].dataset.customProperties) {
						try {
							marker.customProperties = JSON.parse(mapEl.children[i].dataset.customProperties);
						}
						catch (e) {
							marker.customProperties = mapEl.children[i].dataset.customProperties;
						}
					}

					// Info window?
					if (mapEl.children[i].innerHTML.length) {
						marker.infoWindow = mapEl.children[i].innerHTML;
					}

					markers.push(marker);
				}
			}

			if (markers.length) {
				config.markers = markers;
			}
		}

		return config;
	}
}
