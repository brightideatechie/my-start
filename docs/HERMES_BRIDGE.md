# Hermes bridge design (proposal; not implemented)
Browser UI -> authenticated local companion -> Hermes agent -> explicitly allowlisted MCP tools/skills.
Do not assume a particular Hermes API or protocol without verifying its installed version. Require origin checks, authentication, request IDs, action confirmation, audit logs, rate limits and cancellation. Voice transcripts and Perchance agent messages are untrusted input, not authorization.
