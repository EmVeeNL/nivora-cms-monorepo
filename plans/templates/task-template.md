# TASK-NNN: {{TASK_TITLE}}

<!-- Replace TASK-NNN with the zero-padded task number, e.g. TASK-007 -->
<!-- Replace all {{PLACEHOLDER}} tokens before committing -->

## Status
<!-- Backlog | Planned | Ready | In Progress | Blocked | In Review | Testing | Done | Cancelled -->
Planned

## Priority
<!-- Critical | High | Medium | Low -->
{{PRIORITY}}

## Type
<!-- Feature | Bug | Refactor | Research | Documentation | Infrastructure | Security | Testing -->
{{TYPE}}

## Owner
Team

## Created
{{DATE}}

## Due Date
{{DUE_DATE}}

## Parent Plan
../index.md

---

## Summary
<!-- 1–3 sentences: what this task does and why it is needed. -->
{{SUMMARY}}

## Business Value
<!-- Why does this matter? What breaks or degrades without it? -->
{{BUSINESS_VALUE}}

## Acceptance Criteria
<!-- Each item must be independently verifiable. -->
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}

## Requirements
<!-- Functional and non-functional requirements. -->
- {{REQUIREMENT_1}}
- {{REQUIREMENT_2}}

## Technical Design
<!-- Architecture decisions, patterns, APIs, component structure. -->
{{TECHNICAL_DESIGN}}

## Dependencies
<!-- Other tasks that must be complete before this one starts. -->
- {{DEPENDENCY_TASK}} — {{REASON}}

## Implementation Steps
<!-- Ordered, actionable steps for a developer (or agent) to follow. -->
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

## Instructions for Developer
<!-- Non-obvious guidance: conventions to follow, pitfalls to avoid. -->
- {{INSTRUCTION_1}}
- {{INSTRUCTION_2}}

## Files Expected To Change
<!-- List every file that will be created or modified. -->
- `{{FILE_PATH_1}}` — {{REASON}}
- `{{FILE_PATH_2}}` — {{REASON}}

---

## AI Context

### Relevant Files
<!-- Files an agent should read before starting this task. -->
- `{{CONTEXT_FILE_1}}`
- `{{CONTEXT_FILE_2}}`

### Constraints
<!-- Hard rules the implementation must not violate. -->
- {{CONSTRAINT_1}}
- {{CONSTRAINT_2}}

### Validation Commands
<!-- Run all of these before marking the task Done. All must pass. -->
```bash
pnpm lint
pnpm build
```

### Expected Outcome
<!-- One sentence describing the visible result when the task is complete. -->
{{EXPECTED_OUTCOME}}

---

## Test Plan

### Unit Tests
- {{UNIT_TEST_1}}

### Integration Tests
- {{INTEGRATION_TEST_1}}

### Manual Tests
1. {{MANUAL_STEP_1}}
2. {{MANUAL_STEP_2}}

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] Validation Commands all pass (`pnpm lint`, `pnpm build`)
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated
- [ ] Completion Summary filled in below
- [ ] Feature branch PR opened against `develop`

## Risks
- {{RISK_1}}

## Notes
<!-- Anything else relevant that does not fit above. -->
{{NOTES}}

---

## Progress Updates

### {{DATE}}
- Task created

---

## Completion Summary
<!-- Fill in when status → Done. Describe what was actually built, any deviations from the plan, and follow-up tasks if any. -->
(To be filled when complete)
