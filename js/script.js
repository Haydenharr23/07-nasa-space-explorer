// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const apiKeyInput = document.getElementById('apiKey');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Store a collection of space facts and choose one to show on page load.
const spaceFacts = [
	'Mercury completes one orbit around the Sun in about 88 Earth days.',
	'Venus is the hottest planet because its thick carbon dioxide atmosphere traps heat.',
	'Venus rotates in the opposite direction to most planets, and one rotation takes longer than its year.',
	'Mars has two small moons named Phobos and Deimos.',
	'Olympus Mons on Mars is the largest known volcano in the Solar System.',
	'Jupiter is the largest planet in the Solar System.',
	"Jupiter's Great Red Spot is a giant storm that has been observed for centuries.",
	'Jupiter has a faint ring system made of dust.',
	"Saturn's average density is lower than water's, although no ocean could hold a planet-sized Saturn.",
	"Saturn's rings are made mostly of water-ice particles, from tiny grains to large chunks.",
	'Uranus is tilted about 98 degrees, so it rotates nearly on its side.',
	'Winds in Neptune’s atmosphere can exceed 2,000 kilometers per hour.',
	'Pluto has mountains made of water ice, which is hard and rock-like at its surface temperature.',
	'The Moon is slowly moving away from Earth by about 3.8 centimeters each year.',
	'Sunlight takes about 8 minutes and 20 seconds to reach Earth.',
	'The Sun contains about 99.8 percent of the Solar System’s total mass.',
	"The Sun's core reaches roughly 15 million degrees Celsius.",
	'The International Space Station circles Earth about once every 90 minutes.',
	'The Solar System formed about 4.6 billion years ago.',
	'The supermassive black hole at the center of the Milky Way is called Sagittarius A*.',
	'Mercury has water ice in some permanently shadowed craters near its poles.',
	"The Sun's magnetic field reverses polarity roughly every 11 years as part of its activity cycle."
];

const randomFactIndex = Math.floor(Math.random() * spaceFacts.length);
const spaceFactElement = document.getElementById('spaceFact');
if (spaceFactElement) {
	spaceFactElement.textContent = spaceFacts[randomFactIndex];
}

const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');
const apodModal = document.getElementById('apodModal');
const modalCloseButton = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalMediaFallback = document.getElementById('modalMediaFallback');
const modalFallbackIcon = document.getElementById('modalFallbackIcon');
const modalFallbackText = document.getElementById('modalFallbackText');
const modalVideoBadge = document.getElementById('modalVideoBadge');
const modalVideoLink = document.getElementById('modalVideoLink');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalExplanation = document.getElementById('modalExplanation');
let displayedEntries = [];

function showMessage(message, state = 'info') {
	const role = state === 'error' ? 'alert' : 'status';
	const spinner = state === 'loading'
		? '<span class="loading-spinner" aria-hidden="true"></span>'
		: '';

	gallery.setAttribute('aria-busy', state === 'loading');
	gallery.innerHTML = `<div class="placeholder status-message is-${state}" role="${role}" aria-live="${role === 'alert' ? 'assertive' : 'polite'}">${spinner}<p>${escapeHTML(message)}</p></div>`;
}

function escapeHTML(value) {
	return String(value).replace(/[&<>"']/g, (character) => {
		const charactersToEscape = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		};

		return charactersToEscape[character];
	});
}

function getSafeMediaUrl(mediaUrl) {
	try {
		const url = new URL(mediaUrl);
		return url.protocol === 'https:' ? url.href : '';
	} catch (error) {
		return '';
	}
}

function getExpectedDates(startDate) {
	const expectedDates = [];
	const date = new Date(`${startDate}T00:00:00Z`);

	for (let day = 0; day < 9; day += 1) {
		expectedDates.push(date.toISOString().split('T')[0]);
		date.setUTCDate(date.getUTCDate() + 1);
	}

	return expectedDates;
}

