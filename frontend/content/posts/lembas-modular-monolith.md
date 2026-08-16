---
title: I chose one order model for the counter and the web
slug: lembas-modular-monolith
description: "I explain why I designed Lembas as a modular monolith, unified POS and online orders, and delayed stock deduction until payment confirmation."
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
seoTitle: I designed Lembas as a modular monolith
seoDescription: "I walk through my decisions for Lembas: one order model for POS and e-commerce, FEFO stock by lot, pessimistic locking, and payment-confirmed deduction."
---

# I refused to create a reconciliation problem

A health food store sells the same jar of honey across the counter and through an online catalog. When I started Lembas as my thesis project, I could have modeled those channels as two applications and promised to synchronize them later. I recognized that promise for what it was: a permanent source of mismatched totals.

I chose one commercial core instead. The store and the online catalog share products, stock, orders, payments, and customers. The sales channel is `OrderType.POS` or `OrderType.ONLINE`, not a reason to duplicate the domain.

That sentence became the first architectural constraint. The rest of the system followed from it.

## I chose a modular monolith on purpose

I built one Spring Boot application and separated it into modules by business capability: authentication, users, catalog, inventory, orders, payments, cash, POS, suppliers, reports, audit, and shared infrastructure.

I did not choose a modular monolith because boundaries stop mattering once everything ships together. I chose it because one deployable unit gives me simple local development, one transaction model, and a smaller operational surface. I still enforce ownership through package structure, `api/` contracts, DTOs, and ArchUnit rules.

For a thesis built by one person, microservices would have added network failure and deployment coordination before they added useful isolation. I wanted the discipline of domain boundaries without paying for infrastructure I could not yet justify.

## I made the order model do the unifying work

An in-store sale and an online pickup share the same order entity. The type tells me where the order came from; the order state tells me what I can do with it. I use the same payment table for cash, cards, transfers, QR, and Mercado Pago, which gives reports one language for money that arrived through different paths.

The benefit is not just fewer classes. I get one place to capture order-item snapshots, one cancellation path, one reporting vocabulary, and one audit trail for the commercial lifecycle. I do not need a reconciliation job to explain why the counter and the web disagree.

## I made stock a set of lots

I do not store inventory as a single integer on a product. I store active lots with decimal quantities, expiration dates, unit costs, branches, statuses, and stock movements. When I need to deduct units, I select the lots with a pessimistic write lock, sort them by expiration, and apply FEFO: first expired, first out. Lots without an expiration date come last.

I also made a timing decision that matters more than the acronym. Creating an online order does not move stock. The order begins as `PENDING_PAYMENT`; a pending cart should not reserve the last unit for someone who may never pay.

The online flow is:

1. I create the order and a pending payment.
2. I create or reuse a Mercado Pago Checkout Pro preference.
3. I receive the provider webhook and verify its signature.
4. I ask Mercado Pago for the real payment state instead of trusting the notification body.
5. If the payment is approved, I lock the relevant lots and deduct stock in the transaction.
6. I record the movement and mark the order paid.

If Mercado Pago sends the same approval twice, I recognize the terminal payment state and do nothing the second time. If an approved payment finds insufficient stock, I mark the order `STOCK_CONFLICT` for manual review instead of writing an impossible inventory number.

For POS, payment and FEFO deduction happen immediately in the sale transaction. I do not force a web checkout rule onto a cashier standing in front of an open register.

## I made cancellation reversible

A cancellation should not ask me to guess which lot supplied the original sale. I keep stock movements tied to the order and reverse the original deduction path. That gives me a traceable answer to three questions: what moved, why it moved, and which cancellation returned it.

The same principle shapes purchase receipts. A purchase order expresses intent; only a confirmed receipt creates stock lots and an entry movement. I prefer the database to reflect what physically happened, not what someone once planned to receive.

## I designed the cash register around physical cash

At closing, I care first about the amount that should be in the drawer. I calculate it from the opening amount, cash payments, and explicit cash-in or cash-out movements. QR payments, transfers, and cards remain useful report data, but they do not belong in the physical cash discrepancy.

That sounds obvious until a model mixes every payment method into one total. I kept the distinction explicit because the software is meant to support a real closing ritual, not merely produce an attractive dashboard.

## I test the rules where they can fail

I test FEFO ordering, lot locking, POS sales, online payment callbacks, duplicate webhooks, stock conflicts, cancellations, cash discrepancies, security policies, and module boundaries. The backend suite combines unit tests, MVC tests, PostgreSQL Testcontainers, concurrency scenarios, and ArchUnit. The Angular side has Vitest coverage across the public store and the administrative workflows.

I have not added a dedicated browser E2E suite yet. I would rather name that gap than imply that component and integration tests are the same thing.

## What I learned

The architecture decisions that saved me the most time were sentences, not diagrams: one order model, no stock movement before payment, pickup-only MVP, and one source of truth for lots. Once those rules were explicit, the code had fewer places to hide ambiguity.

The strongest abstraction in Lembas is a boundary. A boundary tells me where a rule belongs, what another module may ask for, and which shortcut I will regret when the business grows.
