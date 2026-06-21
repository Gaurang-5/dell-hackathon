# Northgrid Submission Compliance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the prototype conform to every hard transparency, control, provenance, persona, and delivery requirement identified in the audit.

**Architecture:** Keep recommendation data local and use a small compliance utility for qualitative language, source attribution, and audit filtering. App state owns pending recommendations and activity entries, passing only focused callbacks into the recommendation and audit surfaces. The server becomes a deterministic local explanation endpoint without external calls.

**Tech Stack:** React 18, TypeScript, Vite, Express, Node assert test runner.

---

### Task 1: Add compliance utilities and a regression test

**Files:**
- Create: `src/utils/compliance.ts`
- Create: `tests/compliance.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { buildSourceAttribution, confidenceCopy, matchesActivityQuery } from '../src/utils/compliance'

assert.equal(confidenceCopy('0.91').label, 'High confidence')
assert.equal(buildSourceAttribution('June 2024').includes('Faker-generated simulated logs'), true)
assert.equal(matchesActivityQuery({ assetId: 'LAPTOP-0015', actionTaken: 'Apply patches', reasoningSummary: 'Missing updates', humanDecision: 'Approved' }, 'patch'), true)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx tests/compliance.test.ts`

Expected: module-not-found failure for `src/utils/compliance`.

- [ ] **Step 3: Implement minimal compliance helpers**

```ts
export function confidenceCopy(score: number | string) {
  const value = Number(score)
  if (value >= 0.8) return { label: 'High confidence', note: 'Several independent signals support this recommendation.' }
  if (value >= 0.6) return { label: 'Review recommended', note: 'The available signals point in one direction, but a human should verify the context.' }
  return { label: 'Manual review needed', note: 'The evidence is limited or mixed.' }
}
export const buildSourceAttribution = (period: string) => `Faker-generated simulated logs, bounded to ${period}; no live device or external data is used.`
export const matchesActivityQuery = (entry: { assetId: string; actionTaken: string; reasoningSummary: string; humanDecision: string }, query: string) => !query.trim() || [entry.assetId, entry.actionTaken, entry.reasoningSummary, entry.humanDecision].join(' ').toLowerCase().includes(query.toLowerCase())
```

- [ ] **Step 4: Run the regression test**

Run: `npx tsx tests/compliance.test.ts`

Expected: exit code 0.

### Task 2: Remove unsafe autonomy, raw-output, and live-service paths

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AutonomyDial.tsx`
- Modify: `src/components/RecommendationCard.tsx`
- Modify: `src/components/ReasoningPanel.tsx`
- Modify: `src/components/DataSourceChips.tsx`
- Modify: `src/components/HumanControls.tsx`
- Modify: `src/server.ts`

- [ ] **Step 1: Remove the autonomous option and replace it with fixed safety copy**

```tsx
<section aria-label="Safety policy">
  <h2>Human approval is required</h2>
  <p>Northgrid can prepare recommendations, but it never changes a device, patch, quarantine, or configuration until a person confirms the exact action.</p>
