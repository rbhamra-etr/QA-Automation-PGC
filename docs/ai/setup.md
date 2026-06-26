# AI Assistant Setup

## GitHub Copilot

- Project-wide instructions: `.github/copilot-instructions.md`
- Agent definitions: `.github/agents/`
- Skill definitions: `.github/skills/`

### Agents

| Agent | File | Purpose |
|-------|------|---------|
| bdd-expert | `.github/agents/bdd-expert.agent.md` | Gherkin + step authoring, step ownership validation, POM placement |
| git-expert | `.github/agents/git-expert.agent.md` | Branch management, rebase, Conventional Commits |
| test-runner | `.github/agents/test-runner.agent.md` | Run tests by app tag, smoke, or full suite |

### Skills

| Skill | Directory | Purpose |
|-------|-----------|---------|
| run-tests-by-tag | `.github/skills/run-tests-by-tag/` | Map app tags to feature root folders |
| conventional-commits | `.github/skills/conventional-commits/` | Create and validate commit messages |
| step-ownership-validation | `.github/skills/step-ownership-validation/` | Detect misplaced steps and POM methods |

## Other AI Assistants (Claude, etc.)

- Use the same conventions documented in `.github/copilot-instructions.md`.
- Keep generated steps thin — call page methods, not implement logic.
- Page name must appear in every BDD step as the final component.
