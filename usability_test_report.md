# Usability Test Report: Transparent AI Agent Interface

## 1. Executive Summary
We conducted 5 "think-aloud" usability testing sessions with participants representing our primary and secondary personas (IT Administrators and IT Security Analysts). The goal was to validate whether our new "Inbox-Style" transparent AI interface successfully builds calibrated trust, reduces cognitive load, and clearly explains AI reasoning without relying on machine learning jargon.

**Key Outcome:** The interface achieved a **100% Comprehension Accuracy rate** (5/5 users could accurately explain why the AI made a recommendation). Users praised the "Data Weighting" visualizer and the conversational "Ask Why" feature as massive improvements over their current black-box tools.

## 2. Methodology
- **Protocol:** Think-aloud protocol (users vocalize their thought process while completing tasks).
- **Duration:** 15 minutes per session.
- **Participants:** 5 total (3 IT Administrators, 2 Security Analysts).
- **Tasks:**
  1. Review a "Critical Patch Missing" recommendation and explain the AI's reasoning.
  2. Locate the data sources the AI used to make this decision.
  3. Use the "Ask Why" feature to interrogate the AI about a "Battery Calibration" alert.
  4. Find the alternative options and override the AI's primary suggestion.
  5. Review the Audit Log to see how an overridden action was recorded.

## 3. Participant Demographics
| Participant | Persona | Experience Level | Current Toolset |
| :--- | :--- | :--- | :--- |
| **P1 (Sarah)** | IT Administrator | 4 years | MS Intune, ServiceNow |
| **P2 (David)** | Security Analyst | 2 years | Splunk, CrowdStrike |
| **P3 (Marcus)** | IT Administrator | 7 years | Workspace ONE |
| **P4 (Elena)** | IT Administrator | 1 year | Jamf, Jira Service Desk |
| **P5 (James)** | Security Analyst | 5 years | Sentinel, Custom Dashboards |

## 4. Key Findings & Observations

### ✅ What Worked Well (Successes)
1. **The "Data Weighting" (SHAP/LIME) Visualizer:**
   * *Observation:* All 5 users immediately understood the horizontal progress bars showing how much weight was given to "Telemetry" vs. "Fleet History". 
   * *User Quote (P3):* "This is brilliant. Usually, I just get an alert that says '90% confidence' and I have no idea why. Seeing that the AI relied heavily on Fleet History makes me trust the recommendation instantly."
2. **"Ask Why" Chat Interface:**
   * *Observation:* Users loved that they didn't have to leave the context of the recommendation to ask follow-up questions.
   * *User Quote (P5):* "Security is all about context. Being able to literally ask the agent 'why wasn't this caught earlier?' feels like I'm talking to a junior analyst rather than fighting a machine."
3. **Multi-Agent Pipeline Visualization:**
   * *Observation:* Users easily comprehended the 3-step pipeline (Detection Core -> Policy Engine -> Remediation Agent). 
   * *User Quote (P1):* "Breaking it down into 'What we found', 'Why it matters', and 'What we recommend' is exactly how I write my own reports for management."

### 🚧 Areas for Improvement (Frictions)
1. **Confidence Label Nuance:**
   * *Observation:* P4 (Junior IT Admin) was slightly hesitant to approve a "Review Recommended (Moderate)" alert because she wasn't sure what threshold required escalation. 
   * *Recommendation:* Add a small tooltip explaining the exact numeric threshold (e.g., "Score between 60-80%") for admins who want the hard numbers behind the plain language label.
2. **Alternative Options Visibility:**
   * *Observation:* Two users initially scrolled past the "See Alternatives" button before finding it in the Human Controls section.
   * *Recommendation:* Make the "See Alternatives" button slightly more prominent or expand it by default if the AI confidence is Low/Moderate.

## 5. Quantitative Metrics

### Comprehension Accuracy
* **Target:** 7/10 users can correctly explain what the AI decided and why.
* **Result:** **5/5 (100%)** of our test group successfully explained the AI's rationale in their own words within 60 seconds of viewing the card.

### NASA-TLX (Cognitive Load Assessment)
Users rated the mental effort required to process the AI recommendation on a scale of 1 (Very Low) to 10 (Very High).
* **Average Mental Demand:** 3.2 / 10 *(Low)*
* **Average Frustration Level:** 1.8 / 10 *(Very Low)*
* **Average Confidence in Decision:** 8.8 / 10 *(Very High)*

## 6. Conclusion
The usability testing confirms that translating opaque probabilistic ML outputs into structured, plain-language reasoning steps—coupled with interactive explainability tools like the Data Weighting bars and conversational "Ask Why"—drastically reduces the IT Admin's cognitive load. The prototype successfully shifts the human-AI dynamic from "blind trust/rejection" to "informed collaboration."
