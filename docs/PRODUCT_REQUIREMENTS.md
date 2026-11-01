# My Start — Product Requirements

Source: the user's Perplexity conversation, "examples of best browser startup pages.md". This document distinguishes requested features from implementation.

## Required platform capabilities
1. Startpage builder with live preview, configurable themes, search, links and standalone/Perchance exports.
2. Catalog of 60 layouts including Minimal Launcher, Three-Column Dashboard, Bento, Kanban, Calendar, News and AI Assistant.
3. Extensible widget catalog, setup workflows, live widget wizard previews and a Perchance generator-to-widget adapter.
4. Integrations: SearXNG, Plex, Hermes, Docker, Home Assistant, cameras, cloud/VM/VPS, email, CRM, financial services and other applications.
5. AI-led configuration, suggestions and diagnostics; optional speech-to-text and text-to-speech.
6. Permission-scoped agents, browser automation, tab-group profiles and remote access through an authenticated companion.
7. Hermes orchestration, MCP tool/skill discovery and controlled execution.
8. Exploratory opt-in advertising/revenue sharing, subject to legal and partner feasibility.

## Trust boundaries
Perchance content is untrusted. Hermes cannot execute privileged tools without a separate authenticated local companion, allowlists, explicit consent and audit logging. Financial services are read-only by default.

## Delivery stages
Preserve the existing builder; add layout registry and widget system; build wizard; implement read-only integrations; then AI, Hermes, extension and remote-management capabilities. No features are complete solely because they appear in this document.

## Current status
The existing repository is a lightweight startpage generator. The expanded platform is a planned architecture, not an operational feature set.
