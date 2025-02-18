/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

const createItems = (size) => {
	const items = [];

	for (let i = 0; i < size; i++) {
		items.push({
			active: true,
			appDeployments: [
				{
					settings: {},
					type: 'standalone',
				},
			],
			dataDefinitionName: 'Application',
			dateCreated: '2020-03-26T11:26:54.262Z',
			dateModified: '2020-03-26T11:26:54.262Z',
			id: i + 1,
			name: {
				en_US: `Item ${i + 1}`,
			},
		});
	}

	return items;
};

export const ENTRY = {
	APP_WORKFLOW: {
		appWorkflowDefinitionId: 1,
		appWorkflowStates: [
			{initial: true, name: 'Created'},
			{initial: false, name: 'Closed'},
		],
	},
	DATA_DEFINITION: {
		availableLanguageIds: ['en_US'],
		contentType: 'app-builder',
		dataDefinitionFields: [
			{
				customProperties: {
					autocomplete: false,
					dataSourceType: 'manual',
					dataType: 'string',
					ddmDataProviderInstanceId: '[]',
					ddmDataProviderInstanceOutput: '[]',
					displayStyle: 'singleline',
					fieldNamespace: '',
					options: {
						en_US: [
							{
								label: 'Option',
								value: 'Option',
							},
						],
					},
					placeholder: {
						en_US: '',
					},
					tooltip: {
						en_US: '',
					},
					visibilityExpression: '',
				},
				defaultValue: {
					en_US: '',
				},
				fieldType: 'text',
				indexType: 'keyword',
				indexable: true,
				label: {
					en_US: 'Name',
				},
				localizable: true,
				name: 'Text',
				nestedDataDefinitionFields: [],
				readOnly: false,
				repeatable: false,
				required: true,
				showLabel: true,
				tip: {
					en_US: '',
				},
			},
		],
		dataDefinitionKey: '38301',
		dateCreated: '2020-06-22T21:14:23Z',
		dateModified: '2020-06-22T21:14:44Z',
		defaultLanguageId: 'en_US',
		description: {},
		id: 1,
		name: {
			en_US: 'Request',
		},
		siteId: 1,
		storageType: 'json',
		userId: 1,
	},
	DATA_LAYOUT: {
		dataDefinitionId: 1,
		dataLayoutKey: '38309',
		dataLayoutPages: [
			{
				dataLayoutRows: [
					{
						dataLayoutColumns: [
							{
								columnSize: 12,
								fieldNames: ['Text'],
							},
						],
					},
				],
				description: {
					en_US: '',
				},
				title: {
					en_US: '',
				},
			},
		],
		dataRules: [],
		dateCreated: '2020-06-22T21:14:44Z',
		dateModified: '2020-06-22T21:14:44Z',
		description: {},
		id: 1,
		name: {
			en_US: 'Request Form',
		},
		paginationMode: 'wizard',
	},
	DATA_LIST_VIEW: {
		appliedFilters: {},
		dataDefinitionId: 1,
		dateCreated: '2020-06-22T21:14:53Z',
		dateModified: '2020-06-22T21:14:53Z',
		fieldNames: ['Text'],
		id: 1,
		name: {
			en_US: 'Table',
		},
		sortField: '',
	},
	DATA_RECORDS: (size = 1) => ({
		items: Array.apply(null, Array(size)).map((_, id) => ({
			dataRecordCollectionId: id,
			dataRecordValues: {
				Text: {
					en_US: `Name Test ${id}`,
				},
			},
			id,
		})),
		lastPage: 1,
		page: 1,
		pageSize: size,
		totalCount: size,
	}),
};

export const ITEMS = {
	MANY: (size) => createItems(size),
	ONE: createItems(1),
	TWENTY: createItems(20),
};

export const RESPONSES = {
	MANY_ITEMS: (size) => {
		const items = ITEMS.MANY(size);

		return {
			items,
			lastPage: 1,
			page: 1,
			pageSize: 20,
			totalCount: items.length,
		};
	},
	NO_ITEMS: {
		lastPage: 1,
		page: 1,
		pageSize: 20,
		totalCount: 0,
	},
	ONE_ITEM: {
		items: ITEMS.ONE,
		lastPage: 1,
		page: 1,
		pageSize: 20,
		totalCount: ITEMS.ONE.length,
	},
	TWENTY_ONE_ITEMS: {
		items: ITEMS.TWENTY,
		lastPage: 2,
		page: 1,
		pageSize: 20,
		totalCount: ITEMS.TWENTY.length + 1,
	},
};
