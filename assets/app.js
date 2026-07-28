(() => {
  "use strict";

  const data = window.SWE_TEST_DATA;
  const state = {
    mode: "verified",
    query: "",
    sortKey: "score",
    sortDirection: "desc",
    expanded: false
  };

  const modeConfig = {
    verified: {
      description: "Pass rate across branch-inversion tasks. Each row is a model–agent configuration; results are drawn from the project repository.",
      leaderLabel: "Best pass rate",
      chartTitle: "Top completed configurations",
      chartMetric: "Pass rate (%)",
      chartLabel: "Top model pass rates",
      note: "“With verifier” grants runtime oracle feedback. In-progress runs are shown as reported and may change.",
      scoreScale: 100,
      formatScore: (score) => `${score.toFixed(1)}%`
    },
    unverified: {
      description: "Source-only branch inversion without runtime oracle feedback, using the same 60 target branches as the default setting.",
      leaderLabel: "Best pass rate",
      chartTitle: "Top completed configurations",
      chartMetric: "Pass rate (%)",
      chartLabel: "Top source-only model pass rates",
      note: "“Without verifier” tests static reasoning and mental execution. In-progress runs are shown as reported and may change.",
      scoreScale: 100,
      formatScore: (score) => `${score.toFixed(1)}%`
    },
    online: {
      description: "Mean normalized coverage reward after 12-hour autonomous runs across 11 real-world programs, with verified upstream bug findings shown alongside efficiency data.",
      leaderLabel: "Best mean reward",
      chartTitle: "12-hour mean reward by model",
      chartMetric: "Mean reward (0–1)",
      chartLabel: "SWE-TEST Online 12-hour mean rewards",
      note: "Online scores are means across 11 programs. Kimi-K2.6 is averaged over 10 stable results and its token/cost totals cover known tasks only (*). Three DeepSeek fallback scores use peak line coverage. Bug counts include upstream issues or confirmed fixes only.",
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
  const toast = document.querySelector("#toast");

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function getRows() {
    const query = state.query.trim().toLowerCase();
    const rows = data.leaderboards[state.mode]
      .map((row, index) => ({ ...row, sourceRank: index + 1 }))
      .filter((row) => !query || Object.values(row).join(" ").toLowerCase().includes(query));

    rows.sort((a, b) => {
      const left = a[state.sortKey];
      const right = b[state.sortKey];
      const comparison = typeof left === "number"
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
      if (comparison === 0) {
        if (state.sortKey === "score" && state.sortDirection === "asc") {
          return b.sourceRank - a.sourceRank;
        }
        return a.sourceRank - b.sourceRank;
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
      ${sortableHeader("agent", "Agent")}
      ${online ? `
        <th scope="col">Window</th>
        <th scope="col">Evaluated</th>
        ${sortableHeader("score", "Mean reward", true)}
        ${sortableHeader("bugs", "Verified bugs", true)}
        ${sortableHeader("tokensValue", "Total tokens", true)}
        ${sortableHeader("costValue", "Est. cost", true)}` : `
        <th scope="col">Effort</th>
        <th scope="col">Status</th>
        ${sortableHeader("score", "Pass rate", true)}
        <th scope="col" class="numeric">Avg. turns</th>
        <th scope="col" class="numeric">Avg. time</th>
        <th scope="col" class="numeric">Tokens</th>`}
    </tr>`;
  }

  function renderTable() {
    const rows = getRows();
    const visible = state.expanded ? rows : rows.slice(0, 12);
    const config = modeConfig[state.mode];
    body.innerHTML = visible.map((row) => {
      const rank = `<td class="rank ${row.sourceRank <= 3 ? "top-rank" : ""}">${String(row.sourceRank).padStart(2, "0")}</td>`;
      const rawScoreWidth = Math.min(row.score / config.scoreScale * 100, 100);
      const scoreWidth = state.mode !== "online" && rawScoreWidth > 0 && rawScoreWidth < 12
        ? Math.min(rawScoreWidth * 1.65, 16)
        : rawScoreWidth;
      const score = `<td class="numeric score-cell"><span class="score-rule" aria-hidden="true"><i class="${row.score > 0 ? "has-score" : ""}" style="width:${scoreWidth}%"></i></span>${config.formatScore(row.score)}</td>`;

      if (state.mode === "online") {
        const complete = !row.partial;
        const partialTitle = row.partial ? ' title="Known tasks only; QuickJS has no stable final reward"' : "";
        return `
        <tr>
          ${rank}
          <td class="model-cell"><strong>${escapeHtml(row.model)}</strong></td>
          <td><span class="agent-chip">${escapeHtml(row.agent)}</span></td>
          <td><span class="effort-chip">${escapeHtml(row.duration)}</span></td>
          <td><span class="status-chip ${complete ? "done" : "running"}">${complete ? "● " : "◌ "}${escapeHtml(row.tasks)}</span></td>
          ${score}
          <td class="numeric"><span class="bug-count ${row.bugs > 0 ? "has-bugs" : ""}">${row.bugs}</span></td>
          <td class="numeric"${partialTitle}>${escapeHtml(row.tokens)}</td>
          <td class="numeric"${partialTitle}>${escapeHtml(row.cost)}</td>
        </tr>`;
      }

      const isDone = row.status === "Done";
      return `
        <tr>
          ${rank}
          <td class="model-cell"><strong>${escapeHtml(row.model)}</strong></td>
          <td><span class="agent-chip">${escapeHtml(row.agent)}</span></td>
          <td><span class="effort-chip">${escapeHtml(row.effort)}</span></td>
          <td><span class="status-chip ${isDone ? "done" : "running"}">${isDone ? "● " : "◌ "}${escapeHtml(row.status)}</span></td>
          ${score}
          <td class="numeric">${escapeHtml(row.turns)}</td>
          <td class="numeric">${escapeHtml(row.time)}</td>
          <td class="numeric">${escapeHtml(row.tokens)}</td>
        </tr>`;
    }).join("");

    resultCount.textContent = `Displaying ${visible.length} of ${rows.length} available entries`;
    showAllButton.hidden = rows.length <= 12;
    showAllButton.innerHTML = state.expanded ? "Show fewer results <span>↑</span>" : "Show all results <span>↓</span>";
    updateSortIndicators();
  }

  function renderChartTooltip(row, config) {
    const metric = state.mode === "online" ? "Mean reward" : "Pass rate";
    const details = state.mode === "online"
      ? `<span>Evaluated <b>${escapeHtml(row.tasks)}</b></span>
         <span>Verified bugs <b>${row.bugs}</b></span>
         <span>Tokens <b>${escapeHtml(row.tokens)}</b></span>`
      : `<span>Agent <b>${escapeHtml(formatAgent(row.agent))}</b></span>
         <span>Effort <b>${escapeHtml(row.effort)}</b></span>
         <span>Status <b>${escapeHtml(row.status)}</b></span>`;

    return `<span class="chart-tooltip" role="tooltip">
      <strong>${escapeHtml(row.model)}</strong>
      <span class="tooltip-metric"><i aria-hidden="true"></i>${metric}<b>${config.formatScore(row.score)}</b></span>
      <small>${details}</small>
    </span>`;
  }

  function renderChart() {
    const config = modeConfig[state.mode];
    const completed = data.leaderboards[state.mode]
      .filter((row) => state.mode === "online" || row.status === "Done")
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
    const top = [...data.leaderboards[state.mode]].sort((a, b) => b.score - a.score)[0];
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
    renderTable();
    renderChart();
    renderSummary();
    renderModeCopy();
  }

  function formatAgent(agent) {
    return agent.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }

  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.mode = tab.dataset.mode;
      state.expanded = false;
      state.sortKey = "score";
      state.sortDirection = "desc";
      document.querySelectorAll(".mode-tab").forEach((item) => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderLeaderboard();
    });
  });

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
    renderTable();
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
      primary: "23 programs.",
      secondary: "13 systems domains.",
      description: "Fixed branch-inversion tasks are grounded in mature C and C++ software, from language runtimes and parsers to cryptography, networking, and media codecs."
    },
    online: {
      primary: "11 programs.",
      secondary: "Open-ended runs.",
      description: "Online evaluation supports configurable run durations and measures how effectively an agent grows coverage without a predefined target branch. The published leaderboard uses 12-hour runs."
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
    });
    document.querySelector("#fixed-corpus-panel").hidden = mode !== "fixed";
    document.querySelector("#online-corpus-panel").hidden = mode !== "online";
  }

  document.querySelectorAll(".corpus-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectCorpusMode(tab.dataset.corpusMode));
  });

  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("swe-test-theme", theme);
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#101311" : "#f4f2ed";
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
  const citation = `@misc{swe_test_2026,\n  title = {SWE-TEST: Evaluating Coding Agents on Reverse Reasoning and Input Synthesis},\n  year = {2026}\n}`;

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
