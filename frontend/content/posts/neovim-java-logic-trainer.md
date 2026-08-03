---
title: I built a Neovim plugin that teaches Java — with tests, not AI
slug: neovim-java-logic-trainer
description: Why java-logic-trainer.nvim checks 187+ exercises with real Maven and JUnit 5 runs instead of an LLM judge, and what writing a Neovim plugin in Lua taught me about UX.
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
seoTitle: A Neovim plugin that teaches Java with JUnit, not AI
seoDescription: java-logic-trainer.nvim ships 187+ exercises across 5 levels with visible and hidden JUnit tests, progressive hints, and persistent progress — all deterministic by design.
---

# The checker does not use AI

That sentence is in the README of java-logic-trainer.nvim for a reason. When I started building a plugin to teach Java logic from absolute zero, the obvious 2026 move was to have an LLM grade the solutions. I went the other way: every exercise is validated by a real Maven build running real JUnit 5 tests.

This post explains why, and what the plugin actually does.

## Why deterministic beats clever for beginners

An LLM judge is a moving target. It can pass a subtly wrong solution on a generous day and reject a correct one for using a `while` instead of a `for`. For someone who barely knows Java syntax, that noise is devastating — they cannot tell the difference between "my logic is wrong" and "the grader is moody."

JUnit has no moods. The same input produces the same verdict, a red bar means exactly one thing, and a beginner builds trust in the feedback loop. Trust in the feedback loop is the entire product.

## The curriculum

187+ exercises across 5 levels, each with a statement, starter code, visible tests, hidden tests, and three progressive hints:

| Level | Focus | Exercises |
|---|---|---|
| 0 — Basics | Return values, parameters, arithmetic, booleans, chars, string basics | 62 |
| 1 — Beginner | Conditionals, simple loops, counting, summing, simple arrays | 41 |
| 2 — Beginner+ | Nested conditionals, loop edge cases, string normalization, validation | 36 |
| 3 — Intermediate | Hash maps, sets, frequency counting, two pointers, matrix basics | 35 |
| 4 — Advanced | Recursion, backtracking, dynamic programming intro, graph basics | 13 |

Level 0 assumes the learner can barely write a method signature. The ramp is deliberate — nobody should meet two pointers before they have summed an array with a loop.

## The two-tier test system

Every exercise has two suites:

- **Visible tests** (`:JavaLogicRunVisible`) — straightforward cases shown in the UI. These are for debugging; the learner reads them, runs them, and iterates.
- **Hidden tests** (`:JavaLogicCheck`) — edge cases that are never displayed. They run together with the visible ones for the final verdict.

The split makes practice feel like a real platform (think LeetCode's "Run" vs "Submit") without leaking the answers. A solution that hardcodes the visible cases fails the hidden ones — which is itself a lesson.

## Progressive hints, never solutions

`:JavaLogicHint` reveals one clue at a time, three per exercise. The first restates the problem in plainer words; the second sketches an approach; the third is close to pseudocode. Getting unstuck never means reading a finished solution, because there isn't one in the UI. The hint counter is tracked per exercise, so the stats page can show which topics needed the most help.

## The plugin mechanics

The exercise view is a vertical split: `STATEMENT.md` on the left, `Exercise.java` on the right. Checks run Maven asynchronously — Neovim stays responsive while JUnit does its thing — and results land where a Neovim user already lives:

- Compile errors open in the **quickfix list** (`:JavaLogicErrors`), navigable with the usual muscle memory.
- Raw test output is one command away (`:JavaLogicLastOutput`) for when the summary is not enough.
- Progress persists to `~/.local/share/nvim/java-logic-trainer/progress.json`: opens, runs, failures, hints used, timestamps, and the last failure kind (`compile`, `test`, `timeout`).

```lua
{
  "NachoOsella/java-logic-trainer.nvim",
  config = function()
    require("java-logic-trainer").setup({ keymaps = true })
  end,
}
```

The beginner path is deliberately small: `:JavaLogicBeginner`, read the statement, edit the method, `:JavaLogicRunVisible`, `:JavaLogicHint` if stuck, `:JavaLogicCheck` when green, `:JavaLogicNext`. Eight commands cover the whole loop; the rest (`:JavaLogicReview`, `:JavaLogicStats`, filters in `:JavaLogicList`) exist for when the habit has formed.

## What writing a Neovim plugin taught me

Most of the work was not Lua — it was bookkeeping. Curriculum state, buffer lifecycle, async job handles, the boundary between what the UI shows and what the filesystem owns. Lua's small surface area helped: the plugin is a handful of focused modules, not a framework with a plugin inside.

The deeper lesson is the one I keep relearning on every project: **pick the boring source of truth and build trust around it.** For Lembas it was one order model; for this plugin it is a JUnit verdict. The clever parts — hints, stats, review scheduling — only work because the foundation never lies.
