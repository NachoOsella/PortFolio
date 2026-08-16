---
title: I gave an LLM a hierarchy to fill, not a blank chat window
slug: spring-ai-structured-plans
description: "I explain how PlanAI sends project context to a Spring AI chat flow, extracts a hierarchy from conversation history, and exposes the limits of the current implementation."
status: published
ink: purple
category: AI engineering
tags:
  - Java
  - Spring AI
  - LLM
  - PostgreSQL
publishedAt: 2026-01-20
updatedAt: 2026-08-03
seoTitle: I built a conversational planning flow with Spring AI and PostgreSQL
seoDescription: "I built PlanAI around Spring AI, Groq, PostgreSQL, and a Project-to-Epic-to-Story-to-Task model, then documented where generated JSON still needs stronger validation."
---

# I wanted the conversation to leave a structure behind

I built PlanAI because many AI planning demos end where the useful work should begin. They produce polished prose, then lose it when the tab closes. I wanted a conversation that could become a persisted project plan: epics, user stories, tasks, statuses, priorities, and a history I could revisit.

The AI call turned out to be the easy part. The harder part was deciding how much context to send, when to persist it, and what to do when a model returns something that looks structured but does not deserve to touch my database yet.

## I gave the model a narrow shape to talk about

The domain is a four-level hierarchy:

```text
Project
└── Epic
    └── User story
        └── Task
```

I persist that tree with JPA entities and keep conversations and messages alongside it. Each level carries its own status or priority where it makes sense. I use DTOs and mappers at the HTTP boundary, so the model behind the API remains separate from the JSON contract I show to the frontend.

The shape matters because I do not want an assistant that only writes. I want an assistant that can discuss a project and eventually produce something I can sort, edit, and inspect as data.

## I made chat and extraction separate operations

When I receive a message at `POST /api/v1/projects/{projectId}/chat`, I load the project with its hierarchy, recover the ten most recent messages from the current conversation, save the new user message, build the planning prompt with the current project context, call `ChatClient`, and save the assistant response.

I return the conversation id with both messages so the frontend can continue the same thread. The chat response itself does not mutate the project plan. That distinction prevents a friendly sentence from silently becoming a database change.

Extraction is explicit at `POST /api/v1/projects/{projectId}/extract-plan`. I gather every conversation for the project, assemble the history, load a second prompt that asks for the `epics`, `userStories`, and `tasks` hierarchy, and pass the model response to the extraction path.

## I learned that JSON is not validation

The current extraction path finds the first `{` and the last `}` in the response, parses that substring with Jackson, clears the project's existing epics, and rebuilds the tree. If a title is empty, I supply an “Untitled” default. If a priority is invalid, I use `MEDIUM`. New entities start at `TODO`, and missing estimates fall back to four hours.

That implementation is intentionally visible in the repository, and it is not a schema-safe command pipeline. I do not have a `PlanProposal` type, a closed command vocabulary, or a domain validator that checks references and state transitions before persistence. If I were hardening this flow, I would validate a typed proposal first and only then apply a transactionally safe update.

The honest lesson is more valuable than the fashionable one: a model can produce valid JSON and still produce invalid product behavior.

## I kept the rest of the backend conventional

I built the backend as a layered Spring Boot application: controllers receive requests, services own behavior, repositories own persistence, and mappers keep entities away from the API. I added global error handling, validation annotations on request DTOs, SpringDoc OpenAPI, CORS configuration, and a custom Spring AI setup for Groq's OpenAI-compatible endpoint.

The current model configuration uses `meta-llama/llama-4-scout-17b-16e-instruct`. I load the planning prompts from resources rather than burying them in Java strings, which makes the behavioral contract easier to read and change.

## I treated the frontend as an experiment

I built the Angular interface with standalone components, Signals, Tailwind CSS, project and chat stores, a project list, a split detail view, and a hierarchical plan view. I also used AI agents heavily while building the frontend, then reviewed the output by hand.

That division taught me something specific. Generated code was useful for scaffolding and repetitive UI, but empty states, accessibility details, and the boundaries between asynchronous states still needed deliberate human review. I kept the backend and its invariants in my own hands.

## What I would strengthen next

I would add authentication, versioned database migrations instead of relying on `ddl-auto: update`, integration tests around the AI service, and a validator that prevents extraction from replacing an existing plan with untrusted structure. I would also align the frontend and backend conversation endpoints so the public contract describes one API rather than two nearby assumptions.

## What I learned

AI features do not remove ordinary software engineering. They make ordinary engineering more important. Context assembly, persistence boundaries, error semantics, and validation decide whether a model is a useful collaborator or an unpredictable write path.

PlanAI makes the model feel like the feature. The real feature is the boundary I still have to own after the model finishes talking.
