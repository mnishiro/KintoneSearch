(() => {
  'use strict';

  const PLUGIN_ID = kintone.$PLUGIN_ID;
  const TARGET_TYPES = ['SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT', 'NUMBER', 'LOOKUP'];

  const getConfigFields = () => {
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!config.targetFields) {
      return [];
    }
    try {
      const parsed = JSON.parse(config.targetFields);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const fetchFields = async () => {
    const appId = kintone.app.getId();
    const params = { app: appId };
    const response = await kintone.api(kintone.api.url('/k/v1/form.json', true), 'GET', params);
    return response.properties;
  };

  const flattenFields = (properties, list = []) => {
    Object.values(properties).forEach((property) => {
      if (property.type === 'GROUP' && property.fields) {
        flattenFields(property.fields, list);
        return;
      }
      list.push(property);
    });
    return list;
  };

  const renderFields = (fields, selected) => {
    const container = document.getElementById('field-list');
    container.innerHTML = '';

    if (fields.length === 0) {
      container.textContent = '対象となるフィールドがありません。';
      return;
    }

    fields.forEach((field) => {
      const label = document.createElement('label');
      label.className = 'field-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = field.code;
      checkbox.checked = selected.includes(field.code);

      const text = document.createElement('span');
      text.textContent = `${field.label} (${field.code})`;

      label.appendChild(checkbox);
      label.appendChild(text);
      container.appendChild(label);
    });
  };

  const saveConfig = () => {
    const checked = Array.from(document.querySelectorAll('#field-list input[type="checkbox"]:checked'))
      .map((input) => input.value);

    const config = {
      targetFields: JSON.stringify(checked)
    };

    kintone.plugin.app.setConfig(config, () => {
      alert('設定を保存しました。');
      window.location.href = '../../';
    });
  };

  const cancelConfig = () => {
    window.location.href = '../../';
  };

  const initialize = async () => {
    const selected = getConfigFields();
    const properties = await fetchFields();
    const fields = flattenFields(properties)
      .filter((field) => TARGET_TYPES.includes(field.type));

    renderFields(fields, selected);

    document.getElementById('save').addEventListener('click', saveConfig);
    document.getElementById('cancel').addEventListener('click', cancelConfig);
  };

  initialize().catch(() => {
    const container = document.getElementById('field-list');
    container.textContent = 'フィールド情報の取得に失敗しました。';
  });
})();
