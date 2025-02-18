/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 *
 *
 *
 */

package com.liferay.app.builder.workflow.rest.internal.resource.v1_0.helper;

import com.liferay.app.builder.model.AppBuilderApp;
import com.liferay.app.builder.workflow.rest.dto.v1_0.AppWorkflow;
import com.liferay.app.builder.workflow.rest.dto.v1_0.AppWorkflowRoleAssignment;
import com.liferay.app.builder.workflow.rest.dto.v1_0.AppWorkflowState;
import com.liferay.app.builder.workflow.rest.dto.v1_0.AppWorkflowTask;
import com.liferay.app.builder.workflow.rest.dto.v1_0.AppWorkflowTransition;
import com.liferay.dynamic.data.lists.model.DDLRecord;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.model.WorkflowDefinitionLink;
import com.liferay.portal.kernel.security.permission.ResourceActionsUtil;
import com.liferay.portal.kernel.service.WorkflowDefinitionLinkLocalService;
import com.liferay.portal.kernel.util.ResourceBundleUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.workflow.WorkflowDefinition;
import com.liferay.portal.kernel.workflow.WorkflowDefinitionManager;
import com.liferay.portal.workflow.kaleo.definition.Action;
import com.liferay.portal.workflow.kaleo.definition.AssigneesRecipient;
import com.liferay.portal.workflow.kaleo.definition.Definition;
import com.liferay.portal.workflow.kaleo.definition.ExecutionType;
import com.liferay.portal.workflow.kaleo.definition.Node;
import com.liferay.portal.workflow.kaleo.definition.Notification;
import com.liferay.portal.workflow.kaleo.definition.NotificationReceptionType;
import com.liferay.portal.workflow.kaleo.definition.NotificationType;
import com.liferay.portal.workflow.kaleo.definition.Recipient;
import com.liferay.portal.workflow.kaleo.definition.RoleAssignment;
import com.liferay.portal.workflow.kaleo.definition.ScriptLanguage;
import com.liferay.portal.workflow.kaleo.definition.State;
import com.liferay.portal.workflow.kaleo.definition.Task;
import com.liferay.portal.workflow.kaleo.definition.TemplateLanguage;
import com.liferay.portal.workflow.kaleo.definition.Transition;
import com.liferay.portal.workflow.kaleo.definition.UserRecipient;
import com.liferay.portal.workflow.kaleo.definition.export.DefinitionExporter;
import com.liferay.portal.workflow.kaleo.definition.export.builder.DefinitionBuilder;

import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Rafael Praxedes
 */
@Component(immediate = true, service = AppWorkflowResourceHelper.class)
public class AppWorkflowResourceHelper {

	public WorkflowDefinition deployWorkflowDefinition(
			AppBuilderApp appBuilderApp, long companyId, Definition definition,
			long userId)
		throws PortalException {

		String content = _definitionExporter.export(definition);

		return _workflowDefinitionManager.deployWorkflowDefinition(
			companyId, userId, appBuilderApp.getName(), appBuilderApp.getUuid(),
			AppBuilderApp.class.getSimpleName(), content.getBytes());
	}

	public Definition getDefinition(AppBuilderApp appBuilderApp)
		throws PortalException {

		WorkflowDefinitionLink workflowDefinitionLink =
			_workflowDefinitionLinkLocalService.getWorkflowDefinitionLink(
				appBuilderApp.getCompanyId(), 0,
				ResourceActionsUtil.getCompositeModelName(
					AppBuilderApp.class.getName(), DDLRecord.class.getName()),
				appBuilderApp.getAppBuilderAppId(), 0);

		return _definitionBuilder.buildDefinition(
			appBuilderApp.getCompanyId(),
			workflowDefinitionLink.getWorkflowDefinitionName(),
			workflowDefinitionLink.getWorkflowDefinitionVersion());
	}

	public WorkflowDefinition getWorkflowDefinition(AppBuilderApp appBuilderApp)
		throws PortalException {

		return _workflowDefinitionManager.getLatestWorkflowDefinition(
			appBuilderApp.getCompanyId(), appBuilderApp.getUuid());
	}

