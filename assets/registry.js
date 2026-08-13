(() => {
  "use strict";

  const corpus = window.SWE_TEST_CORPUS;
  const taskDetails = window.SWE_TEST_TASK_DETAILS || {};
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get("domain") || corpus[0].slug;
  const domain = corpus.find((item) => item.slug === requestedSlug) || corpus[0];
  const repository = "https://github.com/SWE-Test-Benchmark/SWE-Test-Benchmark";
  const taskRepository = `${repository}/tree/main/offline/with-verifier`;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const taskCount = domain.programs.reduce((total, item) => total + item.tasks.length, 0);
  const targetCount = domain.programs.length;
  const pageUrl = `https://swe-test-benchmark.github.io/registry.html?domain=${encodeURIComponent(domain.slug)}`;
  const pageTitle = `${domain.name} — SWE-Test Registry`;

  document.title = pageTitle;
  document.querySelector("#registry-canonical").href = pageUrl;
  document.querySelector("#registry-og-url").content = pageUrl;
  document.querySelector("#registry-og-title").content = pageTitle;
  document.querySelector("#registry-og-description").content = domain.summary;
  document.querySelector("#breadcrumb-domain").textContent = domain.name;
  document.querySelector("#registry-eyebrow").textContent = `Evaluation corpus / ${String(corpus.indexOf(domain) + 1).padStart(2, "0")}`;
  document.querySelector("#registry-title").textContent = domain.name;
  document.querySelector("#registry-summary").textContent = domain.summary;
  document.querySelector("#registry-task-count").textContent = taskCount;
  document.querySelector("#registry-target-count").textContent = targetCount;
  document.querySelector("#registry-tags").innerHTML = domain.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

  document.querySelector("#program-registry").innerHTML = domain.programs.map((item, index) => `
    <article class="registry-program-card">
      <div class="registry-program-head">
        <div>
          <span class="registry-index">${String(index + 1).padStart(2, "0")}</span>
          <h2>${escapeHtml(item.name)}</h2>
        </div>
        <span class="task-total">${item.tasks.length} ${item.tasks.length === 1 ? "task" : "tasks"}</span>
      </div>
      <p>${escapeHtml(item.summary)}</p>
      <div class="registry-target"><span>Target program</span><code>${escapeHtml(item.target)}</code></div>
      <div class="registry-tags">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <details ${index === 0 ? "open" : ""}>
        <summary>Task instances <span>${item.tasks.length}</span></summary>
        <div class="task-instance-list">
          ${item.tasks.map((task, taskIndex) => {
            const panelId = `task-panel-${index}-${taskIndex}`;
            const detail = taskDetails[task] || {};
            const condition = detail.condition || "Condition text is not embedded in this task's metadata.";
            return `
            <div class="task-instance">
              <div class="task-instance-row">
                <button class="task-instance-toggle" type="button" aria-expanded="false" aria-controls="${panelId}">
                  <code>${escapeHtml(task)}</code>
                </button>
                <a class="task-repository" href="${taskRepository}/${encodeURIComponent(task)}" target="_blank" rel="noreferrer">Repository ↗</a>
              </div>
              <div id="${panelId}" class="task-instance-description" hidden>
                <p>Predict a new input that takes the fixed target branch. The same target is used in Open-loop and Feedback-enabled modes.</p>
                <dl>
                  <div><dt>Source location</dt><dd><code>${escapeHtml(detail.branch || "See repository")}</code></dd></div>
                  <div><dt>Fuzz target</dt><dd><code>${escapeHtml(detail.fuzzTarget || item.target)}</code></dd></div>
                  <div class="task-detail-wide"><dt>Target function</dt><dd><code>${escapeHtml(detail.function || "See repository")}</code></dd></div>
                  <div class="task-detail-wide"><dt>Branch condition</dt><dd><code>${escapeHtml(condition)}</code></dd></div>
                </dl>
              </div>
            </div>`;
          }).join("")}
        </div>
      </details>
    </article>`).join("");

  document.querySelector("#program-registry").addEventListener("click", (event) => {
    const toggle = event.target.closest(".task-instance-toggle");
    if (!toggle) return;
    const panel = document.querySelector(`#${toggle.getAttribute("aria-controls")}`);
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });

  const firstTask = domain.programs[0].tasks[0];
  const command = `uv sync --frozen\n\npython run_benchmark.py \\\n  --model your-model \\\n  --agent claude-code \\\n  --base-url "$BASE_URL" \\\n  --api-key "$API_KEY" \\\n  --task offline/with-verifier/${firstTask}`;
  document.querySelector("#registry-command").innerHTML = `<span class="comment"># Install dependencies</span>
<span class="prompt">$</span> <span class="syntax-command">uv</span> <span class="syntax-subcommand">sync</span> <span class="syntax-flag">--frozen</span>

<span class="comment"># Run one Feedback-enabled task</span>
<span class="prompt">$</span> <span class="syntax-command">python</span> <span class="syntax-path">run_benchmark.py</span> <span class="syntax-continuation">\\</span>
  <span class="syntax-flag">--model</span> <span class="syntax-value">your-model</span> <span class="syntax-continuation">\\</span>
  <span class="syntax-flag">--agent</span> <span class="syntax-value">claude-code</span> <span class="syntax-continuation">\\</span>
  <span class="syntax-flag">--base-url</span> <span class="syntax-env">"$BASE_URL"</span> <span class="syntax-continuation">\\</span>
  <span class="syntax-flag">--api-key</span> <span class="syntax-env">"$API_KEY"</span> <span class="syntax-continuation">\\</span>
  <span class="syntax-flag">--task</span> <span class="syntax-value">offline/with-verifier/${escapeHtml(firstTask)}</span>`;

  const toast = document.querySelector("#toast");
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

  document.querySelector("#copy-registry-command").addEventListener("click", () => copyText(command));

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
})();
