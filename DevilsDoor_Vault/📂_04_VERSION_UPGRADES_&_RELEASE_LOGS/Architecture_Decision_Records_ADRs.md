# 📋 Architecture Decision Records (ADRs)

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]

---

## 🏛️ Locked Architecture Decisions

### ADR-001: Zero-Build Vanilla ESM + Canvas 2.5D
- **Status**: `ACCEPTED`
- **Context**: Needed rapid prototyping without dependency overhead or build step rot.
- **Decision**: Use standard browser ES modules (`import`/`export`) and native Canvas 2D/WebGL rendering.
- **Consequences**: Zero build configuration needed. Game runs immediately via any simple HTTP file server.

### ADR-002: Procedural Web Audio API Sound Synthesis
- **Status**: `ACCEPTED`
- **Context**: External audio files add megabytes to download payloads and slow down mobile game boot times.
- **Decision**: Synthesize 100% of sound effects, slashes, and ambient drones dynamically via Web Audio API oscillators and noise buffers.
- **Consequences**: Total game audio bundle footprint is exactly $0\text{ KB}$.

### ADR-003: Trigger-Condition-Action Deception Engine
- **Status**: `ACCEPTED`
- **Context**: Deceptive platformer traps easily degenerate into brittle hardcoded spaghetti code.
- **Decision**: Decouple level trap logic into a declarative JSON schema processed by a unified state evaluator.
- **Consequences**: Adding new deceptive trap rules requires zero changes to the core physics collision loop.

### ADR-004: Polymorphic Deceptive Door Entity
- **Status**: `ACCEPTED`
- **Context**: The game requires multiple door variations (true portals, shifting feints, mimics, and gravity inverters).
- **Decision**: Implement a polymorphic door interface where visual rendering and collision triggers share a base contract.
- **Consequences**: Dynamic door swaps occur seamlessly without re-instantiating level geometry.

### ADR-005: Dual-Licensing Commercial IP Protection
- **Status**: `ACCEPTED`
- **Context**: Balancing open-source community mechanics with founder commercial IP ownership.
- **Decision**: Structure `LICENSE` into Part 1 (MIT open source for mechanics/engine) and Part 2 (All Rights Reserved for characters, artwork, audio, and trademarks owned by Khalid Abdullah).
- **Consequences**: Preserves commercial rights while allowing permissive engine study and forkability.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Architecture_Overview_&_ESM_Pipeline]]*
