(() => {
  "use strict";

  const data = window.SWE_TEST_DATA;
  const state = {
    mode: "unverified",
    query: "",
    sortKey: "score",
    sortDirection: "desc",
    expanded: false,
    filters: {},
    selectedConfigurations: { verified: {}, unverified: {}, online: {} }
  };

  const modeConfig = {
    verified: {
      description: "The same 60 target branches with a distance oracle for iterative correction. Each model is ranked by its best selected configuration.",
      leaderLabel: "Best pass rate",
      chartTitle: "Top models by pass rate",
      chartMetric: "Pass rate (%)",
      chartLabel: "Top Feedback-enabled pass rates",
      note: "Pass rate counts rewards ≥ 1.0 across 60 tasks; missing results count as zero. Trial directories, scored results, average reward, and exceptions are shown as reported.",
      scoreScale: 100,
      formatScore: (score) => `${score.toFixed(1)}%`
    },
    unverified: {
      description: "Input prediction on 60 fixed target branches using source code without runtime feedback. Each model is ranked by its best selected configuration.",
      leaderLabel: "Best pass rate",
      chartTitle: "Top models by pass rate",
      chartMetric: "Pass rate (%)",
      chartLabel: "Top Open-loop pass rates",
      note: "Pass rate counts rewards ≥ 1.0 across 60 Open-loop tasks; missing results count as zero. Trial directories, scored results, average reward, and exceptions are shown as reported.",
      scoreScale: 100,
      formatScore: (score) => `${score.toFixed(1)}%`
    },
    online: {
      description: "Mean normalized coverage reward for published 12-hour Online Arena runs across 11 evaluated programs from the 14-program corpus; confirmed bugs are reported separately.",
      leaderLabel: "Best mean reward",
      chartTitle: "Top models by mean reward",
      chartMetric: "Mean reward (0–1)",
      chartLabel: "Online Arena 12-hour mean rewards",
      note: "Published Online Arena scores are means across 11 evaluated programs. The three browser-engine targets not included in those runs are JavaScriptCore, V8, and SpiderMonkey, bringing the current corpus to 14 targets. Bug counts include upstream issues or confirmed fixes only.",
      scoreScale: 1,
      formatScore: (score) => score.toFixed(4)
    }
  };

  const body = document.querySelector("#leaderboard-body");
  const chart = document.querySelector("#score-chart");
  const search = document.querySelector("#leaderboard-search");
  const showAllButton = document.querySelector("#show-all");
  const resultCount = document.querySelector("#result-count");
  const bestScore = document.querySelector("#current-best");
  const bestModel = document.querySelector("#current-best-model");
  const tableHead = document.querySelector("#leaderboard-head");
  const leaderboardDescription = document.querySelector("#leaderboard-description");
  const leaderStatLabel = document.querySelector("#leader-stat-label");
  const chartTitle = document.querySelector("#chart-title");
  const chartMetric = document.querySelector("#chart-metric");
  const dataNoteCopy = document.querySelector("#data-note-copy");
  const filterToggle = document.querySelector("#filter-toggle");
  const filterPopover = document.querySelector("#leaderboard-filters");
  const filterGroups = document.querySelector("#filter-groups");
  const filterCount = document.querySelector("#filter-count");
  const filterResultSummary = document.querySelector("#filter-result-summary");
  const configurationSummary = document.querySelector("#configuration-summary");
  const toast = document.querySelector("#toast");

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function getSourceRows(mode = state.mode) {
    return data.leaderboards[mode].map((row, index) => ({ ...row, _id: `${mode}-${index}`, _sourceIndex: index }));
  }

  function rowStatus(row, mode = state.mode) {
    if (mode === "online") {
      if (!Number.isFinite(row.bugs)) return "pending";
      return row.bugs > 0 ? "confirmed" : "none";
    }
    return row.trialsValue === 60 ? "complete" : "partial";
  }

  function filterDefinitions(mode = state.mode) {
    const rows = getSourceRows(mode);
    const unique = (key) => [...new Set(rows.map((row) => row[key]))]
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }));
    return [
      { key: "model", label: "Model", values: unique("model").map((value) => ({ value, label: value })), wide: true },
      { key: "agent", label: "Scaffold", values: unique("agent").map((value) => ({ value, label: formatAgent(value) })) },
      { key: "effort", label: mode === "online" ? "Run window" : "Reasoning effort", values: unique(mode === "online" ? "duration" : "effort").map((value) => ({ value, label: formatLabel(value) })) },
      { key: "status", label: mode === "online" ? "Finding status" : "Run status", values: mode === "online"
        ? [{ value: "confirmed", label: "Confirmed bugs" }, { value: "none", label: "No confirmed bugs" }, { value: "pending", label: "Pending confirmation" }]
        : [{ value: "complete", label: "Complete (60 trials)" }, { value: "partial", label: "Partial run" }] }
    ].filter((definition) => definition.key === "model" || definition.key === "status" || definition.values.length > 1);
  }

  function filterValue(row, key, mode = state.mode) {
    if (key === "effort") return mode === "online" ? row.duration : row.effort;
    if (key === "status") return rowStatus(row, mode);
    return row[key];
  }

  function ensureFilters(mode = state.mode) {
    if (state.filters[mode]) return;
    state.filters[mode] = Object.fromEntries(filterDefinitions(mode).map((definition) => [
      definition.key,
      new Set(definition.values.map((item) => item.value))
    ]));
  }

  function rowMatchesFilters(row, mode = state.mode) {
    ensureFilters(mode);
    const filters = state.filters[mode];
    return filterDefinitions(mode).every((definition) => filters[definition.key].has(filterValue(row, definition.key, mode)));
  }

  function getEligibleConfigurations(model) {
    return getSourceRows()
      .filter((row) => row.model === model && rowMatchesFilters(row))
      .sort((a, b) => b.score - a.score || a._sourceIndex - b._sourceIndex);
  }

  function getSelectedRows() {
    const query = state.query.trim().toLowerCase();
    const candidates = getSourceRows().filter((row) => {
      if (!rowMatchesFilters(row)) return false;
      if (!query) return true;
      const searchable = `${Object.values(row).join(" ")} ${formatAgent(row.agent)} ${row.servedAs || ""}`.toLowerCase();
      return searchable.includes(query);
    });
    const groups = new Map();
    candidates.forEach((row) => {
      if (!groups.has(row.model)) groups.set(row.model, []);
      groups.get(row.model).push(row);
    });
    const selected = [...groups.entries()].map(([model, rows]) => {
      const selectedId = state.selectedConfigurations[state.mode][model];
      return rows.find((row) => row._id === selectedId)
        || [...rows].sort((a, b) => b.score - a.score || a._sourceIndex - b._sourceIndex)[0];
    });
    const ranked = [...selected].sort((a, b) => b.score - a.score || a._sourceIndex - b._sourceIndex);
    const ranks = new Map(ranked.map((row, index) => [row._id, index + 1]));
    return selected.map((row) => ({ ...row, benchmarkRank: ranks.get(row._id) }));
  }

  function getRows() {
    const rows = getSelectedRows();
    rows.sort((a, b) => {
      const left = a[state.sortKey];
      const right = b[state.sortKey];
      const leftMissing = left === null || left === undefined || left === "";
      const rightMissing = right === null || right === undefined || right === "";
      if (leftMissing || rightMissing) {
        if (leftMissing && rightMissing) return a.benchmarkRank - b.benchmarkRank;
        return leftMissing ? 1 : -1;
      }
      const comparison = typeof left === "number"
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
      if (comparison === 0) {
        if (state.sortKey === "score" && state.sortDirection === "asc") {
          return b.benchmarkRank - a.benchmarkRank;
        }
        return a.benchmarkRank - b.benchmarkRank;
      }
      return state.sortDirection === "asc" ? comparison : -comparison;
    });
    return rows;
  }

  function updateSortIndicators() {
    document.querySelectorAll("[data-sort-header]").forEach((header) => {
      const active = header.dataset.sortHeader === state.sortKey;
      const direction = active ? state.sortDirection : "none";
      header.setAttribute("aria-sort", direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none");
      const icon = header.querySelector(".sort-icon");
      if (icon) icon.textContent = active ? (state.sortDirection === "asc" ? "↑" : "↓") : "↕";
    });
  }

  function sortableHeader(key, label, numeric = false) {
    const active = state.sortKey === key;
    const ariaSort = active ? (state.sortDirection === "asc" ? "ascending" : "descending") : "none";
    const icon = active ? (state.sortDirection === "asc" ? "↑" : "↓") : "↕";
    return `<th scope="col"${numeric ? ' class="numeric"' : ""} data-sort-header="${key}" aria-sort="${ariaSort}"><button type="button" data-sort="${key}">${label} <span class="sort-icon" aria-hidden="true">${icon}</span></button></th>`;
  }

  function renderTableHead() {
    const online = state.mode === "online";
    tableHead.innerHTML = `<tr>
      <th scope="col" title="Benchmark rank">Rank</th>
      ${sortableHeader("model", "Model")}
      ${sortableHeader("agent", "Scaffold")}
      ${online ? `
        <th scope="col">Window</th>
        <th scope="col">Evaluated</th>
        ${sortableHeader("score", "Mean reward", true)}
        ${sortableHeader("bugs", "Verified bugs", true)}
        ${sortableHeader("tokensValue", "Total tokens", true)}
        ${sortableHeader("costValue", "Est. cost", true)}` : `
        <th scope="col">Effort</th>
        ${sortableHeader("trialsValue", "Trial dirs", true)}
        ${sortableHeader("scoredValue", "Scored", true)}
        ${sortableHeader("score", "Pass rate", true)}
        ${sortableHeader("avgReward", "Avg. reward", true)}
        ${sortableHeader("exceptions", "Exceptions", true)}`}
    </tr>`;
  }

  function configurationDimension(row, field) {
    if (field === "agent") return row.agent;
    return state.mode === "online" ? row.duration : row.effort;
  }

  function configurationOptions(current, field) {
    const configurations = getEligibleConfigurations(current.model);
    const currentValue = configurationDimension(current, field);
    const groups = new Map();

    configurations.forEach((row) => {
      if (field === "effort" && row.agent !== current.agent) return;
      const value = configurationDimension(row, field);
      if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(row);
    });

    return [...groups.entries()].map(([value, rows]) => {
      if (value === currentValue && rows.some((row) => row._id === current._id)) return current;
      if (field === "agent") {
        const currentEffort = configurationDimension(current, "effort");
        const sameEffort = rows.filter((row) => configurationDimension(row, "effort") === currentEffort);
        if (sameEffort.length) return [...sameEffort].sort((a, b) => b.score - a.score || a._sourceIndex - b._sourceIndex)[0];
      }
      return [...rows].sort((a, b) => b.score - a.score || a._sourceIndex - b._sourceIndex)[0];
    });
  }

  function configurationChip(row, field) {
    const options = configurationOptions(row, field);
    const value = configurationDimension(row, field);
    const label = field === "agent" ? formatAgent(value) : formatLabel(value);
    const className = field === "agent" ? "agent-chip" : "effort-chip";
    const dimensionLabel = field === "agent" ? "scaffold" : (state.mode === "online" ? "run window" : "reasoning effort");
    if (options.length < 2) return `<span class="${className}">${escapeHtml(label)}</span>`;
    return `<button class="${className} config-trigger" type="button" data-config-id="${row._id}" data-config-field="${field}" aria-haspopup="listbox" aria-expanded="false" aria-label="Choose ${escapeHtml(row.model)} ${dimensionLabel}">${escapeHtml(label)}<span aria-hidden="true">⌄</span></button>`;
  }

  function modelCell(row) {
    const endpoint = row.servedAs ? `<small>served as ${escapeHtml(row.servedAs)}</small>` : "";
    return `<td class="model-cell"><strong>${escapeHtml(row.model)}</strong>${endpoint}</td>`;
  }

  function renderTable() {
    const rows = getRows();
    const visible = state.expanded ? rows : rows.slice(0, 12);
    const config = modeConfig[state.mode];
    body.innerHTML = visible.length ? visible.map((row) => {
      const rank = `<td class="rank ${row.benchmarkRank <= 3 ? "top-rank" : ""}">${String(row.benchmarkRank).padStart(2, "0")}</td>`;
      const rawScoreWidth = Math.min(row.score / config.scoreScale * 100, 100);
      const scoreWidth = state.mode !== "online" && rawScoreWidth > 0 && rawScoreWidth < 12
        ? Math.min(rawScoreWidth * 1.65, 16)
        : rawScoreWidth;
      const score = `<td class="numeric score-cell"><span class="score-rule" aria-hidden="true"><i class="${row.score > 0 ? "has-score" : ""}" style="width:${scoreWidth}%"></i></span>${config.formatScore(row.score)}</td>`;

      if (state.mode === "online") {
        const complete = !row.partial;
        const partialTitle = row.partial ? ' title="Known tasks only; QuickJS has no stable final reward"' : "";
        const bugsKnown = Number.isFinite(row.bugs);
        const bugCount = bugsKnown ? row.bugs : "—";
        const bugTitle = bugsKnown ? "" : ' title="Bug count pending confirmation"';
        return `
        <tr>
          ${rank}
          ${modelCell(row)}
          <td>${configurationChip(row, "agent")}</td>
          <td>${configurationChip(row, "effort")}</td>
          <td><span class="status-chip ${complete ? "done" : "running"}">${complete ? "● " : "◌ "}${escapeHtml(row.tasks)}</span></td>
          ${score}
          <td class="numeric"><span class="bug-count ${row.bugs > 0 ? "has-bugs" : ""}"${bugTitle}>${bugCount}</span></td>
          <td class="numeric"${partialTitle}>${escapeHtml(row.tokens)}</td>
          <td class="numeric"${partialTitle}>${escapeHtml(row.cost)}</td>
        </tr>`;
      }

      const trialsComplete = row.trialsValue === 60;
      return `
        <tr>
          ${rank}
          ${modelCell(row)}
          <td>${configurationChip(row, "agent")}</td>
          <td>${configurationChip(row, "effort")}</td>
          <td class="numeric"><span class="status-chip ${trialsComplete ? "done" : "running"}">${trialsComplete ? "● " : "◌ "}${escapeHtml(row.trials)}</span></td>
          <td class="numeric">${escapeHtml(row.scored)}</td>
          ${score}
          <td class="numeric">${row.avgReward.toFixed(3)}</td>
          <td class="numeric">${row.exceptions}</td>
        </tr>`;
    }).join("") : '<tr class="empty-results"><td colspan="9">No models match the current search and filters.</td></tr>';

    resultCount.textContent = `Displaying ${visible.length} of ${rows.length} models`;
    const customSelections = rows.filter((row) => state.selectedConfigurations[state.mode][row.model] === row._id).length;
    configurationSummary.textContent = customSelections
      ? `${rows.length} models · ${customSelections} custom configuration${customSelections === 1 ? "" : "s"} selected`
      : `${rows.length} models · best published configuration per model`;
    showAllButton.hidden = rows.length <= 12;
    showAllButton.innerHTML = state.expanded ? "Show fewer results <span>↑</span>" : "Show all results <span>↓</span>";
    updateSortIndicators();
  }

  function renderChartTooltip(row, config) {
    const metric = state.mode === "online" ? "Mean reward" : "Pass rate";
    const bugCount = Number.isFinite(row.bugs) ? row.bugs : "—";
    const details = state.mode === "online"
      ? `<span>Evaluated <b>${escapeHtml(row.tasks)}</b></span>
         <span>Verified bugs <b>${bugCount}</b></span>
         <span>Tokens <b>${escapeHtml(row.tokens)}</b></span>`
      : `<span>Scaffold <b>${escapeHtml(formatAgent(row.agent))}</b></span>
         <span>Scored <b>${escapeHtml(row.scored)}</b></span>
         <span>Avg. reward <b>${row.avgReward.toFixed(3)}</b></span>`;

    const endpoint = row.servedAs ? ` <span class="tooltip-endpoint">served as ${escapeHtml(row.servedAs)}</span>` : "";
    return `<span class="chart-tooltip" role="tooltip">
      <strong>${escapeHtml(row.model)}${endpoint}</strong>
      <span class="tooltip-metric"><i aria-hidden="true"></i>${metric}<b>${config.formatScore(row.score)}</b></span>
      <small>${details}</small>
    </span>`;
  }

  function renderChart() {
    const config = modeConfig[state.mode];
    const completed = getSelectedRows()
      .filter((row) => state.mode === "online" || row.trialsValue === 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    chart.innerHTML = completed.map((row) => {
      const width = Math.min(row.score / config.scoreScale * 100, 100);
      const accessibleLabel = `${row.model}, ${formatAgent(row.agent)}, ${config.chartMetric}: ${config.formatScore(row.score)}`;
      return `
      <div class="chart-row" tabindex="0" aria-label="${escapeHtml(accessibleLabel)}">
        <span class="chart-label" title="${escapeHtml(`${row.model} · ${row.agent}`)}">${escapeHtml(row.model)}${state.mode === "online" ? "" : ` · ${escapeHtml(row.agent)}`}</span>
        <span class="chart-track" aria-hidden="true"><span class="chart-bar ${row.score > 0 ? "has-score" : ""}" style="width:${width}%"></span></span>
        <span class="chart-value">${config.formatScore(row.score)}</span>
        ${renderChartTooltip(row, config)}
      </div>`;
    }).join("");
    chart.setAttribute("aria-label", config.chartLabel);
  }

  function renderSummary() {
    const config = modeConfig[state.mode];
    const top = [...getSelectedRows()].sort((a, b) => b.score - a.score)[0];
    if (!top) {
      bestScore.textContent = "—";
      bestModel.textContent = "No matching models";
      return;
    }
    bestScore.textContent = config.formatScore(top.score);
    bestModel.textContent = `${top.model} · ${formatAgent(top.agent)}`;
  }

  function renderModeCopy() {
    const config = modeConfig[state.mode];
    leaderboardDescription.textContent = config.description;
    leaderStatLabel.textContent = config.leaderLabel;
    chartTitle.textContent = config.chartTitle;
    chartMetric.textContent = config.chartMetric;
    dataNoteCopy.textContent = config.note;
  }

  function renderLeaderboard() {
    renderTableHead();
    renderFilters();
    renderTable();
    renderChart();
    renderSummary();
    renderModeCopy();
  }

  function formatAgent(agent) {
    const names = {
      "claude-code": "Claude Code",
      "terminus-2": "Terminus 2",
      "kimi-cli": "Kimi Code",
      "qwen-coder": "Qwen Coder",
      "gemini-cli": "Gemini CLI",
      "mini-swe-agent": "mini-SWE-agent",
      "codex": "Codex"
    };
    return names[agent] || agent.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }

  function formatLabel(value) {
    if (value === "default") return "Default";
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  function renderFilters() {
    ensureFilters();
    const definitions = filterDefinitions();
    filterGroups.innerHTML = definitions.map((definition) => `
      <fieldset class="filter-group${definition.wide ? " filter-group-wide" : ""}">
        <legend>${escapeHtml(definition.label)}</legend>
        <div class="filter-options">
          ${definition.values.map((item) => `
            <label><input type="checkbox" data-filter-key="${definition.key}" value="${escapeHtml(item.value)}"${state.filters[state.mode][definition.key].has(item.value) ? " checked" : ""}><span>${escapeHtml(item.label)}</span></label>
          `).join("")}
        </div>
      </fieldset>
    `).join("");
    const activeGroups = definitions.filter((definition) => state.filters[state.mode][definition.key].size !== definition.values.length).length;
    filterCount.textContent = activeGroups;
    filterCount.hidden = activeGroups === 0;
    filterToggle.classList.toggle("has-filters", activeGroups > 0);
    filterResultSummary.textContent = `${getSelectedRows().length} models match`;
  }

  const configurationMenu = document.createElement("div");
  configurationMenu.className = "configuration-menu";
  configurationMenu.id = "configuration-menu";
  configurationMenu.hidden = true;
  document.body.append(configurationMenu);

  function closeConfigurationMenu() {
    document.querySelectorAll('.config-trigger[aria-expanded="true"]').forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
    configurationMenu.hidden = true;
    configurationMenu.innerHTML = "";
  }

  function openConfigurationMenu(trigger) {
    const current = getSourceRows().find((row) => row._id === trigger.dataset.configId);
    if (!current) return;
    const field = trigger.dataset.configField;
    const options = configurationOptions(current, field);
    const choosingAgent = field === "agent";
    const dimensionLabel = choosingAgent ? "scaffold" : (state.mode === "online" ? "run window" : "reasoning effort");
    document.querySelectorAll('.config-trigger[aria-expanded="true"]').forEach((item) => item.setAttribute("aria-expanded", "false"));
    trigger.setAttribute("aria-expanded", "true");
    const config = modeConfig[state.mode];
    configurationMenu.innerHTML = `
      <div class="configuration-menu-head"><div><strong>${escapeHtml(current.model)}</strong><span>Choose ${dimensionLabel}</span></div><button type="button" data-close-config aria-label="Close ${dimensionLabel} menu">×</button></div>
      <div class="configuration-options" role="listbox" aria-label="${escapeHtml(current.model)} ${dimensionLabel} options">
        ${options.map((row) => {
          const effort = state.mode === "online" ? row.duration : row.effort;
          const endpoint = row.servedAs ? `<span>served as ${escapeHtml(row.servedAs)}</span>` : "";
          const runState = state.mode === "online" ? row.tasks : row.trials;
          const selected = configurationDimension(row, field) === configurationDimension(current, field);
          const primary = choosingAgent ? formatAgent(row.agent) : formatLabel(effort);
          const secondary = choosingAgent ? formatLabel(effort) : formatAgent(row.agent);
          return `<button type="button" role="option" aria-selected="${selected}" data-select-config="${row._id}">
            <span class="configuration-option-main"><strong>${escapeHtml(primary)}</strong><i>${escapeHtml(secondary)}</i>${endpoint}</span>
            <span class="configuration-option-result"><b>${config.formatScore(row.score)}</b><small>${escapeHtml(runState)}</small></span>
          </button>`;
        }).join("")}
      </div>`;
    configurationMenu.hidden = false;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = Math.min(390, window.innerWidth - 24);
    configurationMenu.style.width = `${menuWidth}px`;
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - menuWidth - 12);
    configurationMenu.style.left = `${left}px`;
    const top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - configurationMenu.offsetHeight - 12));
    configurationMenu.style.top = `${top}px`;
    configurationMenu.querySelector('[aria-selected="true"]')?.focus();
  }

  function bindTablistKeyboard(tablist, onSelect) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    tablist.addEventListener("keydown", (event) => {
      const currentIndex = tabs.indexOf(event.target.closest('[role="tab"]'));
      if (currentIndex < 0) return;
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      onSelect(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  }

  const leaderboardTabs = document.querySelector(".mode-tabs");
  const leaderboardPanel = document.querySelector("#leaderboard-results-panel");

  function selectLeaderboardMode(tab) {
    state.mode = tab.dataset.mode;
    state.expanded = false;
    state.sortKey = "score";
    state.sortDirection = "desc";
    closeConfigurationMenu();
    filterPopover.hidden = true;
    filterToggle.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".mode-tab").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    leaderboardPanel.setAttribute("aria-labelledby", tab.id);
    renderLeaderboard();
  }

  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectLeaderboardMode(tab));
  });
  bindTablistKeyboard(leaderboardTabs, selectLeaderboardMode);

  filterToggle.addEventListener("click", () => {
    const open = filterPopover.hidden;
    filterPopover.hidden = !open;
    filterToggle.setAttribute("aria-expanded", String(open));
    if (open) filterPopover.querySelector("input")?.focus();
  });

  document.querySelector("#filter-close").addEventListener("click", () => {
    filterPopover.hidden = true;
    filterToggle.setAttribute("aria-expanded", "false");
    filterToggle.focus();
  });

  filterGroups.addEventListener("change", (event) => {
    const input = event.target.closest("[data-filter-key]");
    if (!input) return;
    const selected = state.filters[state.mode][input.dataset.filterKey];
    if (input.checked) selected.add(input.value);
    else selected.delete(input.value);
    state.expanded = false;
    renderLeaderboard();
  });

  document.querySelector("#reset-filters").addEventListener("click", () => {
    delete state.filters[state.mode];
    ensureFilters();
    state.expanded = false;
    renderLeaderboard();
  });

  body.addEventListener("click", (event) => {
    const trigger = event.target.closest(".config-trigger");
    if (!trigger) return;
    event.stopPropagation();
    openConfigurationMenu(trigger);
  });

  configurationMenu.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-config]")) {
      closeConfigurationMenu();
      return;
    }
    const option = event.target.closest("[data-select-config]");
    if (!option) return;
    const row = getSourceRows().find((item) => item._id === option.dataset.selectConfig);
    if (!row) return;
    state.selectedConfigurations[state.mode][row.model] = row._id;
    closeConfigurationMenu();
    renderLeaderboard();
  });

  document.addEventListener("click", (event) => {
    if (!filterPopover.hidden && !filterPopover.contains(event.target) && !filterToggle.contains(event.target)) {
      filterPopover.hidden = true;
      filterToggle.setAttribute("aria-expanded", "false");
    }
    if (!configurationMenu.hidden && !configurationMenu.contains(event.target) && !event.target.closest(".config-trigger")) {
      closeConfigurationMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeConfigurationMenu();
    if (!filterPopover.hidden) {
      filterPopover.hidden = true;
      filterToggle.setAttribute("aria-expanded", "false");
      filterToggle.focus();
    }
  });

  window.addEventListener("resize", closeConfigurationMenu);
  window.addEventListener("scroll", closeConfigurationMenu, { passive: true });

  tableHead.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort]");
    if (!button) return;
    const key = button.dataset.sort;
    state.sortDirection = state.sortKey === key && state.sortDirection === "desc" ? "asc" : "desc";
    state.sortKey = key;
    renderTableHead();
    renderTable();
  });

  search.addEventListener("input", () => {
    state.query = search.value;
    state.expanded = true;
    renderLeaderboard();
  });

  showAllButton.addEventListener("click", () => {
    state.expanded = !state.expanded;
    renderTable();
  });

  document.querySelector("#domain-grid").innerHTML = data.domains.map((domain, index) => `
    <a class="domain-card" href="registry.html?domain=${encodeURIComponent(domain.slug)}" aria-label="View ${escapeHtml(domain.name)} details">
      <div class="domain-card-top"><span>${String(index + 1).padStart(2, "0")}</span><strong>${domain.tasks}</strong></div>
      <h3>${escapeHtml(domain.name)}</h3>
      <p>${escapeHtml(domain.examples)}</p>
    </a>`).join("");

  document.querySelector("#online-program-grid").innerHTML = data.onlinePrograms.map((program, index) => `
    <details class="online-program-card">
      <summary>
        <span class="online-program-index">${String(index + 1).padStart(2, "0")}</span>
        <div><h3>${escapeHtml(program.name)}</h3><p>${escapeHtml(program.domain)}</p></div>
        <span class="online-program-action" aria-hidden="true"></span>
      </summary>
      <div class="online-program-detail">
        <p>${escapeHtml(program.description)}</p>
        <dl>
          <div><dt>Fuzz focus</dt><dd>${escapeHtml(program.focus)}</dd></div>
          <div><dt>Generated input</dt><dd>${escapeHtml(program.input)}</dd></div>
        </dl>
      </div>
    </details>`).join("");

  const corpusCopy = {
    fixed: {
      primary: "16 programs.",
      secondary: "13 systems domains.",
      description: "Fixed branch-inversion tasks are grounded in mature C and C++ software, from language runtimes and parsers to cryptography, networking, and media codecs."
    },
    online: {
      primary: "14 programs.",
      secondary: "Open-ended runs.",
      description: "Online Arena supports configurable run durations and measures self-directed path exploration through normalized coverage gain without a predefined target branch. The published leaderboard uses 12-hour runs."
    }
  };

  function selectCorpusMode(mode) {
    const copy = corpusCopy[mode];
    document.querySelector("#corpus-title-primary").textContent = copy.primary;
    document.querySelector("#corpus-title-secondary").textContent = copy.secondary;
    document.querySelector("#corpus-description").textContent = copy.description;
    document.querySelectorAll(".corpus-tab").forEach((tab) => {
      const selected = tab.dataset.corpusMode === mode;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.querySelector("#fixed-corpus-panel").hidden = mode !== "fixed";
    document.querySelector("#online-corpus-panel").hidden = mode !== "online";
  }

  document.querySelectorAll(".corpus-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectCorpusMode(tab.dataset.corpusMode));
  });
  bindTablistKeyboard(document.querySelector(".corpus-tabs"), (tab) => selectCorpusMode(tab.dataset.corpusMode));

  const themeToggle = document.querySelector(".theme-toggle");
  function updateThemeToggle() {
    const dark = document.documentElement.dataset.theme === "dark";
    themeToggle.setAttribute("aria-label", "Dark theme");
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.title = dark ? "Switch to light theme" : "Switch to dark theme";
  }
  updateThemeToggle();
  themeToggle.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("swe-test-theme", theme); } catch {}
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#101311" : "#f4f2ed";
    updateThemeToggle();
  });

  const menuButton = document.querySelector(".mobile-menu");
  const nav = document.querySelector("#site-nav");
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  const command = `uv sync\n\npython run_benchmark.py \\\n  --model your-model \\\n  --agent claude-code \\\n  --base-url "$BASE_URL" \\\n  --api-key "$API_KEY" \\\n  --tasks-dir tasks/swe-test \\\n  --extra --n-concurrent 4`;
  const citation = `@misc{swe_test_2026,\n  title = {{SWE-Test}: Benchmarking LLM Vulnerability Discovery via Input Prediction},\n  year = {2026},\n  url = {https://swe-test-benchmark.github.io/}\n}`;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1700);
  }

  document.querySelector("#copy-command").addEventListener("click", () => copyText(command));
  document.querySelector("#copy-citation").addEventListener("click", () => copyText(citation));

  renderLeaderboard();
})();
