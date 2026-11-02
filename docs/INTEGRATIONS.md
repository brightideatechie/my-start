# Integration inventory
**Not yet implemented:** SearXNG, Plex, Home Assistant, Docker, security cameras, cloud infrastructure, email, CRM, finance, browser history, Hermes and MCP.
Start with read-only public feeds and explicitly authenticated, least-privilege local integrations. Avoid claiming an integration is operational until end-to-end tested.
Integration adapters should implement connect(), health(), read() and disconnect(), and declare permissions and data retention. Write/control methods require a separate review.