	public Definition toDefinition(
		AppBuilderApp appBuilderApp, AppWorkflow appWorkflow, Locale locale) {

		Definition definition = new Definition(
			appBuilderApp.getUuid(), StringPool.BLANK, StringPool.BLANK, 0);

		for (AppWorkflowState appWorkflowState :
				appWorkflow.getAppWorkflowStates()) {

			State state = new State(
				appWorkflowState.getName(), StringPool.BLANK,
				appWorkflowState.getInitial());

			if (!appWorkflowState.getInitial()) {
				state.setActions(Collections.singleton(_createApproveAction()));
			}

			definition.addNode(state);
		}

		if (Objects.nonNull(appWorkflow.getAppWorkflowTasks())) {
			for (AppWorkflowTask appWorkflowTask :
					appWorkflow.getAppWorkflowTasks()) {

				Task task = new Task(
					appWorkflowTask.getName(), StringPool.BLANK);

				task.setAssignments(
					Stream.of(
						appWorkflowTask.getAppWorkflowRoleAssignments()
					).map(
						AppWorkflowRoleAssignment::getRoleId
					).map(
						RoleAssignment::new
					).collect(
						Collectors.toSet()
					));

				Set<Notification> notifications = new HashSet<>();

				notifications.add(
					_createAssigneesNotification(appBuilderApp, locale));
				notifications.add(
					_createUserNotification(
						appBuilderApp, appWorkflowTask, locale));

				task.setNotifications(notifications);

				definition.addNode(task);
			}
		}

		for (AppWorkflowState appWorkflowState :
				appWorkflow.getAppWorkflowStates()) {

			_addTransitions(
				appWorkflowState.getAppWorkflowTransitions(), definition,
				appWorkflowState.getName());
		}

		if (Objects.nonNull(appWorkflow.getAppWorkflowTasks())) {
			for (AppWorkflowTask appWorkflowTask :
					appWorkflow.getAppWorkflowTasks()) {

				_addTransitions(
					appWorkflowTask.getAppWorkflowTransitions(), definition,
					appWorkflowTask.getName());
			}
		}

		return definition;
	}

	private void _addTransition(
		boolean defaultTransition, String name, Node sourceNode,
		Node targetNode) {

		Transition transition = new Transition(
			name, sourceNode, targetNode, defaultTransition);

		sourceNode.addOutgoingTransition(transition);

		targetNode.addIncomingTransition(transition);
	}

	private void _addTransitions(
		AppWorkflowTransition[] appWorkflowTransitions, Definition definition,
		String sourceNodeName) {

		if (Objects.isNull(appWorkflowTransitions)) {
			return;
		}

		for (AppWorkflowTransition appWorkflowTransition :
				appWorkflowTransitions) {

			_addTransition(
				appWorkflowTransition.getPrimary(),
				appWorkflowTransition.getName(),
				definition.getNode(sourceNodeName),
				definition.getNode(appWorkflowTransition.getTransitionTo()));
		}
	}

	private Action _createApproveAction() {
		return new Action(
			"approve", StringPool.BLANK, ExecutionType.ON_ENTRY.getValue(),
			StringUtil.read(getClass(), "dependencies/approve-script.groovy"),
			ScriptLanguage.GROOVY.getValue(), StringPool.BLANK, 1);
	}

	private Notification _createAssigneesNotification(
		AppBuilderApp appBuilderApp, Locale locale) {

		AssigneesRecipient assigneesRecipient = new AssigneesRecipient();

		assigneesRecipient.setNotificationReceptionType(
			NotificationReceptionType.TO);

		return _createNotification(
			LanguageUtil.format(
				ResourceBundleUtil.getModuleAndPortalResourceBundle(
					locale, getClass()),
				"x-notification", appBuilderApp.getName(locale)),
			ExecutionType.ON_ASSIGNMENT, "Assignees Notification",
			assigneesRecipient,
			LanguageUtil.format(
				ResourceBundleUtil.getModuleAndPortalResourceBundle(
					locale, getClass()),
				"x-sent-you-a-x-entry-in-the-workflow",
				new Object[] {"${userName}", appBuilderApp.getName(locale)}));
	}

	private Notification _createNotification(
		String description, ExecutionType executionType, String name,
		Recipient recipient, String template) {

		Notification notification = new Notification(
			name, description, executionType.getValue(), template,
			TemplateLanguage.FREEMARKER.getValue());

		notification.addNotificationType(NotificationType.EMAIL.getValue());
		notification.addNotificationType(
			NotificationType.USER_NOTIFICATION.getValue());
		notification.addRecipients(recipient);

		return notification;
	}

	private Notification _createUserNotification(
		AppBuilderApp appBuilderApp, AppWorkflowTask appWorkflowTask,
		Locale locale) {

		UserRecipient userRecipient = new UserRecipient();

		userRecipient.setNotificationReceptionType(
			NotificationReceptionType.TO);

		return _createNotification(
			LanguageUtil.format(
				ResourceBundleUtil.getModuleAndPortalResourceBundle(
					locale, getClass()),
				"x-notification", appBuilderApp.getName(locale)),
			ExecutionType.ON_EXIT, "User Notification", userRecipient,
			LanguageUtil.format(
				ResourceBundleUtil.getModuleAndPortalResourceBundle(
					locale, getClass()),
				"the-x-of-your-submission-was-completed",
				appWorkflowTask.getName()));
	}

	@Reference
	private DefinitionBuilder _definitionBuilder;

	@Reference
	private DefinitionExporter _definitionExporter;

	@Reference
	private WorkflowDefinitionLinkLocalService
		_workflowDefinitionLinkLocalService;

	@Reference
	private WorkflowDefinitionManager _workflowDefinitionManager;

}