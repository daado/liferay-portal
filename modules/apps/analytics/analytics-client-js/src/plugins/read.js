/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {getNumberOfWords} from '../utils/assets';
import {
	DEBOUNCE,
	READ_CHARS_PER_MIN,
	READ_LOGOGRAPHIC_LANGUAGES,
	READ_MIMIMUN_SCROLL_DEPTH,
	READ_TIME_FACTOR,
	READ_WORDS_PER_MIN,
} from '../utils/constants';
import {debounce} from '../utils/debounce';
import {onReady} from '../utils/events';
import {ReadTracker} from '../utils/read';
import {ScrollTracker} from '../utils/scroll';

const applicationId = 'Page';

const MIN_TO_MS = 60000;

/**
 * Get all the blogs and webContents on the page
 * @returns {NodeList} A list with all the elements found
 */
function getAssetsElements() {
	return document.querySelectorAll(
		'[data-analytics-asset-type="web-content"], [data-analytics-asset-type="blog"]'
	);
}

/**
 * Wether a Document is trackable or not.
 * @param {Object} element The Document DOM element
 * @returns {boolean} True if the element is trackable.
 */
function isTrackable(element) {
	return element && 'analyticsAssetId' in element.dataset;
}

/**
 * Get the lang property on documentElement.
 * @returns {string} DocumentElement language.
 */
function getLang() {
	return document.documentElement.lang;
}

/**
 * Calculates the viewDuration based on total characters.
 * @param {string} content Text to be used on the calculation.
 * @returns {number} Expected View Duration.
 */
export function viewDurationByCharacters(content) {
	return (
		(content.replace(/\s+/gm, '').length / READ_CHARS_PER_MIN) *
		MIN_TO_MS *
		READ_TIME_FACTOR
	);
}

/**
 * Calculates the viewDuration based on total words.
 * @param {string} content Text to be used on the calculation.
 * @returns {number} Expected View Duration.
 */
export function viewDurationByWords(content) {
	return (
		(getNumberOfWords({innerText: content}) / READ_WORDS_PER_MIN) *
		MIN_TO_MS *
		READ_TIME_FACTOR
	);
}

/**
 * Calculates the viewDuration based on the documentElement language.
 * @param {string} content Text to be used on the calculation.
 * @returns {number} Expected View Duration.
 */
export function getExpectedViewDuration(content) {
	const language = getLang();

	if (READ_LOGOGRAPHIC_LANGUAGES.has(language)) {
		return viewDurationByCharacters(content);
	}

	return viewDurationByWords(content);
}

/**
 * Sends information when user read a page.
 * @param {Object} The Analytics client instance.
 */
function read(analytics) {
	const readTracker = new ReadTracker();
	let scrollTracker = new ScrollTracker();

	let content = '';

	const stopTrackingOnReady = onReady(() => {
		const assetsElements = getAssetsElements();

		Array.prototype.slice
			.call(assetsElements)
			.filter((element) => isTrackable(element))
			.forEach(({innerText}) => {
				content = content.concat(innerText);
			});

		readTracker.setExpectedViewDuration(
			() => analytics.send('pageRead', applicationId),
			getExpectedViewDuration(content)
		);
	});

	const onScroll = debounce(() => {
		scrollTracker.onDepthReached((depth) => {
			if (depth >= READ_MIMIMUN_SCROLL_DEPTH) {
				readTracker.onDepthReached(() => {
					analytics.send('pageRead', applicationId);
				});
			}
		});
	}, DEBOUNCE);

	document.addEventListener('scroll', onScroll);

	return () => {
		stopTrackingOnReady();
		document.removeEventListener('scroll', onScroll);
		readTracker.dispose();
		scrollTracker = new ScrollTracker();
	};
}

export {read};
export default read;
