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

import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import {useModal} from '@clayui/modal';
import {useIsMounted} from 'frontend-js-react-web';
import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {config} from '../../../app/config/index';
import selectCanUpdateExperiences from '../../../app/selectors/selectCanUpdateExperiences';
import selectCanUpdateSegments from '../../../app/selectors/selectCanUpdateSegments';
import {useDispatch, useSelector} from '../../../app/store/index';
import createExperience from '../thunks/createExperience';
import removeExperience from '../thunks/removeExperience';
import updateExperience from '../thunks/updateExperience';
import updateExperiencePriority from '../thunks/updateExperiencePriority';
import {
	recoverModalExperienceState,
	storeModalExperienceState,
	useDebounceCallback,
} from '../utils';
import ExperienceModal from './ExperienceModal';
import ExperiencesList from './ExperiencesList';

/**
 * It produces an object with a target and subtarget keys indicating what experiences
 * should change to change the priority of target priority.
 */
function getUpdateExperiencePriorityTargets(
	orderedExperiences,
	targetExperienceId,
	direction
) {
	const targetIndex = orderedExperiences.findIndex(
		(experience) => experience.segmentsExperienceId === targetExperienceId
	);

	let subtargetIndex;

	if (direction === 'up') {
		subtargetIndex = targetIndex - 1;
	}
	else {
		subtargetIndex = targetIndex + 1;
	}

	const subtargetExperience = orderedExperiences[subtargetIndex];
	const targetExperience = orderedExperiences[targetIndex];

	return {
		subtarget: {
			priority: targetExperience.priority,
			segmentsExperienceId: subtargetExperience.segmentsExperienceId,
		},
		target: {
			priority: subtargetExperience.priority,
			segmentsExperienceId: targetExperience.segmentsExperienceId,
		},
	};
}

