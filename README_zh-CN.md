# SWE-Test

**网站：** [交互式排行榜与 Benchmark 概览](https://swe-test-benchmark.github.io/) · [网站维护与部署说明](WEBSITE.md)

**SWE-Test: Benchmarking LLM Agents' Vulnerability Discovery Ability via Input Prediction** 通过真实 C/C++ 程序上的输入预测任务评测漏洞挖掘 Agent，并将这一复合能力分解为代码理解、反馈驱动纠正和路径探索。

本基准测试提供三种模式：

- **Default：** 60 个固定目标输入预测任务。Agent 只获得源码和目标分支，不提供执行 oracle，用于隔离深层代码理解能力。
- **Feedback-enabled：** 使用相同的 60 个目标，并增加报告分支距离的验证 oracle，用于评测反馈驱动纠正能力。
- **Online Arena：** 覆盖 14 个程序的开放式路径探索模式。它移除预设目标，以归一化覆盖率增益计分；已发布榜单采用 11 个已评测程序上的 12 小时运行。

---

## Feedback-enabled

### 任务设计

每道题给 Agent 提供一个真实 C/C++ 项目（freetype2、libxml2、harfbuzz、PHP 等）中的**目标分支**。Agent 拥有以下资源：

- 目标项目的源代码（`/src/` 下）
- 覆盖率插桩后的源文件（`/out/coverage_src/` 下）
- 验证脚本 `/out/verify_seed.py` 和编译好的目标二进制 `/out/coverage_out/<program>`
- 一个当前未被任何输入触发的分支条件

Agent 的任务是构造一个新的测试输入，**使该分支条件从 FALSE 变为 TRUE**。它可以阅读源码、分析分支条件、构造候选输入、执行目标程序、使用 `verify_seed.py` 验证结果——但不能修改验证器或覆盖率基础设施。

参考答案（answer seed）是一个能触发目标分支的具体字节序列。例如，对于边界检查 `if (new_count < 0)`，Agent 需要构造一个通过合法程序路径将 `new_count` 设为负值的输入。

### 程序分布

| 领域 | 程序 | 题数 |
|--------|----------|-------|
| 语言运行时 (PHP) | `php_php_fuzz_parser`, `php_php_fuzz_execute`, `php_php_fuzz_function_jit`, `php_php_fuzz_tracing_jit` | 10 |
| SQL 解析器 | `sql_parser_fuzz_sql_parse` | 11 |
| 标记语言 (XML) | `libxml2_xml`, `libxml2_xml_e85b9b` | 10 |
| 字体排版 | `harfbuzz_hb_shape_fuzzer`, `harfbuzz_hb_shape_fuzzer_17863b`, `freetype2_ftfuzzer` | 11 |
| 网络与物联网 | `openthread_ot_ip6_send_fuzzer`, `curl_curl_fuzzer_http`, `mbedtls_fuzz_dtlsclient` | 7 |
| URL 解析 | `ada_url_can_parse`, `ada_url_parse` | 2 |
| 二进制分析 | `bloaty_fuzz_target` | 2 |
| 地理空间 | `proj4_proj_crs_to_crs_fuzzer` | 2 |
| 智能合约 | `solidity_solc_ossfuzz_proto` | 1 |
| 加密 / SSL | `openssl_x509` | 1 |
| JS 引擎 | `quickjs_fuzz_regexp` | 1 |
| 音频编解码 | `vorbis_decode_fuzzer` | 1 |
| JSON 处理器 | `jq_jq_fuzz_execute` | 1 |

### 评测结果

**评分：** Pass = 命中目标分支，Fail = 其他。

#### Feedback-enabled

| 模型 | Scaffold | Effort | Valid | Pass Rate | SWE-bench-Verified | Terminal-Bench-2.0 | 平均 Turns | 平均耗时 | Tokens |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GLM-5.1 | claude-code | high | **60/60** | **56.7%** | 77.8%*(OpenHands, GLM-5 base) | 69.0%(vendor) | 394.8 | 118.1m | 18.76M |
| GLM-5.1 | claude-code | low | 36/60 | 33.3% | 77.8%*(vendor) | 69.0%(vendor) | 389.4 | 111.2m | 20.14M |
| GLM-5.1 | claude-code | medium | 33/60 | 27.3% | 77.8%*(vendor) | 69.0%(vendor) | 422.3 | 124.2m | 21.12M |
| Opus-4.6 | claude-code | high | **60/60** | 45.0% | 80.8%(vendor) | 76.4%(Meta-Harness) | 235.4 | 47.6m | 11.54M |
| Kimi-K2.6 | claude-code | high | **60/60** | 36.7% | 80.2%(vendor) | 66.7%(vendor) | 582.3 | 120.0m | 25.16M |
| DeepSeek-V4-Pro | claude-code | high | **60/60** | 36.7% | 79.4%(vendor; Pro-Max 80.6%) | 67.9%(vendor, Pro-Max) | 450.4 | 97.1m | 17.76M |
| GPT-5.5 | codex | high | **60/60** | 23.3% | — | — | 115.9 | 17.5m | 265.53M |
| Kimi-K2.6 | kimi-code | — | **60/60** | 16.7% | 80.2%(vendor) | 66.7%(vendor) | 199.8 | 27.6m | N/A |
| Qwen3.7-Max | claude-code | high | **60/60** | 16.7% | 80.4%(vendor) | 69.7%(vendor) | 226.8 | **17.3m** | 7.71M |
| Qwen3.7-Max | qwen-coder | — | 57/60 | 10.5% | 80.4%(vendor) | 69.7%(vendor) | 91.5 | 29.2m | 4.94M |
| Opus-4.8 | claude-code | high | **60/60** | 10.0% | 88.6%(vendor) | 74.6%(vendor) | 161.3 | 58.1m | 4.45M |
| GLM-5.2 | claude-code | high | **60/60** | 8.3% | — | — | 139.6 | 18.1m | 6.29M |
| GLM-5.2 | terminus-2 | — | 49/60 | 8.2% | — | — | 52.0 | 38.4m | 3.06M |
| Kimi-for-coding | claude-code | high | 58/60 | 6.9% | — | — | 208.8 | 18.6m | 8.07M |
| MiniMax-M3 | claude-code | high | 21/60 | 4.8% | 80.5%(vendor) | - | 124.3 | 10.7m | 4.76M |
| Kimi-K2.6 | terminus-2 | — | 25/60 | 4.0% | — | — | N/A | 33.6m | 10.05M |
| DeepSeek-V4-Pro | terminus-2 | — | 27/60 | 3.7% | 79.4%(vendor) | 67.9%(vendor) | N/A | 53.6m | 5.25M |
| Kimi-for-coding | terminus-2 | — | 44/60 | 2.3% | — | — | 94.0 | 55.8m | 5.62M |
| Gemini-3.5-Flash | gemini-cli | — | **60/60** | 1.7% | 78.8%(vendor) | 76.2%(vendor) | N/A | 4.1m | N/A |
| Qwen3.7-Max | codex | high | **60/60** | 1.7% | 80.4%(vendor) | 69.7%(vendor) | 78.5 | 11.9m | 3.17M |
| GLM-5.1 | terminus-2 | — | 61/60 | 1.6% | — | — | 75.0 | 118.9m | 3.16M |
| GPT-OSS-120B | codex | high | **60/60** | 0.0% | ~62%(mini-SWE-agent) | 18.7%(Terminus 2) | 6.4 | 1.0m | 0.04M |
| Grok-4.3 | claude-code | high | **60/60** | 0.0% | - | - | 23.5 | 0.3m | 0.12M |
| Qwen3.7-Max | terminus-2 | — | **60/60** | 0.0% | 80.4%(vendor) | 69.7%(vendor) | N/A | 9.2m | 36.07M |
| Mimo-v2.5-pro | terminus-2 | — | 14/60 | 0.0% | — | — | N/A | 15.1m | 1.03M |
| Mimo-v2.5-pro | claude-code | high | 56/60 | 0.0% | — | — | 23.3 | 2.5m | 0.41M |
| **平均** |  |  |  | 13.7% | — | — | 195.0 | 44.6m | 20.18M |

---

## Default

同样的 60 个任务实例不提供执行 oracle。Agent 必须仅凭源码进行数据流追踪、约束推断和输入构造，以隔离深层代码理解能力。

#### 评测结果

| 模型 | Scaffold | Effort | Valid | Pass Rate | 平均 Turns | 平均耗时 | Tokens |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Kimi-K2.6 | kimi-code | — | **60/60** | **8.3%** | 167.6 | 26.9m | N/A |
| Kimi-K2.6 | claude-code | high | **60/60** | **8.3%** | 260.1 | 55.9m | 9.77M |
| GLM-5.2 | claude-code | high | **60/60** | **8.3%** | 111.4 | 11.9m | 4.78M |
| Qwen3.7-Max | qwen-coder | — | **60/60** | 6.7% | 41.4 | 14.4m | 1.71M |
| GLM-5.2 | terminus-2 | — | 49/60 | 6.1% | N/A | 39.7m | 2.51M |
| Opus-4.6 | claude-code | high | **60/60** | 5.0% | 114.3 | 32.0m | 2.80M |
| Qwen3.7-Max | claude-code | high | **60/60** | 5.0% | 87.8 | 8.5m | 2.25M |
| MiniMax-M3 | claude-code | high | 24/60 | 4.2% | **26.8** | **2.7m** | **0.66M** |
| Mimo-v2.5-pro | terminus-2 | — | 24/60 | 4.2% | N/A | 8.5m | 0.33M |
| Qwen3.7-Max | codex | high | **60/60** | 3.3% | 45.8 | 5.7m | 1.17M |
| Kimi-for-coding | terminus-2 | — | 38/60 | 2.6% | N/A | 19.7m | 1.31M |
| Kimi-K2.6 | terminus-2 | — | 46/60 | 2.2% | N/A | 12.2m | 1.89M |
| DeepSeek-V4-Pro | terminus-2 | — | 50/60 | 2.0% | N/A | 19.5m | 1.46M |
| GLM-5.1 | terminus-2 | — | 59/60 | 1.7% | N/A | 29.5m | 5.85M |
| Qwen3.7-Max | terminus-2 | — | **60/60** | 1.7% | N/A | 6.4m | 16.29M |
| GLM-5.1 | claude-code | high | **60/60** | 1.7% | 76.0 | 15.9m | 2.44M |
| GLM-5.1 | claude-code | low | **60/60** | 3.3% | 96.4 | 32.1m | 3.52M |
| GLM-5.1 | claude-code | medium | **60/60** | 5.0% | 72.3 | 21.0m | 2.34M |
| Mimo-v2.5-pro | claude-code | high | **60/60** | 0.0% | 10.4 | 2.4m | 0.15M |
| GPT-OSS-120B | codex | high | **60/60** | 0.0% | 6.8 | 1.2m | 0.04M |
| GPT-OSS-120B | terminus-2 | — | 59/60 | 0.0% | N/A | 0.9m | 0.01M |
| **平均** |  |  |  | 3.8% | 85.9 | 17.5m | 3.06M |

---

## Online Arena

开放式 Agent 评测模式，无预设目标分支。Agent 持续迭代以最大化 14 个真实开源程序的代码覆盖率；运行时长可配置，已发布榜单统一采用 12 小时窗口以便比较。

### 任务设计

Agent 运行在 Docker 容器中，可访问目标二进制、源码、初始种子和覆盖率工具 `cov.py`，按以下循环自主运行：

1. 查询当前种子覆盖率，获取未覆盖代码分支列表
2. 阅读源码及逐行覆盖率标注，理解输入如何控制分支条件
3. 使用 Bash、Python 或任意方式生成新种子，尝试命中未覆盖分支
4. 再次调用工具验证覆盖率提升，回到步骤 1

### 目标程序

| # | 程序 | 项目 | 输入类型 | 领域 |
|---|----------|---------|-------------|--------|
| 1 | `quickjs_fuzz_eval` | QuickJS | JavaScript | JS 引擎 |
| 2 | `v8_d8` | V8 | JavaScript | JS 引擎 |
| 3 | `spidermonkey_js` | SpiderMonkey | JavaScript | JS 引擎 |
| 4 | `jsc_jsc` | JavaScriptCore | JavaScript | JS 引擎 |
| 5 | `openssl_x509` | OpenSSL | X.509 DER | 网络协议 |
| 6 | `libxml2_xml` | libxml2 | XML | 标记语言 |
| 7 | `sqlite3_ossfuzz` | SQLite | SQL | 数据库 |
| 8 | `libpng_libpng_read_fuzzer` | libpng | PNG 图片 | 图像 |
| 9 | `harfbuzz_hb-shape-fuzzer` | HarfBuzz | 字体文件 | 文本渲染 |
| 10 | `libpcap_fuzz_both` | libpcap | pcap 数据包 | 网络 |
| 11 | `cpython3_fuzz_pycompile` | CPython | Python 源码 | 语言运行时 |
| 12 | `php_php-fuzz-execute` | PHP | PHP 源码 | 语言运行时 |
| 13 | `lua_fuzz_lua` | Lua | Lua 源码 | 语言运行时 |
| 14 | `libjpeg-turbo_libjpeg_turbo_fuzzer` | libjpeg-turbo | JPEG 图片 | 图像 |

### 测量指标

采用 LLVM source-based code coverage 的 4 个维度（Regions、Lines、Branches、Functions），每个维度独立归一化：

```
metric_reward = clamp((final_pct - baseline_pct) / (100 - baseline_pct), 0, 1)
composite     = mean(regions_reward, lines_reward, branches_reward, functions_reward)
```

### 快速开始

```bash
harbor run -p harbor-tasks-cov/quickjs_fuzz_eval --jobs-dir ./jobs-quickjs \
  -a claude-code \
  --ae ANTHROPIC_AUTH_TOKEN=sk-xxx \
  --ae ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/apps/anthropic \
  --ae ANTHROPIC_MODEL=qwen3.7-max \
  --ae ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.6-flash \
  --ae ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.7-max \
  --ae ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.7-max \
  --ae CLAUDE_CODE_SUBAGENT_MODEL=qwen3.7-max \
  --ae CLAUDE_CODE_EFFORT_LEVEL=max
```

---

## 运行（Default 与 Feedback-enabled）

### 前置要求

- Python 3.12+, Docker 正常运行, 推荐使用 `uv`

```bash
uv sync
docker info >/dev/null
```

### Feedback-enabled

```bash
# 全量运行
python run_benchmark.py \
  --api-key YOUR_API_KEY \
  --base-url https://dashscope.aliyuncs.com/apps/anthropic \
  --model qwen3.7-max \
  --agent claude-code \
  --tasks-dir tasks/swe-test \
  --extra --n-concurrent 4 --agent-timeout-multiplier 2

# 单题
python run_benchmark.py \
  --api-key YOUR_API_KEY \
  --base-url https://dashscope.aliyuncs.com/apps/anthropic \
  --model qwen3.7-max \
  --agent claude-code \
  --task tasks/swe-test/<task_name>
```

### Default

与上面相同，将 `--tasks-dir` 替换为 `tasks/swe-test-wo-verifier`。

### 结果位置

- 单题结果：`jobs/<job_name>/<trial_name>/result.json`
- 任务汇总：`jobs/<job_name>/result.json`
- 后台日志：`run_logs/<job_name>.log`

---

### Online Arena

```bash
harbor run -p harbor-tasks-cov/quickjs_fuzz_eval --jobs-dir ./jobs-quickjs \
  -a claude-code \
  --ae ANTHROPIC_AUTH_TOKEN=sk-xxx \
  --ae ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/apps/anthropic \
  --ae ANTHROPIC_MODEL=qwen3.7-max \
  --ae ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.6-flash \
  --ae ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.7-max \
  --ae ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.7-max \
  --ae CLAUDE_CODE_SUBAGENT_MODEL=qwen3.7-max \
  --ae CLAUDE_CODE_EFFORT_LEVEL=max
```

## Roadmap

| 状态 | 项目 |
|--------|------|
| 完成 | Opus-4.6 (Feedback-enabled) |
| 完成 | GPT-5.5 (Feedback-enabled) |
| 完成 | GLM-5.2 (Feedback-enabled) |
| 完成 | GLM-5.2 (Default) |

---

## 任务目录结构

```
tasks/<task-name>/
├── task.toml            # harbor 配置: 超时、资源、元数据
├── instruction.md       # 运行时发给 agent 的指令
├── environment/
│   ├── Dockerfile       # 构建沙箱镜像，编译目标程序
│   └── src/
│       └── *.c          # 目标程序源码
├── tests/
│   └── test.sh          # 验证器脚本（写 reward 到 /logs/verifier/reward.txt）
└── solution/
    └── solve.sh         # 参考解
```

---

## 支持的 Agent

| Agent | `--agent` 参数 | 备注 |
|-------|-----------------|-------|
| Claude Code | `claude-code` | 默认；使用 `ANTHROPIC_API_KEY` |
| Codex CLI | `codex` | 使用 `OPENAI_API_KEY` |
| Aider | `aider` | 使用 `OPENAI_API_KEY` |
| OpenHands | `openhands` | 完整 SWE-agent |
| SWE-Agent | `swe_agent` | |
| Gemini CLI | `gemini_cli` | 使用 `GEMINI_API_KEY` |
