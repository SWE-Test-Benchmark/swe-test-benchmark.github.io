# SWE-TEST website

The benchmark website is a dependency-free static application designed for GitHub Pages.

## Local preview

From the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Updating results

Leaderboard entries and task-domain summaries live in `data/leaderboard.js`. The page reads this data at runtime, so updating a score does not require changing the HTML or JavaScript logic.

Each leaderboard record uses this schema:

```js
{
  model: "Model name",
  agent: "agent-harness",
  effort: "default",
  trials: "60 / 60",
  trialsValue: 60,
  scored: "60 / 60",
  scoredValue: 60,
  score: 42.0,
  avgReward: 0.500,
  exceptions: 0
}
```

SWE-TEST Online uses a separate 12-hour aggregate schema:

```js
{
  model: "Model name",
  agent: "claude-code",
  duration: "12h",
  tasks: "11 / 11",
  score: 0.3136,
  bugs: 0,
  tokens: "4.414B",
  tokensValue: 4.413630528,
  cost: "$2,544.82",
  costValue: 2544.82
}
```

`score` is the mean normalized coverage reward. `bugs` counts findings with an upstream issue number or confirmed fix. Numeric token and cost fields support client-side sorting; the formatted fields are displayed in the table.

## Deployment

The workflow in `.github/workflows/pages.yml` publishes only the website files whenever `main` receives a relevant change. In the GitHub repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The expected URL is:

`https://swe-test-benchmark.github.io/`

## Structure

- `index.html` — semantic page structure and copy
- `assets/styles.css` — responsive design and light/dark themes
- `assets/app.js` — leaderboard, search, sort, theme, and copy interactions
- `assets/registry.js` — corpus detail pages and task-instance interactions
- `data/leaderboard.js` — benchmark results and corpus metadata
- `data/corpus.js` — evaluation-domain and task inventory
- `data/task-details.js` — per-task summaries shown in the registry
