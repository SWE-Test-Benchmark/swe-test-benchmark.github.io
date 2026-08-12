# Experiment Results

This document records the four fixed-task runs added to the leaderboard in August 2026.

## Scoring rule

- The benchmark has 60 fixed tasks in each mode.
- Pass rate is the number of rewards greater than or equal to `1.0`, divided by 60.
- Average reward is the sum of recorded rewards divided by 60. Missing rewards therefore contribute zero.
- `Trial dirs` counts trial directories created. `Scored` counts tasks with a recorded reward. `Exceptions` is the reported exception count.

| Mode | Model | Scaffold | Trial dirs | Scored | Pass rate | Avg. reward | Exceptions |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Feedback-enabled | Qwen3.8-Max | claude-code | 60 / 60 | 57 / 60 | 32 / 60 (53.3%) | 0.864 | 35 |
| Default | Qwen3.8-Max | claude-code | 60 / 60 | 58 / 60 | 45 / 60 (75.0%) | 1.248 | 7 |
| Feedback-enabled | Kimi K3 | claude-code | 42 / 60 | 42 / 60 | 31 / 60 (51.7%) | 0.881 | 0 |
| Default | Kimi K3 | claude-code | 60 / 60 | 60 / 60 | 42 / 60 (70.0%) | 0.999 | 0 |

## Sources

| Model and mode | Artifact location | Run window (local timestamps) | Dataset recorded in config |
| --- | --- | --- | --- |
| Qwen3.8-Max, Feedback-enabled | `/home/kid/SWE-Test-Benchmark/jobs/2026-08-11__14-36-20` | 2026-08-11 14:36:21 to 2026-08-12 21:37:39 | `tasks/qwen38_verifier` |
| Qwen3.8-Max, Default | `/home/kid/SWE-Test-Benchmark/jobs/2026-08-11__14-37-15` | 2026-08-11 14:37:15 to 2026-08-11 23:16:25 | `tasks/qwen38_wo_verifier` |
| Kimi K3, Feedback-enabled | `/home/syx/k3.zip` (`kimi-k3_claude-code_w-verifier`) | 2026-08-02 10:55:01 to 2026-08-04 01:22:54 | `tasks/swe-test` |
| Kimi K3, Default | `/home/syx/k3.zip` (`kimi-k3_claude-code_wo-verifier`) | 2026-08-02 12:39:57 to 2026-08-03 16:43:13 | `tasks/swe-test-wo-verifier` |

The Kimi archive's agent configuration reports the provider model name as `kimi-for-coding`; the leaderboard label uses `Kimi K3` to identify the supplied K3 experiment. The Kimi feedback-enabled run has 42 completed and scored trial directories, so the 18 missing tasks are counted as zero for its displayed pass rate and average reward.
