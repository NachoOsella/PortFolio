---
title: java-logic-trainer.nvim
slug: java-logic-trainer
description: A Neovim plugin that teaches Java logic from absolute zero — 187+ exercises across 5 levels, checked by real Maven and JUnit 5 tests instead of AI.
status: published
ink: blue
featured: false
projectType: Neovim plugin
role: Author
duration: 3 weeks
technologies:
  - Lua
  - Neovim
  - Java 17
  - Maven
  - JUnit 5
repositoryUrl: https://github.com/NachoOsella/java-logic-trainer.nvim
publishedAt: 2026-05-19
updatedAt: 2026-08-03
displayOrder: 4
---

# Overview

java-logic-trainer.nvim is a Neovim plugin for learning Java logic from zero. It ships a structured curriculum of 187+ exercises across 5 difficulty levels, opens each exercise in a two-pane split (statement on the left, `Exercise.java` on the right), and checks solutions by running real Maven builds with JUnit 5 tests.

## Why no AI checker

The checker is deliberately deterministic. An LLM judge is a moving target: it can pass a wrong solution on a generous day and confuse a beginner on a strict one. JUnit is ground truth — the same input always produces the same verdict, and a red bar means exactly one thing.

## The curriculum

Five levels, from "return a value" to dynamic programming: basics (62 exercises), beginner (41), beginner+ (36), intermediate (35), and advanced (13) covering recursion, backtracking, and graph basics. Every exercise includes a statement with examples, starter code, visible tests for learning, hidden tests for final validation, and three progressive hints.

## Key decisions

- **Visible vs hidden tests.** `:JavaLogicRunVisible` runs the safe, shown tests for debugging; `:JavaLogicCheck` runs the full suite including hidden edge cases. The two-tier system makes practice feel like a real platform without leaking the answers.
- **Progress that survives restarts.** Opens, runs, failures, hints used, and completion timestamps are tracked per exercise in `~/.local/share/nvim/java-logic-trainer/progress.json`, including the last failure kind (compile, test, timeout).
- **Progressive hints, not solutions.** `:JavaLogicHint` reveals one clue at a time, so getting unstuck never means reading the answer.
- **Compile errors go to quickfix.** Failures land where a Neovim user already knows how to navigate.

## What I learned

Writing a plugin taught me how much of the UX is bookkeeping: curriculum state, async Maven runs, buffer lifecycle, and the split between what the UI shows and what the filesystem owns. Lua's small surface area helped — the plugin is a few focused modules, not a framework.
