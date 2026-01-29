(() => {
  'use strict';

  const PLUGIN_ID = kintone.$PLUGIN_ID;
  const EVENT_SHOW = 'app.record.index.show';
  const UI_ID = 'kintone-partial-search-ui';
  const RESULT_ID = 'kintone-partial-search-results';
  const PAGE_LIMIT = 500;

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

  const createUi = () => {
    const header = kintone.app.getHeaderSpaceElement();
    if (!header || document.getElementById(UI_ID)) {
      return;
    }

    const container = document.createElement('div');
    container.id = UI_ID;
    container.className = 'kintone-partial-search__container';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '検索キーワードを入力';
    input.className = 'kintone-partial-search__input';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '検索';
    button.className = 'kintone-partial-search__button';

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = 'クリア';
    clearButton.className = 'kintone-partial-search__button kintone-partial-search__button--secondary';

    const resultContainer = document.createElement('div');
    resultContainer.id = RESULT_ID;
    resultContainer.className = 'kintone-partial-search__results';

    container.appendChild(input);
    container.appendChild(button);
    container.appendChild(clearButton);
    header.appendChild(container);
    header.appendChild(resultContainer);

    return { input, button, clearButton, resultContainer };
  };

  const fetchRecords = async (appId, offset = 0, records = []) => {
    const params = {
      app: appId,
      query: `limit ${PAGE_LIMIT} offset ${offset}`
    };

    const response = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', params);
    const nextRecords = records.concat(response.records);

    if (response.records.length < PAGE_LIMIT) {
      return nextRecords;
    }

    return fetchRecords(appId, offset + PAGE_LIMIT, nextRecords);
  };

  const toComparableText = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    if (Array.isArray(value)) {
      return value.map((item) => `${item}`).join(' ').toLowerCase();
    }
    return `${value}`.toLowerCase();
  };

  const filterRecords = (records, targetFields, keyword) => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return records.filter((record) => {
      return targetFields.some((fieldCode) => {
        const field = record[fieldCode];
        if (!field) {
          return false;
        }
        return toComparableText(field.value).includes(normalized);
      });
    });
  };

  const renderResults = (container, records, targetFields) => {
    container.innerHTML = '';

    if (records.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'kintone-partial-search__empty';
      empty.textContent = '検索結果がありません。';
      container.appendChild(empty);
      return;
    }

    const table = document.createElement('table');
    table.className = 'kintone-partial-search__table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    targetFields.forEach((fieldCode) => {
      const th = document.createElement('th');
      th.textContent = fieldCode;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    records.forEach((record) => {
      const row = document.createElement('tr');
      targetFields.forEach((fieldCode) => {
        const td = document.createElement('td');
        const field = record[fieldCode];
        td.textContent = field ? `${field.value ?? ''}` : '';
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  };

  kintone.events.on(EVENT_SHOW, (event) => {
    const targetFields = getConfigFields();
    const ui = createUi();
    if (!ui) {
      return event;
    }

    const { input, button, clearButton, resultContainer } = ui;
    const appId = kintone.app.getId();

    const executeSearch = async () => {
      if (targetFields.length === 0) {
        resultContainer.textContent = '検索対象フィールドが設定されていません。';
        return;
      }

      resultContainer.textContent = '検索中...';

      try {
        const records = await fetchRecords(appId);
        const filtered = filterRecords(records, targetFields, input.value);
        renderResults(resultContainer, filtered, targetFields);
      } catch (error) {
        resultContainer.textContent = '検索中にエラーが発生しました。';
      }
    };

    button.addEventListener('click', () => {
      executeSearch();
    });

    clearButton.addEventListener('click', () => {
      input.value = '';
      resultContainer.innerHTML = '';
    });

    return event;
  });
})();
