# Contributing to Devil's Door

Thank you for your interest in contributing to **Devil's Door**! We welcome open-source contributions from developers, game designers, sound designers, and artists around the world.

---

## Governance & Ownership Notice

Devil's Door is governed under an **Open Development + Founder Final Authority** model.
- **Founder & Lead Maintainer**: [Khalid Abdullah](https://github.com/khalidabdullahh)
- Community contributions do not confer project ownership or unrestricted repository rights.
- All contributions are curated and merged at the discretion of the founder to protect the vision, originality, and security of the game.

For full details, please review [GOVERNANCE.md](GOVERNANCE.md).

---

## Core Contribution Philosophy

1. **Absolute Originality**: Do not propose or submit code, visual assets, audio, or levels copied from other platformers.
2. **Every Death Must Teach Something**: Traps and deceptions must be discoverable and learnable upon failure. Arbitrary, unfair, or random frustration is rejected.
3. **Data-Driven Architecture**: Use the `DeceptionEngine` (Trigger $\to$ Condition $\to$ Action) rather than writing monolithic level hacks.
4. **Performance & Accessibility**: Ensure all code maintains 60 FPS on low-end mobile devices and provides comfortable touch controls.

---

## How to Propose Changes

### 1. Fork and Clone
```bash
git clone https://github.com/<your-username>/DevilsDoor.git
cd DevilsDoor
git checkout -b feature/my-new-mechanic
```

### 2. Developing Locally
Start a lightweight static server:
```bash
python3 -m http.server 8080
# Visit http://localhost:8080/src/ or http://localhost:8080/website/
```

### 3. Adding a New Level
If proposing a new level:
1. Define the level in `src/js/levels/Level<N>.js`.
2. Register it in `src/js/levels/LevelRegistry.js`.
3. Add a uniqueness matrix entry in `docs/LEVEL_DESIGN_BIBLE.md` documenting:
   - Primary Mechanic
   - Player Expectation
   - Deception / Subversion
   - Clue / Learnable Information
   - Solution
   - Door Behavior

### 4. Running Checks
Verify syntax and data integrity:
```bash
node scripts/test-integrity.js
```

### 5. Submitting a Pull Request
- Submit a PR against the `main` branch.
- Clearly describe your changes, rationale, and how you tested them across desktop and mobile screen sizes.
- Be responsive to feedback from the maintainers.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
