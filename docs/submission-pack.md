# Project DNA | Submission Pack

**Status:** Draft for submission. Replace the Vercel placeholder after deployment, upload the growth-plan PDF to Drive/Notion/Canva if the form requires a public share URL, and record the video before submitting.

## 1. Growth Plan

**Artifact:** [Project DNA Growth Plan (2-page PDF)](../output/pdf/Project-DNA-Growth-Plan.pdf)

Upload this PDF to Drive or another accepted host and set access so the evaluator can view it. The plan treats the 500 eligible-student target and channel allocations as hypotheses, not achieved results.

## 2. Working Asset Link

**Source repository:** https://github.com/saijeevan06/projectdna

**Live application:** Add the Vercel production URL after deployment. Do not submit a localhost URL.

## 3. Your 3 Tests

**Paste-ready paragraph:**

Test 1 - Hypothesis: a role-specific landing message will make more eligible engineering students start a project journey than a generic workshop-first message. What I would test: compare two landing-page message variants using source-tagged traffic. Metric: eligible registrations per landing session, with journey-start rate as an early signal. Test 2 - Hypothesis: showing a useful project result before the workshop CTA will increase qualified workshop conversions. What I would test: compare approved, clearly worded CTA treatments after project results, without hiding the result or changing eligibility rules. Metric: confirmed eligible registrations per result view and CTA-to-confirmation rate. Test 3 - Hypothesis: an optional referral invitation after a successful registration will bring in additional eligible students without reducing the primary conversion. What I would test: compare referral prompt wording/placement on the confirmation step and keep sharing user-initiated. Metric: completed eligible referral registrations per original registrant, alongside overall registration completion. These are proposed experiments; no results are claimed until the tests are actually run.

## 4. AI Worklog

The examples below summarize documented build interactions and outcomes; they are not verbatim model transcripts. The repository/build history does not preserve exact model output for each exchange. If the assessment requires transcript-level evidence, replace each summary with a screenshot or exact excerpt from the relevant AI conversation before submission.

### Example 1 - Keep the profile short and useful

- **Prompt (summary of the request):** Keep the five shared questions and their specified options: branch, experience, preferred technology, interests, and available time. Suggestions should also use the role the student is aiming for.
- **AI output (implementation summary):** Use one shared five-question profile for both journeys and keep the target role as a separate context prompt on the project-discovery path.
- **What changed or was rejected:** We did not add target role as a sixth shared profile question; that would have made the common intake longer than requested.
- **Final output:** A five-question shared profile plus a path-specific role prompt, followed by tailored project results.

### Example 2 - Give the product a distinct visual identity

- **Prompt (user request):** “change the colour platte and theme of the whole website looks to generic and ai generated - build a high end visual ui and scroll animations - use lovable to do this.”
- **AI output (implementation summary):** Replace the generic purple/lilac treatment with a more distinctive palette and add purposeful page motion and interaction cues.
- **What changed or was rejected:** The purple/lilac visual direction was rejected as generic. Motion was kept restrained and made compatible with reduced-motion preferences.
- **Final output:** Forest ink, signal lime and warm paper across the app, with scroll reveals, clearer focus/hover states and reduced-motion support.

### Example 3 - Keep provider credentials server-side

- **Prompt (user request):** “keep everything ready for connecting supabase - ill add keys in env.”
- **AI output (implementation summary):** Configure the app to call Supabase Edge Functions and keep AI provider calls in the server-side functions, with deterministic fallbacks.
- **What changed or was rejected:** The Gemini key was not placed in the browser-facing Vite `.env.local` file. It was configured as a Supabase Edge Function secret instead.
- **Final output:** Supabase URL/anon key are browser config; `GEMINI_API_KEY` is in Supabase Secrets; Gemini model config and fallback behavior remain server-side.

## 5. 3-Minute Video

**Video link:** Pending recording and upload. Add a Loom, Google Drive, or unlisted YouTube URL here; do not submit a placeholder link.

### Suggested 3-minute walkthrough

**0:00-0:20 | Problem and idea**  
“Students often have a project but do not know how to improve it, or they do not know what to build for a role. Project DNA gives them practical guidance first, then a clear next step to the NxtWave AI workshop.”

**0:20-0:50 | Landing and paths**  
Show the landing page and explain the Student/Developer choice. Open both “improve a project” and “find a project” journeys. Mention that users can start without creating an account.

**0:50-1:25 | Shared profile and role context**  
Show the five profile questions and, for discovery, the target-role suggestions. Explain that the questions help tailor the project scope to branch, experience, technology, interests and time available.

**1:25-2:00 | Project outcomes**  
Show one recommendation and one makeover result. Explain that discovery uses a curated catalogue and makeover uses bounded public README/project-description input. Do not claim full-codebase analysis or code execution. Show the copyable project brief.

**2:00-2:30 | Workshop and sharing**  
Show the workshop CTA and explain whether the deployed link is an official handoff or demo registration. Show optional referrals and make clear that sharing does not gate access.

**2:30-2:50 | How it is built**  
Briefly show Supabase-backed Edge Functions, server-side Gemini configuration, and curated/template fallbacks. Do not display keys, real student data, or claim AI behavior has been verified unless you have checked it in the deployed app.

**2:50-3:00 | Close**  
“Project DNA makes the next project step clearer and gives us a measurable, privacy-conscious route to the workshop. The campaign targets are hypotheses; the dashboard distinguishes demo activity from verified registrations.”

## 6. What did AI suggest that you deliberately rejected, and why?

**Draft answer to verify before submitting:**

“I rejected the generic purple/lilac visual direction because it made Project DNA feel like an interchangeable AI tool. I chose a more grounded visual identity using forest ink, signal lime and warm paper, with restrained motion and reduced-motion support. I also kept the product focused on project guidance instead of expanding it into full repository cloning or code execution, which would add security/privacy risk and exceed the challenge scope.”

**Accuracy note:** The build history confirms the earlier purple/lilac design existed and that you asked for a redesign, but it does not prove which AI tool originated that design. Use the first sentence as an AI-rejection claim only if it matches your actual AI interaction. The repository requirements explicitly rule out full repository cloning/execution; describe that as a product boundary, not as an AI suggestion, unless you personally saw an AI propose it.