const ExperienceSelector = ({
	experiences,
	segments,
	selectId,
	selectedExperience,
}) => {
	const dispatch = useDispatch();

	const canUpdateExperiences = useSelector(selectCanUpdateExperiences);
	const canUpdateSegments = useSelector(selectCanUpdateSegments);

	const buttonRef = useRef();
	const [buttonBoundingClientRect, setButtonBoundingClientRect] = useState({
		bottom: 0,
		left: 0,
	});

	const isMounted = useIsMounted();
	const [open, setOpen] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [editingExperience, setEditingExperience] = useState({});

	const {observer: modalObserver, onClose: onModalClose} = useModal({
		onClose: () => {
			setOpenModal(false);
		},
	});

	const [debouncedSetOpen] = useDebounceCallback((value) => {
		if (isMounted() && buttonRef.current) {
			setButtonBoundingClientRect(
				buttonRef.current.getBoundingClientRect()
			);

			setOpen(value);
		}
	}, 100);

	const handleDropdownButtonClick = () => debouncedSetOpen(!open);
	const handleDropdownButtonBlur = () => debouncedSetOpen(false);
	const handleDropdownBlur = () => debouncedSetOpen(false);
	const handleDropdownFocus = () => debouncedSetOpen(true);

	const handleNewSegmentClick = ({
		experienceId,
		experienceName,
		segmentId,
	}) => {
		storeModalExperienceState({
			experienceId,
			experienceName,
			plid: config.plid,
			segmentId,
		});

		Liferay.Util.navigate(config.editSegmentsEntryURL);
	};

	useEffect(() => {
		if (config.plid) {
			const modalExperienceState = recoverModalExperienceState();

			if (
				modalExperienceState &&
				config.plid === modalExperienceState.plid
			) {
				setOpenModal(true);
				setEditingExperience({
					name: modalExperienceState.experienceName,
					segmentsEntryId:
						config.selectedSegmentsEntryId ||
						modalExperienceState.segmentId,
					segmentsExperienceId: modalExperienceState.experienceId,
				});
			}
		}
	}, []);

	const handleExperienceCreation = ({
		name,
		segmentsEntryId,
		segmentsExperienceId,
	}) => {
		if (segmentsExperienceId) {
			return dispatch(
				updateExperience({name, segmentsEntryId, segmentsExperienceId})
			)
				.then(() => {
					if (isMounted()) {
						setEditingExperience({});
						onModalClose();
					}

					Liferay.Util.openToast({
						title: Liferay.Language.get(
							'the-experience-was-updated-successfully'
						),
						type: 'success',
					});
				})
				.catch(() => {
					if (isMounted()) {
						setEditingExperience({
							error: Liferay.Language.get(
								'an-unexpected-error-occurred-while-updating-the-experience'
							),
							name,
							segmentsEntryId,
							segmentsExperienceId,
						});
					}
				});
		}
		else {
			return dispatch(
				createExperience({
					name,
					segmentsEntryId,
				})
			)
				.then(() => {
					if (isMounted()) {
						onModalClose();
					}

					Liferay.Util.openToast({
						title: Liferay.Language.get(
							'the-experience-was-created-successfully'
						),
						type: 'success',
					});
				})
				.catch((_error) => {
					if (isMounted()) {
						setEditingExperience({
							error: Liferay.Language.get(
								'an-unexpected-error-occurred-while-creating-the-experience'
							),
							name,
							segmentsEntryId,
							segmentsExperienceId,
						});
					}
				});
		}
	};

	const handleOnNewExperiecneClick = () => setOpenModal(true);

	const handleEditExperienceClick = (experienceData) => {
		const {name, segmentsEntryId, segmentsExperienceId} = experienceData;

		setOpenModal(true);

		setEditingExperience({
			name,
			segmentsEntryId,
			segmentsExperienceId,
		});
	};

	const deleteExperience = (id) => {
		dispatch(
			removeExperience({
				segmentsExperienceId: id,
				selectedExperienceId: selectedExperience.segmentsExperienceId,
			})
		).catch((_error) => {

			// TODO handle error

		});
	};

	const decreasePriority = (id) => {
		const {subtarget, target} = getUpdateExperiencePriorityTargets(
			experiences,
			id,
			'down'
		);

		dispatch(
			updateExperiencePriority({
				subtarget,
				target,
			})
		);
	};
	const increasePriority = (id) => {
		const {subtarget, target} = getUpdateExperiencePriorityTargets(
			experiences,
			id,
			'up'
		);

		dispatch(
			updateExperiencePriority({
				subtarget,
				target,
			})
		);
	};

	return (
		<>
			<ClayButton
				className="align-items-end d-inline-flex form-control-select justify-content-between mr-2 text-left text-truncate"
				displayType="secondary"
				id={selectId}
				onBlur={handleDropdownButtonBlur}
				onClick={handleDropdownButtonClick}
				ref={buttonRef}
				small
				type="button"
			>
				<span className="text-truncate">{selectedExperience.name}</span>

				{selectedExperience.hasLockedSegmentsExperiment && (
					<ClayIcon className="mr-3" symbol="lock" />
				)}
			</ClayButton>

			{open &&
				createPortal(
					<div
						className="dropdown-menu p-4 page-editor__toolbar-experience__dropdown-menu rounded toggled"
						onBlur={handleDropdownBlur}
						onFocus={handleDropdownFocus}
						style={{
							left: buttonBoundingClientRect.left,
							top: buttonBoundingClientRect.bottom,
						}}
						tabIndex="-1"
					>
						<ExperiencesSelectorHeader
							canCreateExperiences={canUpdateExperiences}
							onNewExperience={handleOnNewExperiecneClick}
							showEmptyStateMessage={experiences.length <= 1}
						/>

						{experiences.length > 1 && (
							<ExperiencesList
								activeExperienceId={
									selectedExperience.segmentsExperienceId
								}
								canUpdateExperiences={canUpdateExperiences}
								defaultExperienceId={
									config.defaultSegmentsExperienceId
								}
								experiences={experiences}
								onDeleteExperience={deleteExperience}
								onEditExperience={handleEditExperienceClick}
								onPriorityDecrease={decreasePriority}
								onPriorityIncrease={increasePriority}
							/>
						)}
					</div>,
					document.body
				)}

			{openModal && (
				<ExperienceModal
					canUpdateSegments={canUpdateSegments}
					errorMessage={editingExperience.error}
					experienceId={editingExperience.segmentsExperienceId}
					initialName={editingExperience.name}
					observer={modalObserver}
					onClose={onModalClose}
					onErrorDismiss={() => setEditingExperience({error: null})}
					onNewSegmentClick={handleNewSegmentClick}
					onSubmit={handleExperienceCreation}
					segmentId={editingExperience.segmentsEntryId}
					segments={segments}
				/>
			)}
		</>
	);
};

const ExperiencesSelectorHeader = ({
	canCreateExperiences,
	onNewExperience,
	showEmptyStateMessage,
}) => {
	return (
		<>
			<div className="align-items-end d-flex justify-content-between mb-4">
				<h3 className="mb-0">
					{Liferay.Language.get('select-experience')}
				</h3>

				{canCreateExperiences === true && (
					<ClayButton
						aria-label={Liferay.Language.get('new-experience')}
						displayType="secondary"
						onClick={onNewExperience}
						small
					>
						{Liferay.Language.get('new-experience')}
					</ClayButton>
				)}
			</div>

			{canCreateExperiences && (
				<p className="mb-4 text-secondary">
					{showEmptyStateMessage
						? Liferay.Language.get(
								'experience-help-message-empty-state'
						  )
						: Liferay.Language.get(
								'experience-help-message-started-state'
						  )}
				</p>
			)}

			<ClayAlert
				className="mt-4 mx-0"
				displayType="warning"
				title={Liferay.Language.get('warning')}
			>
				{Liferay.Language.get(
					'changes-to-experiences-are-applied-immediately'
				)}
			</ClayAlert>
		</>
	);
};

export default ExperienceSelector;
