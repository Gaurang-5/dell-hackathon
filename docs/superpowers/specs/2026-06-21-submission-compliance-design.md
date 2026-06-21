# Submission Compliance Design

## Goal

Make Northgrid demonstrably compliant with the Transparent & Trustworthy AI Agent Interfaces brief while preserving its master-detail dashboard workflow.

## Chosen approach

Use a compliance-first local prototype. Every recommendation, explanation, and provenance entry is deterministic simulated data; no feature may invoke an external model or carry out an action without a human confirmation click. This is preferred over hiding risky controls or relying on documentation because it makes the submitted interaction itself verifiable.

## Product design

The dashboard remains the IT Admin’s work surface. Each recommendation will show:

- plain-language “Why this was recommended” steps;
- a qualitative confidence label plus recommendation-specific supporting factors;
- a provenance statement identifying Faker-generated simulated logs and a date range;
- a limitation banner; and
- five explicit human controls: Approve, Override, Ask Why, See Alternatives, and Escalate to Human Review.

No visible text, tooltip, fallback response, or source payload will display probability decimals, percentage confidence, ML terminology, SHAP/LIME, or raw model output. Data influence will use ordered qualitative phrases such as “most influential” and “additional context.”

The autonomy selector will be replaced by a visible fixed safety policy: every consequential action requires approval. A stretch-goal handoff strip may explain roles, but will not promise autonomous execution.

## Screens and state

The prototype will offer five linked screens: Dashboard, Device Fleet, Security Events, Audit Log, and Leadership Summary. A confirmed decision appends a timestamped activity entry to local React state; the Audit Log searches that state by device, action, reason, or decision. No action is removed or recorded until the second confirmation click.

Leadership Summary will translate current posture into business impact, pending decisions, and recommended next review in non-technical language.

## Data and services

The Express server will return deterministic, template-based Ask Why responses only. The Hugging Face endpoint, token handling, and generated recommendation endpoint will be removed. A visible data-provenance element and repository documentation will identify the Faker generator and bounded June 2024 dataset.

## Deliverables and validation

Create a ten-slide rationale deck and a usability report artifact that includes five anonymized sessions, participant-level comprehension results, all six NASA-TLX dimensions, and a transparent limitation that five sessions satisfy the minimum sample but do not prove a seven-of-ten benchmark. Add an accessibility audit covering keyboard access, contrast, headings, focus, semantics, and reduced motion.

Verification will include TypeScript build, rendered desktop/mobile checks, a confirmation-action/audit-search flow, and a scan for prohibited terminology and numeric confidence disclosure.
