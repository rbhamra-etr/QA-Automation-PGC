# Scalability Roadmap

## Architecture Scaling

- Keep app folders stable as execution boundaries.
- Scale domain coverage through filename convention and optional domain tags.
- Extract shared flows into reusable step and page helpers.

## Testing Scaling

- Continue tag-based suite partitioning in CI matrix.
- Add filename convention validation in tag validator.
- Add fixture strategy for deterministic test data.

## Feature Scaling

- Add new journeys by domain-named feature files per app.
- Keep integration flows thin and step-reuse focused.
- Track additions through docs/testing/feature-behaviour.md.
