# Security model
- Default deny for privileged operations.
- Do not run imported JavaScript or Perchance generators in the parent document.
- Validate imported JSON and URL protocols; use textContent and DOM APIs for user-supplied content.
- Isolate external widgets in sandboxed iframes with narrow permissions and restrictive CSP.
- Hermes and MCP require an authenticated local companion, explicit per-action authorization, tool allowlists, timeouts and audit logs.
- No automatic SSH commands, browser automation, payments or transfers.
- Do not expose API keys in exported startpages or local browser storage.
- Threat-model every new integration before enabling it.
