---
title: One order model for the counter and the web
slug: lembas-modular-monolith
description: The design decisions behind Lembas, my thesis project — why a modular monolith, why POS and e-commerce share one order model, and why stock only moves when payment confirms.
status: published
ink: green
category: Architecture
tags:
  - Java
  - Spring Boot
  - System design
  - PostgreSQL
publishedAt: 2026-07-25
updatedAt: 2026-08-03
seoTitle: Designing Lembas as a modular monolith
seoDescription: One order model for POS and e-commerce, FEFO stock by lot, and stock deducted on payment confirmation — the decisions behind a thesis project for a real store.
---

# The store sells everything twice

A dietetica — a small Argentine health food store — sells the same jar of honey across the counter and through an online catalog. Most small-business software models that as two systems with a sync problem in the middle. When I started Lembas, my thesis project at UTN FRC, the first decision was to refuse that split entirely:

**The POS and the online store use the same products, stock, orders, payments, and customers. The sales channel is a field on the order, not a separate system.**

That one sentence shaped the whole backend. This post walks through the decisions that followed.

## Decision 1: a modular monolith, on purpose

The tech-industry instinct is to reach for microservices the moment a domain has more than three nouns. For a thesis built by one person, that would have been a way to feel productive while never finishing. Lembas is a single Spring Boot deployable with modules by domain:

```text
backend/src/main/java/com/dietetica/lembas/
  auth/ users/ catalog/ inventory/ orders/ payments/ cash/
  suppliers/ reports/ audit/ shared/
```

The discipline that matters is not the deployment unit — it is the boundary. Each module owns its entities and exposes what others need through DTOs and services, never through shared tables. The MVP deliberately excludes queues, Redis, and every "we might need it later" component. Writing that exclusion list down, in an ADR, was the most productive hour of the project.

## Decision 2: unified orders

Every order in Lembas — a walk-in sale at the register, an online purchase picked up at the branch — is the same aggregate with a `channel` discriminator:

```java
public enum OrderChannel { POS, ONLINE }

@Entity
public class Order {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderChannel channel;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
}
```

The payoff compounds everywhere downstream: one stock deduction path, one payment state machine, one reports query. The alternative — two order models with a reconciliation job — is how small systems grow a permanent part-time job called "why don't these numbers match."

## Decision 3: stock by lot, deducted FEFO, moved only on payment

Food expires, so inventory is not a counter on the product — it is rows of lots:

```java
@Entity
public class StockLot {
    @ManyToOne(optional = false)
    private Product product;

    @ManyToOne(optional = false)
    private Branch branch;

    @Column(nullable = false)
    private int quantity;

    private LocalDate expirationDate; // nullable: non-perishables
}
```

Deduction follows FEFO — first expired, first out — with lots that have no expiration consumed last. It is the rule a careful shopkeeper applies by hand; the system just makes it non-negotiable.

The subtler decision is **when** stock moves. An online cart reserving units sounds friendly until an abandoned cart locks the last unit of something a person at the counter is trying to buy. So Lembas deducts stock only when payment is confirmed:

- POS sale: confirmation is immediate, stock moves with the sale.
- Online sale: Mercado Pago Checkout Pro collects, an **idempotent webhook** confirms, and only then does FEFO deduction run. If the webhook arrives twice, the second one is a no-op.

That single invariant — *no confirmed payment, no stock movement* — eliminated an entire category of race conditions I did not have to solve.

## Decision 4: the cash register reconciles cash, not payment methods

At close, the system asks one question: does the physical cash in the drawer match what the register says? QR payments, transfers, and cards are informational at close because that money is never in the drawer. Modeling the close as "count the cash, compare, record the discrepancy" keeps the daily ritual to minutes — which is the real requirement for software a shopkeeper uses after a long day.

## What held up, three months in

The ADRs did their job: the hard conversations (stock timing, pickup-only scope, DTO boundaries) happened while they were cheap. The unified order model has absorbed every new requirement — reports, audit logging, cash movements — without a fork.

If I were starting over, I would write the integration tests against Testcontainers even earlier. Running the webhook-confirmation flow against real PostgreSQL from the first week would have caught two transaction-boundary bugs that surfaced later than they should have.

The strongest abstraction in Lembas turned out to be a boundary, not a component. And the most valuable feature is a sentence in an ADR that starts with "The MVP excludes…".