function showApodModal(entry) {
	const isVideo = entry.media_type === 'video';
	const imageUrl = isVideo ? entry.thumbnail_url : entry.hdurl || entry.url;
	const mediaUrl = getSafeMediaUrl(imageUrl);
	const videoUrl = isVideo ? getSafeMediaUrl(entry.url) : '';

	if (mediaUrl) {
		modalImage.src = mediaUrl;
	} else {
		modalImage.removeAttribute('src');
	}

	modalImage.hidden = !mediaUrl;
	modalMediaFallback.hidden = Boolean(mediaUrl);
	modalFallbackIcon.hidden = !isVideo;
	modalFallbackText.textContent = isVideo ? 'Video preview unavailable' : 'Image preview unavailable';
	modalVideoBadge.hidden = !isVideo || !mediaUrl;
	modalVideoLink.hidden = !videoUrl;
	if (videoUrl) {
		modalVideoLink.href = videoUrl;
	} else {
		modalVideoLink.removeAttribute('href');
	}

	modalImage.alt = isVideo
		? `Video thumbnail for ${entry.title}, published on ${entry.date}`
		: `Astronomy picture: ${entry.title}, published on ${entry.date}`;
	modalTitle.textContent = entry.title;
	modalDate.textContent = entry.date;
	modalExplanation.textContent = entry.explanation;
	apodModal.showModal();
	document.body.classList.add('modal-open');
}

function renderApodEntries(entries) {
	displayedEntries = entries;
	gallery.setAttribute('aria-busy', 'false');
	const galleryItems = entries.map((entry, index) => {
		const title = escapeHTML(entry.title);
		const date = escapeHTML(entry.date);
		const explanation = escapeHTML(entry.explanation);
		const isVideo = entry.media_type === 'video';
		const imageUrl = isVideo ? entry.thumbnail_url : entry.hdurl || entry.url;
		const mediaUrl = getSafeMediaUrl(imageUrl);
		const videoUrl = isVideo ? getSafeMediaUrl(entry.url) : '';
		const imageAlt = isVideo
			? `Video thumbnail for ${title}, published on ${date}`
			: `Astronomy picture: ${title}, published on ${date}`;
		let mediaContent = '<p>Media is unavailable for this entry.</p>';
		let videoLink = '';

		if (isVideo) {
			const videoPreview = mediaUrl
				? `<img src="${escapeHTML(mediaUrl)}" alt="${imageAlt}" loading="lazy">`
				: '<div class="video-thumbnail-fallback"><span>Video preview unavailable</span></div>';
			mediaContent = `<div class="video-thumbnail">${videoPreview}<span class="video-play-icon" aria-hidden="true">&#9654;</span><span class="video-label">VIDEO</span></div>`;
		} else if (mediaUrl) {
			mediaContent = `<img src="${escapeHTML(mediaUrl)}" alt="${imageAlt}" loading="lazy">`;
		}

		if (videoUrl) {
			videoLink = `<p class="gallery-video-link"><a href="${escapeHTML(videoUrl)}" target="_blank" rel="noopener noreferrer">Open APOD video in a new tab</a></p>`;
		}

		return `
			<article class="gallery-item">
				<button class="gallery-card-button" type="button" data-apod-index="${index}" aria-label="View details for ${title}, published on ${date}">
					${mediaContent}
					<h2>${title}</h2>
					<p><strong>${date}</strong></p>
					<p>${explanation}</p>
				</button>
				${videoLink}
			</article>
		`;
	});

	gallery.innerHTML = galleryItems.join('');
}

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;
	const apiKey = apiKeyInput.value.trim();

	if (!apiKey) {
		showMessage('Enter your NASA API key to load space photos.', 'error');
		return;
	}

	if (!startDate || !endDate) {
		showMessage('Select both a start date and an end date.');
		return;
	}

	const expectedDates = getExpectedDates(startDate);

	if (expectedDates[8] !== endDate) {
		showMessage('Choose a date range that includes exactly 9 days, ending no later than today.');
		console.warn('APOD request skipped: the selected date range is not exactly 9 days.', {
			startDate,
			endDate,
			expectedEndDate: expectedDates[8]
		});
		return;
	}

	const queryParameters = new URLSearchParams({
		start_date: startDate,
		end_date: endDate,
		thumbs: 'true',
		api_key: apiKey
	});
	const requestUrl = `https://api.nasa.gov/planetary/apod?${queryParameters}`;

	console.info('Requesting NASA APOD entries:', { startDate, endDate });
	getImagesButton.disabled = true;
	showMessage('Loading space photos...', 'loading');

	try {
		const response = await fetch(requestUrl);
		console.info('NASA APOD response status:', response.status);
		const entries = await response.json();

		if (!response.ok) {
			console.error('NASA APOD API error:', entries);
			const errorMessage = entries && entries.error && entries.error.message
				? `NASA couldn't load these photos: ${entries.error.message}`
				: 'NASA could not load space photos right now. Please try again.';
			showMessage(errorMessage, 'error');
			return;
		}

		if (Array.isArray(entries) && entries.length === 0) {
			console.info('NASA APOD returned no entries for this date range.');
			showMessage('No space photos were found for those dates. Try another 9-day range.', 'empty');
			return;
		}

		const hasValidEntries = Array.isArray(entries)
			&& entries.length === 9
			&& entries.every((entry) => entry
				&& typeof entry.date === 'string'
				&& typeof entry.title === 'string'
				&& typeof entry.explanation === 'string'
				&& typeof entry.url === 'string'
				&& ['image', 'video'].includes(entry.media_type));

		const returnedDates = hasValidEntries
			? entries.map((entry) => entry.date).sort()
			: [];
		const hasAllExpectedDates = hasValidEntries
			&& expectedDates.every((date, index) => returnedDates[index] === date);

		if (!hasAllExpectedDates) {
			console.error('NASA APOD returned an unexpected response:', entries);
			showMessage('NASA returned unexpected data for this date range. Please try again.', 'error');
			return;
		}

		const uniqueEntries = new Set(entries.map((entry) => JSON.stringify([
			entry.title,
			entry.url,
			entry.explanation
		])));

		if (uniqueEntries.size === 1) {
			console.error('NASA APOD returned identical content for all nine dates:', entries);
			showMessage('NASA returned the same placeholder content for every date, not daily APOD photos. Please try again later.', 'error');
			return;
		}

		entries.sort((firstEntry, secondEntry) => firstEntry.date.localeCompare(secondEntry.date));
		console.info('NASA APOD entries received:', entries.length, returnedDates);
		renderApodEntries(entries);
	} catch (error) {
		console.error('Unable to load NASA APOD data:', error);
		showMessage('We couldn\'t load space photos from NASA. Check your connection and try again.', 'error');
	} finally {
		getImagesButton.disabled = false;
		gallery.setAttribute('aria-busy', 'false');
	}
}

