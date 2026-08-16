---
title: PlanAI
slug: planai
description: "I built a conversational planning tool that turns project discussions into a persisted hierarchy of epics, stories, and tasks."
status: published
ink: purple
featured: true
projectType: AI-integrated full-stack application
role: I designed the backend and orchestrated the full-stack build
duration: One-month build
technologies:
  - Java 21
  - Spring Boot 3.3.4
  - Spring AI 1.0.0-M3
  - Groq API
  - Llama 4 Scout
  - PostgreSQL 16
  - Angular 21
  - Signals
  - Docker Compose
repositoryUrl: https://github.com/NachoOsella/PlanAi
publishedAt: 2026-01-18
updatedAt: 2026-08-03
displayOrder: 2
---

# Overview

I built PlanAI around a simple frustration: a planning conversation should leave something more durable than a convincing paragraph. I wanted to describe a product idea, discuss it with an AI assistant, and keep the result as a working hierarchy of projects, epics, user stories, and tasks.

I designed the backend as a layered Spring Boot application with a PostgreSQL model and a conversational edge powered by Spring AI against Groq's OpenAI-compatible API. The current model configuration uses `meta-llama/llama-4-scout-17b-16e-instruct`; I keep that detail visible because AI integrations age quickly and vague model names make technical writing unreliable.

## I kept the domain ordinary

I model the plan as a strict tree:

```text
Project
└── Epic
    └── User story
        └── Task
```

I persist conversations and messages alongside that tree. Projects, epics, stories, and tasks carry status and priority, while the application uses DTOs and mappers at the API boundary instead of exposing JPA entities directly. That ordinary relational shape gives the AI somewhere concrete to put its suggestions.

## I separated conversation from extraction

When I receive a chat message, I load the project hierarchy, recover the last ten messages from the current conversation, append the new user message, and build a prompt with the current state. I send that prompt through `ChatClient`, persist the assistant response, and return both messages with the conversation id.

I do not mutate the plan on every conversational reply. The explicit `POST /api/v1/projects/{projectId}/extract-plan` operation gathers the history of every conversation for the project, sends it to a second prompt, reads the JSON-shaped response, and rebuilds the hierarchy from that result. Making extraction an explicit action keeps a chat reply from silently changing a plan.

## I made the boundary honest

The extraction path is intentionally simple, and that simplicity has a sharp edge. I locate the first `{` and last `}` in the model response, parse the slice with Jackson, clear the existing epics, and create the returned hierarchy. Missing titles receive readable defaults, invalid priorities fall back to `MEDIUM`, new statuses start at `TODO`, and missing estimates fall back to four hours.

I do not claim that this is a schema-validated command pipeline. The current repository does not have a domain validator that checks every model reference or transition before persistence. That limitation is part of the project story: the next iteration should introduce a typed proposal model and validation before allowing generated structure to replace existing work.

## What I built around the model

I implemented REST controllers for project, epic, story, task, and AI operations; services for CRUD and conversation behavior; Spring Data repositories; ModelMapper configuration; global API errors; OpenAPI documentation; CORS; Flyway as a declared dependency; and Docker Compose for PostgreSQL, the backend, and the Angular frontend.

I built the interface with Angular standalone components, Signals, Tailwind CSS, project and chat stores, a split project view, a chat panel, and a hierarchical plan view. I also used AI assistance heavily on the frontend, then reviewed the result manually. That experiment taught me where generated code helped and where accessibility, state edges, and empty states still needed a human eye.

## What I would strengthen next

I would add authentication, replace `ddl-auto: update` with versioned migrations, validate generated plans before replacing existing epics, and grow the test suite beyond the current application context test. I would also align the conversation endpoints and add integration coverage for the Groq adapter instead of relying on a single happy-path context load.

## What I learned

The model call is the visible part of an AI feature, not the difficult part. The difficult part is deciding what gets persisted, when it gets persisted, and how honestly the system reports uncertainty. PlanAI gave me a practical rule I now carry into every AI experiment: let the model suggest structure, but let the application own the consequences.
