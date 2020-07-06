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

import dom from 'metal-dom';

import SuccessPage from '../../../../src/main/resources/META-INF/resources/js/components/SuccessPage/SuccessPage.es';
import SuccessPageSettings from '../../__mock__/mockSuccessPage.es';
import withContextMock from '../../__mock__/withContextMock.es';

let component;
let successPageSettings;
const SuccessPageWithContextMock = withContextMock(SuccessPage);

const createSuccessPage = (props) => {
	return new SuccessPageWithContextMock({
		contentLabel: 'Content',
		editingLanguageId: 'en_US',
		successPageSettings,
		titleLabel: 'Title',
		...props,
	});
};

describe('SuccessPage', () => {
	beforeEach(() => {
		successPageSettings = JSON.parse(JSON.stringify(SuccessPageSettings));

		jest.useFakeTimers();
	});

	afterEach(() => {
		if (component) {
			component.dispose();
		}

		successPageSettings = null;
	});

	it('renders the component', () => {
		component = createSuccessPage();

		jest.runAllTimers();

		expect(component).toMatchSnapshot();
	});

	it('emits event when page title is changed', () => {
		component = createSuccessPage();

		const titleNode = component.element.querySelector(
			'input[data-setting="title"]'
		);

		titleNode.value = 'Some title';
		dom.triggerEvent(titleNode, 'input', {});

		expect(component.context.dispatch).toHaveBeenCalledWith(
			'successPageChanged',
			{
				body: {
					en_US:
						'your-information-was-successfully-received-thank-you-for-filling-out-the-form',
				},
				enabled: true,
				title: {
					en_US: 'Some title',
				},
			}
		);
	});

	it('emits event when page body is changed', () => {
		component = createSuccessPage();

		const bodyNode = component.element.querySelector(
			'input[data-setting="body"]'
		);

		bodyNode.value = 'Some description';
		dom.triggerEvent(bodyNode, 'input', {});

		expect(component.context.dispatch).toHaveBeenCalledWith(
			'successPageChanged',
			{
				body: {
					en_US: 'Some description',
				},
				enabled: true,
				title: {
					en_US: 'thank-you',
				},
			}
		);
	});
});