getImagesButton.addEventListener('click', getSpaceImages);

gallery.addEventListener('click', (event) => {
	const cardButton = event.target.closest('.gallery-card-button');

	if (!cardButton) {
		return;
	}

	const selectedEntry = displayedEntries[Number(cardButton.dataset.apodIndex)];

	if (selectedEntry) {
		showApodModal(selectedEntry);
	}
});

modalCloseButton.addEventListener('click', () => apodModal.close());

gallery.addEventListener('error', (event) => {
	const image = event.target;

	if (!image || image.tagName !== 'IMG') {
		return;
	}

	const videoThumbnail = image.closest('.video-thumbnail');
	const fallbackClass = videoThumbnail ? 'video-thumbnail-fallback' : 'image-thumbnail-fallback';
	const fallbackContainer = videoThumbnail || image.parentElement;
	image.hidden = true;

	if (!fallbackContainer.querySelector(`.${fallbackClass}`)) {
		const fallback = document.createElement('span');
		fallback.className = fallbackClass;
		fallback.textContent = videoThumbnail ? 'Video preview unavailable' : 'Image preview unavailable';
		image.insertAdjacentElement('afterend', fallback);
	}
}, true);

modalImage.addEventListener('error', () => {
	modalImage.hidden = true;
	modalVideoBadge.hidden = true;
	modalFallbackText.textContent = modalFallbackIcon.hidden
		? 'Image preview unavailable'
		: 'Video preview unavailable';
	modalMediaFallback.hidden = false;
});

apodModal.addEventListener('click', (event) => {
	if (event.target === apodModal) {
		apodModal.close();
	}
});

apodModal.addEventListener('close', () => {
	document.body.classList.remove('modal-open');
});

getSpaceImages();
