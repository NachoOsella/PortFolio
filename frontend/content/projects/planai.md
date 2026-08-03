---
title: PlanAI
slug: planai
description: AI-native project planning assistant that turns a natural-language conversation into a structured hierarchy of epics, user stories, and tasks.
status: published
ink: purple
featured: true
projectType: AI-integrated full-stack application
role: Backend engineer — frontend built with AI agents
duration: 1 month
technologies:
  - Java 21
  - Spring Boot 3.3
  - Spring AI
  - Groq (Llama 3.3)
  - PostgreSQL 16
  - Angular 21
  - Docker
repositoryUrl: https://github.com/NachoOsella/PlanAi
publishedAt: 2026-01-18
updatedAt: 2026-08-03
displayOrder: 2
---

# Overview

PlanAI is a project planning assistant with a conversational interface. You describe an idea in natural language; the backend turns the conversation into a structured, persisted project plan: epics, user stories, and tasks with states and priorities.

## Context

The goal was to demonstrate backend engineering with a practical LLM integration — not a chatbot wrapper, but a system where the model's output lands in a relational model with real constraints.

## Key decisions

- **Spring AI against Groq Cloud** running Llama 3.3 for sub-second inference. The model is treated as a parser: it proposes structure, the backend validates and persists it.
- **Strict hierarchy.** Project → Epic → User Story → Task, modeled with JPA/Hibernate one-to-many relationships and indexed for hierarchical queries. Jakarta Validation keeps every AI-proposed change honest before it touches the database.
- **Two synchronized views.** Chat and plan views stay consistent: changes in the plan update the chat context, and new chat messages can refine the plan.
- **AI-assisted frontend.** The Angular 21 UI (standalone components, signals, Tailwind, View Transitions) was built mostly by orchestrating AI agents, then reviewed and polished by hand — a deliberate experiment in where agent-generated code holds up.

## What I built

Layered Spring Boot backend: REST controllers, business services, JPA repositories, and a Spring AI service that handles prompt construction and response parsing. Entity-DTO separation with ModelMapper, SpringDoc OpenAPI for documentation, and Docker Compose for one-command startup with PostgreSQL 16.

## Lessons learned

The hard part of LLM integration is not the API call — it is deciding what the model is allowed to decide. Constraining generation to a validated schema, and letting the database keep the final word, made the feature reliable enough to demo live.
