<%--
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
--%>

<%@ include file="/layout/init.jsp" %>

<%
String appName = ParamUtil.getString(request, "appName");

String portletName = ParamUtil.getString(request, "portletName");

String editEntryCssClass = "";

String mvcPath = ParamUtil.getString(request, PortalUtil.getPortletNamespace(portletName) + "mvcPath");

if (mvcPath.startsWith("/edit_entry.jsp")) {
	editEntryCssClass = "edit-entry";
}
%>

<div class="app-builder-standalone">
	<header class="app-builder-standalone-header">
		<clay:container-fluid
			cssClass="p-0"
		>
			<clay:content-row
				cssClass="app-builder-standalone-menu"
			>
				<clay:content-col
					expand="<%= true %>"
				>
					<a class="company-link" href="<%= PortalUtil.addPreservedParameters(themeDisplay, themeDisplay.getURLPortal(), false, true) %>">
						<span class="company-details text-truncate">
							<img alt="" class="company-logo" src="<%= themeDisplay.getPathImage() + "/company_logo?img_id=" + company.getLogoId() + "&t=" + WebServerServletTokenUtil.getToken(company.getLogoId()) %>" />

							<span class="company-name"><%= HtmlUtil.escape(company.getName()) %></span>
						</span>
					</a>
				</clay:content-col>

				<div style="display: none;">
					<liferay-portlet:runtime
						portletName="<%= PortletKeys.LOGIN %>"
					/>
				</div>

				<clay:content-col
					cssClass="text-right"
				>
					<liferay-portlet:runtime
						portletProviderAction="<%= PortletProvider.Action.VIEW %>"
						portletProviderClassName="com.liferay.admin.kernel.util.PortalUserPersonalBarApplicationType$UserPersonalBar"
					/>
				</clay:content-col>
			</clay:content-row>

			<h1 class="app-builder-standalone-name <%= editEntryCssClass %>"><%= HtmlUtil.escape(appName) %></h1>
		</clay:container-fluid>
	</header>

	<clay:container-fluid
		cssClass="app-builder-standalone-content <%= editEntryCssClass %> sheet"
	>
		<liferay-portlet:runtime
			portletName="<%= portletName %>"
		/>
	</clay:container-fluid>
</div>