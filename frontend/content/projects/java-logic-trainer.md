---
title: java-logic-trainer.nvim
slug: java-logic-trainer
description: "I built a Neovim plugin that teaches Java logic through 187 deterministic, test-driven exercises instead of an AI judge."
status: published
ink: blue
featured: false
projectType: Neovim plugin
role: I designed and authored the plugin
duration: Three-week build
technologies:
  - Lua
  - Neovim 0.9+
  - Java 17
  - Maven
  - JUnit 5
repositoryUrl: https://github.com/NachoOsella/java-logic-trainer.nvim
publishedAt: 2026-05-19
updatedAt: 2026-08-03
displayOrder: 4
---

# Overview

I built `java-logic-trainer.nvim` for the way I actually learn: inside the editor, with a short feedback loop and no browser tab asking me to pretend the environment is part of the lesson. The plugin opens a Java exercise, gives me starter code and a clear statement, runs Maven and JUnit locally, and keeps the next useful action close at hand.

## I built a curriculum, not a prompt box

The catalog contains exactly 187 exercises across five levels:

- **Level 0: Basics** — 62 exercises on values, parameters, arithmetic, booleans, chars, and strings.
- **Level 1: Beginner** — 41 exercises on conditionals, loops, counting, and simple arrays.
- **Level 2: Beginner+** — 36 exercises on edge cases, normalization, traversal, and validation.
- **Level 3: Intermediate** — 35 exercises on maps, sets, frequency counting, two pointers, and matrices.
- **Level 4: Advanced** — 13 exercises on recursion, backtracking, dynamic programming, and graph basics.

I designed the sequence so a learner can start with a method that returns a value and eventually reach problems that demand more deliberate algorithmic thinking. Every exercise includes starter code, visible tests, a full-check fixture, and three progressive hints.

## I chose tests over an AI judge

I expose two modes. `:JavaLogicRunVisible` generates a small JUnit test class from the visible assertions so I can iterate without seeing the final edge cases. `:JavaLogicCheck` runs the exercise's full-check fixture once I believe the solution is ready.

The verdict comes from `mvn -q test`, not from an LLM's mood. I chose that because beginners need feedback they can trust: a compile error means the code does not compile, a failing assertion shows an expected and actual value, and a green run has the same meaning tomorrow.

The hidden checks are hidden from the interface, not cryptographically secret. They live in the repository's exercise definitions and are written into the local workspace when I run them. I prefer stating that clearly over pretending a local learning plugin can protect its test data from the person who installed it.

## I made the editor part of the loop

I split the exercise into `STATEMENT.md` and `Exercise.java`, reuse a local Maven workspace, and run checks asynchronously so Neovim remains usable while Java does its work. When compilation fails, I parse the output into the quickfix list. When the summary is not enough, `:JavaLogicLastOutput` keeps the raw Maven output available.

The plugin is divided into small Lua modules: commands, exercise loading and validation, workspace management, the runner, feedback parsing, progress, picker behavior, and UI. On startup I validate required fields and duplicate exercise ids, because content errors in a learning tool are just as disruptive as code errors.

## I made progress survive the session

I store progress in `stdpath("data")/java-logic-trainer/progress.json`. For each exercise I track openings, runs, failures, successes, hints used, timestamps, and the last failure category. `:JavaLogicStats`, `:JavaLogicList`, and `:JavaLogicReview` turn that record into a next action instead of another dashboard to maintain.

The review picker is a useful heuristic, not a complete spaced-repetition system. It prioritizes pending exercises, repeated failures, and hint usage; it does not yet calculate a real aging threshold for completed work.

## What I would improve next

I would add an automated test suite for the Lua modules, introduce a real execution timeout, and make workspace preservation safer when moving between exercises. Those are not reasons to hide the current shape; they are the next boundaries I would strengthen.

## What I learned

Most of the work was not syntax in Lua. It was state: which buffer owns the solution, which test fixture is active, whether Maven is still running, and how to turn compiler output into a useful editor location. The project reinforced a lesson I keep finding elsewhere: a small tool earns trust by making its source of truth boring and its feedback precise.
