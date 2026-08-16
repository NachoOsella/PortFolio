---
title: About
slug: about
description: "I am a backend-leaning full-stack developer from Córdoba, Argentina, building dependable software with Java and Spring Boot."
status: published
updatedAt: 2026-08-15
---

# About me

I am Ignacio Osella, a backend-leaning full-stack developer from Córdoba, Argentina. I build software around the parts that are easiest to get wrong and hardest to fake: domain rules, data integrity, authentication, failure handling, and the quiet decisions that let a system remain understandable six months later.

I reach for Java and Spring Boot first. I design REST APIs, model relational data, and make application behavior explicit through validation, tests, migrations, and well-named boundaries. I also work comfortably across the rest of the path to production: Angular and TypeScript interfaces, PostgreSQL, Docker, Linux, and the operational details that turn a project into something another person can actually run.

## What I am looking for

I am looking for a backend role where I can contribute with Java and Spring Boot while learning from engineers who care about the craft. I want to work on software that has real users, real constraints, and enough complexity to reward careful thinking. I do my best work when I can turn an ambiguous requirement into a clear model, a reliable flow, and code that does not need a guided tour to be maintained.

## Contact

You can reach me at **nachoosella7@gmail.com**. I am especially interested in backend engineering, full-stack product work, and teams that value deliberate technical decisions.

## How I work

I start with the domain rather than the framework. Before I add an endpoint or a component, I try to understand what must remain true: when stock is allowed to move, who can perform an action, which state transitions are legal, and what should happen when an external service repeats a request or disappears halfway through it.

I write those decisions down early. I prefer a modular monolith to a distributed system I cannot yet justify, a database constraint to a comment that says “remember this,” and a test that makes a race condition repeatable to a test that merely passes on my machine. I also try to leave useful boundaries behind me: DTOs at module edges, predictable errors, and documentation that explains the why instead of restating the what.

## What I have been building

I am building **Dietetica Lembas** as my thesis project at the Universidad Tecnológica Nacional. It is a commercial management system for a health food store, with a shared catalog, inventory, POS, online orders, payments, cash register, suppliers, and reports. I designed it as a modular monolith and gave the hardest rules a precise home: lot-based FEFO stock, pessimistic locking, idempotent payment webhooks, and one order model for both sales channels.

I built **PlanAI** to explore a different boundary: how a conversational interface can turn an idea into a persisted hierarchy of projects, epics, user stories, and tasks. I focused on the Spring Boot backend, the JPA model, the conversation history, and the Spring AI integration with Groq. The project also gave me a useful lesson in honesty: an LLM response is not a validated domain command just because it looks like JSON.

I built **java-logic-trainer.nvim** because I wanted Java practice to live inside the editor I already use. The plugin contains 187 exercises across five levels, creates a local Maven workspace, runs JUnit checks asynchronously, offers progressive hints, and stores progress in a small JSON file. I chose deterministic tests over an AI judge because beginners deserve feedback they can trust.

I built **Gruvboxitator** as a browser-only image tool for a palette I keep returning to. It decodes an image locally, processes its pixels through an explicit TypeScript pipeline, and lets me compare and download the result without an upload or an account. I made it because even a visual experiment is more satisfying when I can explain every transformation underneath it.

I built this portfolio for the same reason I build most of my tools: I wanted the important part to stay legible. The projects and articles are Markdown files, the backend validates and writes them, the public site renders them, and GitHub is an explicit backup rather than a hidden database.

## Education

I am pursuing a **Tecnicatura Universitaria en Programación** at Universidad Tecnológica Nacional, Facultad Regional Córdoba (2024–present). Before that, I studied **Ingeniería en Sistemas de Información** at the same university from 2022 to 2023.

## Toolbox

I work mainly with **Java 21, Spring Boot, Spring Security, Spring Data JPA, Hibernate, REST APIs, JWT, BCrypt, OpenAPI, and Spring AI**. For data and delivery, I use **PostgreSQL, MySQL, Flyway, Docker, Docker Compose, Linux, and Git**. On the frontend, I use **TypeScript, Angular, Signals, React, HTML, CSS, PrimeNG, and Tailwind CSS**. I test with **JUnit 5, Mockito, AssertJ, Testcontainers, Vitest, and React Testing Library**.

## Languages

I speak Spanish natively. I use English every day for technical reading, documentation, source code, and the conversations around software I want to understand well.

## Outside the application

I use Neovim and Linux every day, maintain my own configuration, and enjoy building small tools that fit directly into that workflow. I like systems that stay close to the user and close to the filesystem. Gruvbox appears often enough in my projects that writing an image processor for it eventually felt less like a side quest and more like an obligation.
