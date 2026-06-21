# TrustOps AI

TrustOps AI is a transparency-first IT operations prototype for the Dell Hackathon. It helps people review simulated device recommendations while keeping every consequential action under explicit human control.

## Safety and data policy

- Every patch, isolation, configuration change, or escalation requires a separate **Confirm & Execute** click.
- The prototype uses deterministic Faker-generated simulated logs from a fixed June 2024 demo dataset.
- No live device data, external data source, or remote inference service is used.
- Recommendation cards present plain-language reasoning, a qualitative confidence label, specific source context, known limitations, alternatives, and an audit trail.

## Prototype screens

- Command Center — review recommendations in a master-detail workflow.
- Leadership Summary — plain-language operational posture for non-technical stakeholders.
- Device Fleet — managed-device overview.
- Security Events — active security observations.
- Audit Log — searchable and filterable history of recommendations and human decisions.

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Verify

```bash
npm test
npm run build
```

## Data generation

The data generator uses Python Faker with a fixed seed. Regenerate the bounded demo data with:

```bash
python scripts/generate_data.py
```

## Submission materials

- `design_rationale_deck.md` — ten-slide deck outline.
- `usability_test_report.md` — think-aloud study documentation and limitations.
- `final_submission_tasks.md` — export and submission checklist.