</section>
```

- [ ] **Step 2: Replace numeric/model-facing copy with qualitative plain language**

```tsx
<h4>What informed this recommendation</h4>
<p>Most influential: {primarySignal}</p>
<p>Additional context: {secondarySignal}</p>
```

Remove title attributes containing raw confidence values, percentages, “Model Explainability,” agent-pipeline labels, and source raw-data payload rendering.

- [ ] **Step 3: Make Ask Why deterministic and local**

```ts
app.post('/api/explain-recommendation', (req, res) => {
  const { recommendationTitle = '', contextText = '', questionText = '' } = req.body
  res.json({ answer: fallbackExplainAnswer(recommendationTitle, contextText, questionText) })
})
```

Delete Hugging Face URL, token logic, `fetch`, and recommendation-generation endpoint.

- [ ] **Step 4: Verify prohibited UI/service phrases are absent**

Run: `rg -n -i 'confidence:?\\s*0\\.|model explain|shap|lime|softmax|probability|act & notify|fully autonomous|api-inference|HF_API_KEY' src`

Expected: no matches except test-only prohibited-term assertions.

### Task 3: Make the controls and audit trail observable

**Files:**
- Modify: `src/types.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/HumanControls.tsx`
- Modify: `src/components/AuditLog.tsx`

- [ ] **Step 1: Add explicit control semantics**

```tsx
<button onClick={() => setPendingAction(primaryOption.actionLabel)}>Approve recommended action</button>
<button onClick={() => setShowAlternatives(true)}>See alternatives</button>
<button onClick={() => setShowOverride(true)}>Override</button>
<button onClick={() => setShowAskWhy(true)}>Ask why</button>
<button onClick={() => setPendingAction('Escalate to human review')}>Escalate to human review</button>
```

- [ ] **Step 2: Append a local audit entry only after confirmation**

```ts
setActivityLogs((current) => [{
  id: `local-${Date.now()}`,
  timestamp: new Date().toISOString(),
  assetId: recommendation.assetId,
  assetIcon: getAssetIcon(recommendation.assetId),
  actionTaken: actionLabel,
  reasoningSummary: recommendation.summary,
  confidence: recommendation.confidenceLabel,
  humanDecision: decisionFromAction(actionLabel),
}, ...current])
```

- [ ] **Step 3: Add a labeled searchable audit input**

```tsx
<label htmlFor="audit-search">Search decisions</label>
<input id="audit-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Device, action, reason, or decision" />
```

- [ ] **Step 4: Verify manually**

Run: `npm run dev`

Expected: Approve opens a confirmation block; Confirm adds a new matching entry to Audit Log; the search narrows to that entry.

### Task 4: Complete persona and accessibility coverage

**Files:**
- Create: `src/components/LeadershipSummary.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Create: `accessibility_audit.md`

- [ ] **Step 1: Add the Leadership Summary navigation and screen**

```tsx
<LeadershipSummary pendingCount={activeRecommendations.length} recentDecisions={activityLogs.slice(0, 3)} />
```

The component must use only plain language: current business posture, impact if nothing is reviewed, decisions awaiting people, and next recommended review.

- [ ] **Step 2: Make keyboard/focus and contrast improvements**

Ensure every interactive control has a visible `:focus-visible` style, buttons have accessible labels, tables retain headers, and muted text passes contrast against the dark background.

- [ ] **Step 3: Document the WCAG 2.1 AA check**

List scope, keyboard flow, focus, color contrast, semantics, zoom/reflow, reduced motion, and known limitations in `accessibility_audit.md`.

### Task 5: Fix submission materials

**Files:**
- Modify: `README.md`
- Modify: `design_rationale_deck.md`
- Modify: `usability_test_report.md`
- Modify: `final_submission_tasks.md`

- [ ] **Step 1: Reduce rationale content to ten slides**

Use: title, problem, personas, dashboard workflow, transparency pattern, control/safety, provenance, stakeholder view, usability results, conclusion. Remove internal model terminology and raw numeric-confidence examples.

- [ ] **Step 2: Make usability evidence auditable**

Add anonymized per-session task/comprehension outcomes, six NASA-TLX dimensions, a comprehension rubric, and an honest sample-size limitation.

- [ ] **Step 3: Update documentation**

State that all demo data is local Faker-generated simulation, live data is absent, all actions require confirmation, and list the required exported deck/report/video artifacts without claiming they already exist.

### Task 6: Validate the finished prototype and artifacts

**Files:**
- Test: `tests/compliance.test.ts`

- [ ] **Step 1: Run automated checks**

Run: `npx tsx tests/compliance.test.ts && npm run build`

Expected: both exit code 0.

- [ ] **Step 2: Update the repository graph**

Run: `graphify update .`

Expected: success, or record that the graphify CLI is unavailable because no graph artifact or CLI is installed.

- [ ] **Step 3: Run desktop and mobile browser validation**

Exercise Dashboard → Approve → Confirm → Audit Log → search, then Leadership Summary. Verify visible content, console health, focus, no framework overlay, and responsive reflow.

- [ ] **Step 4: Confirm deliverable inventory**

Run: `find . -maxdepth 2 -type f \( -iname '*.pptx' -o -iname '*.pdf' -o -iname '*.docx' -o -iname '*.mp4' \) -print`

Expected: actual deck/report artifacts or an explicit remaining item list.
