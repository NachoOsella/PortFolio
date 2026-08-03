---
title: Dietetica Lembas
slug: lembas
description: Integrated commercial management system with built-in e-commerce for a health food store — my full-stack thesis project, designed as a modular monolith.
status: published
ink: green
featured: true
projectType: Full-stack thesis project
role: Backend-leaning full-stack developer
duration: 3 months, ongoing
technologies:
  - Java 21
  - Spring Boot 3.5
  - Spring Security
  - JPA/Hibernate
  - Flyway
  - Angular 21
  - PostgreSQL 16
  - Docker
repositoryUrl: https://github.com/NachoOsella/lembas
publishedAt: 2026-07-24
updatedAt: 2026-08-03
displayOrder: 1
---

# Overview

Dietetica Lembas is a commercial management system for a real health food store in Argentina. It combines backoffice, point of sale, inventory, e-commerce, payments, and reporting in one shared commercial core — and it is my thesis project for the Tecnicatura Universitaria en Programación at UTN FRC.

## Context

A small dietetica sells the same products twice: across the counter and through an online catalog. Most small-business software treats those as two systems that need to be reconciled. The thesis of Lembas is the opposite: **the store and the POS use the same products, stock, orders, payments, and customers**. The sales channel is a field on the order, not a separate system.

## Key decisions

- **Modular monolith, not microservices.** One deployable, modules by domain (`catalog`, `inventory`, `orders`, `payments`, `cash`, `suppliers`, `reports`, `audit`), and explicit boundaries between them. The MVP deliberately excludes queues, Redis, and duplicated POS/e-commerce models.
- **Unified orders.** `POS` and `ONLINE` orders share one model, so reporting, stock, and payments never fork.
- **Stock by lot with FEFO.** Inventory tracks branch, lot, quantity, and expiration date; first-expired lots are consumed first. Stock is deducted only when payment is confirmed, not when a cart is built.
- **Cash register reconciliation.** Physical cash is counted at close; QR, transfers, and cards are informational.
- **Mercado Pago Checkout Pro** with idempotent webhooks for online payment confirmation.

## What I built

The backend is Spring Boot 3.5 on Java 21 with JWT auth and role-based policies, Bean Validation, springdoc-openapi, Flyway migrations, and centralized API errors. The frontend is Angular 21 with standalone components, signals, PrimeNG, Tailwind CSS 4, lazy routes, auth guards, and interceptors. The whole stack — PostgreSQL 16, backend, frontend, Nginx — runs from one Docker Compose file.

## Testing

JUnit 5 and AssertJ on the domain, Spring MVC tests on the API, Testcontainers against real PostgreSQL, and Vitest with jsdom on the Angular side.

## Lessons learned

Writing the architecture decision records before the modules forced the hard conversations early — stock timing, pickup-only scope, DTO boundaries — while they were still cheap to change. The strongest abstraction in the system is a boundary, not a component.
