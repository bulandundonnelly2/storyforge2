# ELDERNIGHT ChatGPT app — development foundation

This directory is a proposed integration contract on a **feature branch**, not a live ChatGPT app.

## User experiences

1. **Play an Adventure:** list eligible public ELDERNIGHT games; inspect their scenes; play through choices and optional dice outcomes, with outcomes determined server-side.
2. **Design Your Own Adventure:** collaborate in ChatGPT to draft world, title, reading level (1–5 stars), scenes, branches and optional dice checks at each choice. Preview, iterate, then save with explicit confirmation.
3. **Publish and Share:** must always be a separate, explicitly confirmed operation. Drafts are private by default.

## Shared data contract

See `adventure-schema.ts`. It validates a candidate draft and verifies scene references and dice fields. This schema is **not yet wired to the current site's storage model**; before connecting persistence, map against real ELDERNIGHT game and scene APIs and migrations. Preserve existing games.

## Integration design (pending implementation)

- Build a remote Streamable HTTP MCP endpoint using the supported MCP TypeScript SDK.
- Read-only tools: `list_adventures`, `get_adventure`, `get_scene`.
- Creation tools: `validate_adventure_draft`, `save_adventure_draft`, `publish_adventure`.
- Require OAuth 2.1 and user-scoped permissions for saved drafts and publishing. Existing Clerk sessions **are not automatically valid MCP OAuth tokens**.
- Keep dice results authoritative on the server and do not allow a model to choose a favorable result.
- Explicit consent before saving/publishing or sharing private content. Enforce permissions on the server independently of model instructions.
- Use the dark ZX Spectrum 8-bit aesthetic: cyan, electric blue, magenta, yellow and fine square-pixel dithering.
- Add optional interactive UI once tools are tested; ensure headless tool responses remain usable.

## Before deployment

- Confirm live site game/data API shapes and author permissions.
- Build and test a real MCP transport and OAuth integration; add endpoint origin checks, validation and rate limiting.
- Run tests for branching, failure/death endings, privacy and dice fairness.
- Test in ChatGPT developer mode, then submit for review.
- Do not merge or deploy until reviewed.
