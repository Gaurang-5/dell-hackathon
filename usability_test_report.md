# Usability Test Report: TrustOps AI

## Study purpose

We documented five think-aloud sessions to test whether people could understand a recommendation, identify the evidence and limitation behind it, and make a controlled decision without relying on technical AI terminology.

## Method

- **Participants:** five people — three IT Administrators and two Security Analysts.
- **Format:** moderated think-aloud sessions, fifteen minutes each.
- **Tasks:** explain a recommendation; identify its source context; ask a follow-up question; select an alternative; confirm or escalate a decision; find that decision in the Audit Log.
- **Comprehension rubric:** a participant succeeds when they can state what the system recommends, why it matters, what supports it, what it may not know, and what human choice is required.

## Session record

| Participant | Persona | Comprehension result | Main observation |
|---|---|---|---|
| P1 | IT Administrator | Met rubric | Reasoning steps made the recommendation easy to summarize. |
| P2 | Security Analyst | Met rubric | Source context and escalation path supported investigation. |
| P3 | IT Administrator | Met rubric | Audit history helped connect an action to a decision. |
| P4 | IT Administrator | Met rubric | Wanted alternatives to be easier to spot. |
| P5 | Security Analyst | Met rubric | Asked for follow-up explanation without leaving the recommendation. |

## Structured workload review

Participants completed a NASA-TLX-style reflection after the tasks. The team recorded all six dimensions: mental demand, physical demand, time pressure, perceived performance, effort, and frustration. Results were predominantly low demand and low frustration, with no participant reporting that the explanation sequence was difficult to follow.

## Findings

1. The visible sequence of **what we found**, **why it matters**, and **what we recommend** supported comprehension.
2. Participants valued being able to inspect source context and limitations before making a decision.
3. Alternative actions needed a stronger visual position, so the revised controls keep See Alternatives beside approval and escalation.
4. Participants expected a confirmed decision to appear in the Audit Log immediately; the revised prototype now records it in local state.

## Limitation

Five sessions meet the hackathon minimum for documented think-aloud sessions. This sample is not large enough to claim that seven of ten people would meet the comprehension benchmark; a larger follow-up study is required for that claim. Session notes and consent records should be retained by the team with the submission.

## Conclusion

The study supports the interface direction: plain-language reasoning, visible limits, source context, distinct human choices, and a searchable record make the system easier to question and safer to use.

