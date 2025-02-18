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

package com.liferay.headless.delivery.client.dto.v1_0;

import com.liferay.headless.delivery.client.function.UnsafeSupplier;
import com.liferay.headless.delivery.client.serdes.v1_0.RenderedContentSerDes;

import java.util.Map;
import java.util.Objects;

import javax.annotation.Generated;

/**
 * @author Javier Gamarra
 * @generated
 */
@Generated("")
public class RenderedContent implements Cloneable {

	public static RenderedContent toDTO(String json) {
		return RenderedContentSerDes.toDTO(json);
	}

	public String getContentTemplateId() {
		return contentTemplateId;
	}

	public void setContentTemplateId(String contentTemplateId) {
		this.contentTemplateId = contentTemplateId;
	}

	public void setContentTemplateId(
		UnsafeSupplier<String, Exception> contentTemplateIdUnsafeSupplier) {

		try {
			contentTemplateId = contentTemplateIdUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected String contentTemplateId;

	public String getContentTemplateName() {
		return contentTemplateName;
	}

	public void setContentTemplateName(String contentTemplateName) {
		this.contentTemplateName = contentTemplateName;
	}

	public void setContentTemplateName(
		UnsafeSupplier<String, Exception> contentTemplateNameUnsafeSupplier) {

		try {
			contentTemplateName = contentTemplateNameUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected String contentTemplateName;

	public Map<String, String> getContentTemplateName_i18n() {
		return contentTemplateName_i18n;
	}

	public void setContentTemplateName_i18n(
		Map<String, String> contentTemplateName_i18n) {

		this.contentTemplateName_i18n = contentTemplateName_i18n;
	}

	public void setContentTemplateName_i18n(
		UnsafeSupplier<Map<String, String>, Exception>
			contentTemplateName_i18nUnsafeSupplier) {

		try {
			contentTemplateName_i18n =
				contentTemplateName_i18nUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected Map<String, String> contentTemplateName_i18n;

	public String getRenderedContentURL() {
		return renderedContentURL;
	}

	public void setRenderedContentURL(String renderedContentURL) {
		this.renderedContentURL = renderedContentURL;
	}

	public void setRenderedContentURL(
		UnsafeSupplier<String, Exception> renderedContentURLUnsafeSupplier) {

		try {
			renderedContentURL = renderedContentURLUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected String renderedContentURL;

	@Override
	public RenderedContent clone() throws CloneNotSupportedException {
		return (RenderedContent)super.clone();
	}

	@Override
	public boolean equals(Object object) {
		if (this == object) {
			return true;
		}

		if (!(object instanceof RenderedContent)) {
			return false;
		}

		RenderedContent renderedContent = (RenderedContent)object;

		return Objects.equals(toString(), renderedContent.toString());
	}

	@Override
	public int hashCode() {
		String string = toString();

		return string.hashCode();
	}

	public String toString() {
		return RenderedContentSerDes.toJSON(this);
	}

}