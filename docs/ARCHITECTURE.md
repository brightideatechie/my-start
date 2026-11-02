# Architecture
Current builder: index.html + style.css + app.js; standalone HTML and Perchance exports.
Planned modular foundation: src/layouts.js supplies layout metadata; src/widgets.js registers DOM-safe widgets; src/permissions.js denies privileged actions.
These ES modules are **not yet wired into the existing editor**. Integration should add a layout selector, widget palette, configuration schema and preview renderer, with regression tests for both exporters.
Trust boundaries: external content remains sandboxed; credentials and privileged operations belong only in a separate authenticated companion. Browser widgets must never receive SSH keys, unrestricted MCP access, or financial tokens.
