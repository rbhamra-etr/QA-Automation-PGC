---
name: conventional-commits
description: "Create and validate git commit messages using Conventional Commits v1.0.0. Use for feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert classification, scope selection, and breaking change notes."
argument-hint: "Describe your staged changes or ask to classify a diff into a Conventional Commit"
user-invocable: true
---

# Conventional Commits

Use this skill to generate commit messages that follow the Conventional Commits 1.0.0 specification.

## Commit Structure

Required subject format:
`<type>[optional scope][!]: <description>`

Rules:
- `type` is required and lowercase.
- `scope` is optional and should be a concise noun (for example `router`, `auth`, `ui`).
- `!` marks a breaking change.
- Description is short, imperative, and does not end with a period.

Optional sections:
- Body: explain what changed and why.
- Footer(s): metadata and breaking change details.

## Supported Types

- `feat`: a new feature
- `fix`: a bug fix
- `docs`: documentation only changes
- `style`: formatting-only changes
- `refactor`: structural improvements without behavior change
- `perf`: performance improvement
- `test`: tests added/updated
- `build`: build tooling/dependency changes
- `ci`: CI/CD changes
- `chore`: maintenance work
- `revert`: rollback of a previous commit

## Project Scopes (407 ETR Automation)

- `backend`: FastAPI backend changes
- `frontend`: Angular frontend changes
- `e2e`: Playwright/Cucumber automation changes
- `api`: API endpoint changes
- `auth`: authentication/authorization
- `db`: database schema/migrations
- `docs`: documentation
- `ci`: CI/CD pipeline
- `config`: configuration files

## Examples

`feat(e2e): add web payment integration scenarios`

`fix(auth): handle expired session redirect`

`chore(ci): run tag-based cucumber matrix in workflow`

`feat(api)!: rename users endpoint to accounts`

## Validation Checklist

- Type is valid and lowercase.
- Scope is concise and relevant when present.
- Description uses imperative style and has no trailing period.
- Breaking changes use `!` and/or `BREAKING CHANGE:` footer.
- Footer issue references use `Fixes #N` or `Closes #N` when applicable.
