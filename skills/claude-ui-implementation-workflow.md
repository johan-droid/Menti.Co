# Claude Skill: UI Implementation Workflow

## Purpose
This skill defines the workflow for implementing UI features using Claude (Anthropic) as a prompt-driven code generation assistant, with a focus on mobile-first, responsive, and production-ready integration.

## Workflow

1. **Prompt-Driven Generation**
   - Use Claude to generate UI code based on clear, detailed prompts describing the feature, user flows, and design requirements.
   - Prompts must specify:
     - Mobile-first design (375px, 768px, 1024px breakpoints)
     - Real frontend-backend data sync (no dummy data)
     - Responsive and accessible UI

2. **Integration**
   - Integrate generated code into the actual codebase, replacing placeholders with real data sources and API calls.
   - Ensure all UI states (loading, error, empty, success) are handled.

3. **Testing & Review**
   - Test on real devices/emulators at all breakpoints.
   - Peer review for code quality, responsiveness, and adherence to requirements.

4. **Iteration**
   - Refine prompts and code as needed based on feedback and test results.

## Best Practices
- Always start with a clear, detailed prompt.
- Avoid hardcoded or dummy data in integrated screens.
- Prioritize accessibility and responsiveness.
- Document any deviations from the workflow.

---

_This skill is intended for use with Claude (Anthropic) as the code generation agent. For Gemini or Copilot, see their respective skills._
