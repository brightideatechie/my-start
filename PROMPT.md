# Perchance AI Helper — Master Prompt

Use the attached files and product requirements as the authoritative specification. Preserve existing My Start functionality. Do not invent APIs, integration methods or Hermes capabilities.

Build a modular browser startup-page generator: configurable layouts, reusable widgets, live previews, wizard-driven configuration, and standalone HTML/Perchance exports.

Implement a widget registry and layout registry before adding integrations. Isolate third-party Perchance generators in sandboxed iframes by default. Never execute their scripts in the parent page.

Hermes is an optional local orchestrator. All privileged execution must pass through an authenticated companion, explicit user consent, allowlisted capabilities and audit logging. Do not expose credentials, SSH keys, financial tokens or MCP tools to browser content. Voice must not bypass consent.

Financial integrations are read-only by default. Payments, transfers, trading, withdrawals and remote shell actions are not authorized by this prompt.

Deliver each feature with tests and documentation. If a feature cannot be safely implemented, show an explicit unsupported state rather than a simulated success.
