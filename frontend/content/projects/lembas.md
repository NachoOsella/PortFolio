---
title: Dietetica Lembas
slug: lembas
description: "I am building a commercial platform for a health food store around one catalog, one inventory model, and one order flow."
status: published
ink: green
featured: true
projectType: Full-stack thesis project
role: I lead the backend and shape the full-stack system
duration: Eight-week thesis project, ongoing
technologies:
  - Java 21
  - Spring Boot 3.5.0
  - Spring Security
  - JPA/Hibernate
  - Flyway
  - Angular 21.2
  - PostgreSQL 16
  - Docker
  - Testcontainers
repositoryUrl: https://github.com/NachoOsella/lembas
publishedAt: 2026-07-24
updatedAt: 2026-08-03
displayOrder: 1
---

# Overview

I am building Dietetica Lembas as my thesis project for the Tecnicatura Universitaria en Programación at UTN FRC. I designed it for a health food store in Argentina that needs its catalog, inventory, counter sales, online purchases, payments, cash register, suppliers, and reports to agree with one another instead of becoming a collection of spreadsheets that happen to share a name.

The repository is in active development, but the architecture is not a sketch. It already contains the public store, administration features, authentication, catalog management, stock operations, POS, cash sessions, orders, payments, supplier workflows, reports, and a large automated test suite. I keep the remaining scope explicit rather than presenting a work in progress as a finished product.

## I chose a modular monolith

I chose one Spring Boot deployable and divided it by business capability: `auth`, `users`, `catalog`, `inventory`, `orders`, `payments`, `cash`, `pos`, `suppliers`, `reports`, `audit`, and shared infrastructure. Each module owns its models, DTOs, repositories, services, and web layer. Cross-module contracts live in `api/` packages, and ArchUnit tests check that the boundaries remain real.

This is not a smaller version of microservices. It is a deliberate choice for a thesis built by one person. I get one transaction boundary, one deployment, and one place to debug while still forcing myself to decide which module owns each rule.

## I use one commercial model

The store and the online catalog sell the same products. I represent the origin with `OrderType.POS` or `OrderType.ONLINE`, not with two separate order entities that would eventually need reconciliation. I use the same payment table for in-store and online payments as well, so reporting and traceability can follow one model from sale to settlement.

I keep the online MVP pickup-only. That constraint removes address management and logistics integration while preserving the interesting part of the problem: a customer and a cashier must see the same commercial truth.

## I made stock a domain, not a number

I model inventory as lots with decimal quantities, expiration dates, unit costs, branches, statuses, and movements. When I deduct stock, I select active lots with pessimistic write locking, order them by FEFO, and consume the lots that expire first. Lots without an expiration date come last.

I do not reserve stock when an online order is created. The order starts with a pending payment; the Mercado Pago webhook verifies the provider's signature, asks Mercado Pago for the real payment state, and only then applies the transactional stock deduction. If the payment is approved but the available lots cannot satisfy the order, I keep the order in `STOCK_CONFLICT` for manual review instead of pretending the inventory is correct.

For POS, I deduct stock immediately as part of the sale transaction. For cancellations, I reverse the original movements rather than inventing a new quantity from memory. That distinction between current stock and stock history is one of the decisions I am most protective of in the project.

## I designed for the closing shift

The cash register reconciles physical cash. I calculate expected cash from the opening amount, cash payments, and explicit cash-in or cash-out movements. QR payments, transfers, and cards remain visible in the report, but they do not contaminate the number that should be in the drawer at closing.

I also model the less glamorous operational edges: purchase orders do not affect inventory until a receipt is confirmed, supplier price changes require human review, and reports and recommendations are rule-based rather than AI-generated. Predictable software is more useful than impressive software when someone is closing a register after a long day.

## How I test it

I test the backend with JUnit 5, Mockito, Spring MVC tests, Testcontainers against PostgreSQL, concurrency scenarios, security tests, and ArchUnit rules. I test the Angular application with Vitest and jsdom across guards, services, stores, pages, forms, and shared components. I have not added a separate browser-level E2E suite yet, so I do not describe that layer as solved.

## What I learned

Writing the architecture decision records before writing every feature forced me to settle stock timing, module ownership, pickup scope, pricing history, and payment behavior while changes were still cheap. The strongest abstraction in Lembas is not a component or a framework feature. It is a boundary that tells the next rule where it belongs.
