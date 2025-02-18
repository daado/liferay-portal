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

import ControlMenu from 'app-builder-web/js/components/control-menu/ControlMenu.es';
import {Loading} from 'app-builder-web/js/components/loading/Loading.es';
import UpperToolbar from 'app-builder-web/js/components/upper-toolbar/UpperToolbar.es';
import EditAppContext, {
	UPDATE_APP,
	UPDATE_NAME,
	reducer,
} from 'app-builder-web/js/pages/apps/edit/EditAppContext.es';
import {getItem} from 'app-builder-web/js/utils/client.es';
import React, {useEffect, useReducer, useState} from 'react';

import '../../../../css/EditApp.scss';
import DeployAppModal from './DeployAppModal.es';
import configReducer, {
	UPDATE_WORKFLOW_APP,
	getInitialConfig,
} from './configReducer.es';
import EditAppSidebar from './sidebar/EditAppSidebar.es';
import WorkflowBuilder from './workflow-builder/WorkflowBuilder.es';

export default ({
	history,
	match: {
		params: {appId},
	},
	scope,
}) => {
	const [{app}, dispatch] = useReducer(reducer, {
		app: {
			active: true,
			appDeployments: [],
			dataLayoutId: null,
			dataListViewId: null,
			name: {
				en_US: '',
			},
			scope,
		},
	});
	const [config, dispatchConfig] = useReducer(
		configReducer,
		getInitialConfig()
	);

	const [isModalVisible, setModalVisible] = useState(false);
	const [isLoading, setLoading] = useState(false);

	const editState = {
		appId,
		config,
		dispatch,
		dispatchConfig,
		isModalVisible,
		setModalVisible,
		state: {app},
	};

	useEffect(() => {
		if (appId) {
			setLoading(true);

			Promise.all([
				getItem(`/o/app-builder/v1.0/apps/${appId}`),
				getItem(
					`/o/app-builder-workflow/v1.0/apps/${appId}/app-workflows`
				),
			])
				.then(([app, workflowApp]) => {
					dispatch({
						app,
						type: UPDATE_APP,
					});

					dispatchConfig({
						...workflowApp,
						type: UPDATE_WORKFLOW_APP,
					});

					setLoading(false);
				})
				.catch((_) => setLoading(false));
		}
	}, [appId]);

	let title = Liferay.Language.get('new-workflow-powered-app');

	if (appId) {
		title = Liferay.Language.get('edit-workflow-powered-app');
	}

	const onCancel = () => {
		history.goBack();
	};

	const onAppNameChange = ({target}) => {
		dispatch({appName: target.value, type: UPDATE_NAME});
	};

	const maxLength = 30;

	return (
		<div className="app-builder-workflow-app">
			<ControlMenu backURL={`../../${scope}`} title={title} />

			<Loading isLoading={isLoading}>
				<EditAppContext.Provider value={editState}>
					<UpperToolbar>
						<UpperToolbar.Input
							maxLength={maxLength}
							onChange={onAppNameChange}
							placeholder={Liferay.Language.get('untitled-app')}
							value={app.name.en_US}
						/>
						<UpperToolbar.Group>
							<UpperToolbar.Button
								displayType="secondary"
								onClick={onCancel}
							>
								{Liferay.Language.get('cancel')}
							</UpperToolbar.Button>

							<UpperToolbar.Button
								disabled={
									!config.dataObject.id ||
									!app.dataLayoutId ||
									!app.dataListViewId ||
									!app.name.en_US ||
									config.steps.some(
										({name}) =>
											!name || name.trim().length === 0
									)
								}
								onClick={() => setModalVisible(true)}
							>
								{Liferay.Language.get('deploy')}
							</UpperToolbar.Button>
						</UpperToolbar.Group>
					</UpperToolbar>

					<WorkflowBuilder />

					<EditAppSidebar />

					<DeployAppModal onCancel={onCancel} />
				</EditAppContext.Provider>
			</Loading>
		</div>
	);
};
