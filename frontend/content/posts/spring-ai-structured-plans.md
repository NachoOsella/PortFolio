---
title: Getting structured project plans out of an LLM with Spring AI
slug: spring-ai-structured-plans
description: How PlanAI turns a conversation with Llama 3.3 into a validated hierarchy of epics, user stories, and tasks in PostgreSQL — and why the model is a parser, not a database.
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
seoTitle: Structured LLM output with Spring AI and PostgreSQL
seoDescription: PlanAI integrates Groq (Llama 3.3) via Spring AI to parse conversations into epics, stories, and tasks — validated by Jakarta constraints before anything reaches the database.
---

# A chatbot was not the goal

PlanAI started with a specific itch: every "AI planning tool" demo I tried produced beautiful prose that evaporated when you closed the tab. I wanted the opposite — a conversation that lands in a relational model with constraints, states, and a hierarchy you can actually work with. Describe an idea, get back a persisted project plan: epics, user stories, and tasks.

This post is about the backend decisions that made that work, because the API call to the model turned out to be the easy 10%.

## The shape of the problem

The domain is a strict hierarchy:

```text
Project
└── Epic            "Authentication module"
    └── User Story  "As a user, I can reset my password"
        └── Task    "Add POST /auth/reset endpoint"
```

Four levels of one-to-many, each with status and priority, queried as trees. PostgreSQL 16 with JPA/Hibernate handles this comfortably once the indexes are in the right place — a composite index on each child's parent foreign key, so loading a project tree is a handful of indexed lookups instead of a scan.

The hard part is that the source of truth for new structure is a language model, and language models do not respect your foreign keys.

## The rule: the model proposes, the backend disposes

The architectural rule that made PlanAI reliable: **the LLM is a parser, never a writer.** It reads conversation context and proposes structured changes; the backend validates every proposal against Jakarta constraints and the current state of the plan before anything is persisted.

```java
@Service
public class PlanRefinementService {

    private final ChatClient chatClient;
    private final PlanCommandValidator validator;

    public PlanUpdate refine(Project project, String userMessage) {
        PlanProposal proposal = chatClient.prompt()
            .system("""
                You convert planning conversations into JSON commands.
                Allowed commands: ADD_EPIC, ADD_STORY, ADD_TASK,
                UPDATE_STATUS, UPDATE_PRIORITY.
                Reference existing items only by the ids provided.
                """)
            .user(contextFor(project, userMessage))
            .call()
            .entity(PlanProposal.class);

        // The model's output is untrusted input until proven otherwise.
        PlanUpdate update = validator.validate(project, proposal);
        return apply(update);
    }
}
```

Three things are doing the heavy lifting here:

1. **Spring AI's structured output.** `.entity(PlanProposal.class)` maps the response onto a Java record. When parsing fails, that is a normal error path — not a corrupted database row.
2. **A closed command vocabulary.** The model cannot emit arbitrary mutations; it picks from six commands with typed payloads. Rejecting an unknown command is trivial.
3. **Validation after generation.** `PlanCommandValidator` checks that referenced ids exist in this project, that statuses are legal transitions, and that the hierarchy stays four levels deep. Jakarta Validation annotations cover the payload shapes; the service covers the relational rules.

## Why Groq and Llama 3.3

The feature lives or dies on perceived latency: refining a plan has to feel like editing, not like submitting a form. Groq's inference on Llama 3.3 returns structured responses fast enough that the chat view and the plan view can update in the same gesture. For this workload — short prompts, constrained JSON output, no need for 128k tokens of context — a fast mid-size model beat a slow brilliant one.

## Keeping two views consistent

PlanAI shows the same state twice: the conversation and the plan tree. The naive approach — let the chat drive the plan and hope they agree — drifts immediately. Instead, both views read from the same persisted plan, and every accepted AI proposal produces two artifacts at once: the domain mutation and a system message in the chat describing it ("Added 3 tasks to 'Authentication module'"). The chat is a log of what the system did, not a separate source of truth.

## The frontend experiment, honestly

The Angular 21 UI was built mostly by orchestrating AI agents and then reviewing by hand — a deliberate test of how far agent-generated frontend code goes. Verdict: signals and standalone components came out clean; accessibility details and empty states needed human passes. The backend, where the invariants live, I wrote myself. That division of labor felt right, and it is a workflow I would repeat.

## What I would tell past me

- Define the command schema before writing a single prompt. The prompt is just documentation for the schema.
- Treat every model response as untrusted input. You would never `INSERT` a raw request body — do not do it with LLM output either.
- Budget your effort inversely to the demo: 10% calling the model, 90% deciding what it is allowed to decide.

The model makes PlanAI feel magical on the first message. The validator is why it still works on the fiftieth.
