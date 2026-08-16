---
title: I built a Neovim plugin that teaches Java with tests
slug: neovim-java-logic-trainer
description: "I explain why java-logic-trainer.nvim uses Maven and JUnit for 187 exercises, how its editor loop works, and where I still want to strengthen it."
status: published
ink: blue
category: Developer tools
tags:
  - Neovim
  - Lua
  - Java
  - JUnit
publishedAt: 2026-05-21
updatedAt: 2026-08-03
seoTitle: I built a Neovim plugin that teaches Java with JUnit
seoDescription: "I built java-logic-trainer.nvim with 187 exercises, visible and full-check test modes, progressive hints, asynchronous Maven runs, and persistent progress."
---

# I did not want another AI judge

I built `java-logic-trainer.nvim` to teach Java logic from inside Neovim. The obvious shortcut would have been to ask an LLM whether a solution looked correct. I chose a less glamorous contract: write a local Java workspace, run Maven, and let JUnit decide.

That decision shaped the product more than the language did. A beginner should not have to wonder whether a failing grade came from a subtle logic error, a generous model, or a model that changed its mind. A test result is narrower, but its narrowness is exactly what makes it useful.

## I built the curriculum from the first method outward

The plugin contains exactly 187 exercises across five levels:

| Level | Focus | Exercises |
| --- | --- | ---: |
| 0 | Values, parameters, arithmetic, booleans, chars, strings | 62 |
| 1 | Conditionals, loops, counting, and simple arrays | 41 |
| 2 | Edge cases, normalization, traversal, and validation | 36 |
| 3 | Maps, sets, frequency counting, two pointers, and matrices | 35 |
| 4 | Recursion, backtracking, dynamic programming, and graph basics | 13 |

I wanted Level 0 to assume almost nothing. The sequence moves from returning a value to choosing an algorithm, with enough repetition that the learner can build fluency before the problem starts asking for technique.

Every exercise carries a statement, starter code, visible assertions, a full-check fixture, and three hints. The catalog loader validates required fields and duplicate ids at startup because a broken exercise is a broken lesson.

## I separated practice from proof

The beginner loop is intentionally small:

1. I open `STATEMENT.md` on the left and `Exercise.java` on the right.
2. I edit the method.
3. I run `:JavaLogicRunVisible` while I am still exploring.
4. I ask for `:JavaLogicHint` when I need a nudge.
5. I run `:JavaLogicCheck` when I believe the solution is ready.
6. I use `:JavaLogicNext` to continue.

Visible mode generates an `ExerciseTest.java` from the assertions shown in the exercise. Full mode writes the exercise's full-check fixture and runs `mvn -q test`. I keep the two actions separate so the learner can debug with useful information without turning the final edge cases into a checklist.

The full-check data is hidden from the interface, not protected as a secret. It lives in the repository's Lua definitions and is written into the local workspace when the check runs. That is the honest boundary for a local teaching tool.

## I kept Maven asynchronous

The runner creates or reuses a Maven workspace, writes the active test file, launches Maven asynchronously, and renders the result in a floating buffer. Neovim stays available while Java works. When compilation fails, I parse the output into the quickfix list. When the friendly summary is not enough, `:JavaLogicLastOutput` exposes the raw output.

I split the plugin into focused modules: commands, catalog loading, workspace management, the runner, feedback parsing, progress, exercise selection, and UI. That structure keeps the integration points visible and makes the learning loop easier to change without turning `init.lua` into a control tower.

## I made progress a small file

I persist progress at `stdpath("data")/java-logic-trainer/progress.json`. For each exercise I store openings, runs, failures, successes, hint usage, timestamps, and the last failure category. `:JavaLogicStats` summarizes it, `:JavaLogicList` filters it, and `:JavaLogicReview` chooses a next candidate.

The review mode is a prioritization heuristic, not a full spaced-repetition engine. It gives weight to incomplete exercises, repeated failures, and used hints, but it does not yet apply a real elapsed-time threshold to completed exercises.

## What I would improve next

I would add automated tests for the Lua modules, implement a real execution timeout, and make solution preservation safer when switching between exercises. I would also consider how much of the workspace should be visible to a learner who wants to inspect the mechanics behind the checks.

## What I learned

The hard part was bookkeeping: buffer ownership, asynchronous job state, test-fixture selection, progress migration, and turning Maven output into a location I could act on. Lua gave me a small surface area, but good editor tooling still depends on careful state transitions.

I keep coming back to the same principle: choose a boring source of truth and build trust around it. In this plugin, that source is a JUnit verdict.
