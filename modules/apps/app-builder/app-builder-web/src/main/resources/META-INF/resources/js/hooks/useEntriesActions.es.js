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

import {useContext} from 'react';
import {__RouterContext as RouterContext} from 'react-router-dom';

import {AppContext} from '../AppContext.es';
import {navigateToEditPage} from '../pages/entry/utils.es';
import {confirmDelete} from '../utils/client.es';
import {successToast} from '../utils/toast.es';
import usePermissions from './usePermissions.es';

export default function useEntriesActions(refetch) {
	const actions = [];
	const {basePortletURL, showFormView} = useContext(AppContext);
	const {history} = useContext(RouterContext);
	const permissions = usePermissions();

	if (showFormView) {
		if (permissions.view) {
			actions.push({
				action: ({viewURL}) => Promise.resolve(history.push(viewURL)),
				name: Liferay.Language.get('view'),
			});
		}

		if (permissions.update) {
			actions.push({
				action: ({id}) =>
					Promise.resolve(
						navigateToEditPage(basePortletURL, {dataRecordId: id})
					),
				name: Liferay.Language.get('edit'),
			});
		}

		if (permissions.delete) {
			actions.push({
				action: (item) => {
					return confirmDelete('/o/data-engine/v2.0/data-records/')(
						item
					).then((confirmed) => {
						const refetchDelay = 500;

						if (confirmed) {
							successToast(
								Liferay.Language.get('an-entry-was-deleted')
							);

							if (refetch) {
								setTimeout(refetch, refetchDelay);
							}
						}

						return new Promise((resolve) =>
							setTimeout(() => resolve(confirmed), refetchDelay)
						);
					});
				},
				name: Liferay.Language.get('delete'),
			});
		}
	}

	return actions;
}
