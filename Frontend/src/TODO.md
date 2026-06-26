# TODO - Landing plan upgrade redirect + popup flow

## Plan
1. Update landing pricing CTAs (Pricing.tsx) so that:
   - If user is NOT logged in: keep current behavior (navigate to signup with plan param).
   - If user IS logged in: CTA clicks always redirect to `/dashboard/settings?upgradePlan=<plan>`.
   - For “Starter/Pro/Agency” CTAs (start free, get starter, get pro, talk to sales): use correct upgradePlan keys.

2. Add upgradePlan popup behavior in dashboard Settings page (Settings.tsx):
   - Read `upgradePlan` from querystring.
   - If it exists and differs from current user.plan (case-insensitive) then show a modal/pop-up:
     - Message: “Click and pay to upgrade your <plan> plan” (wording as close as possible).
     - Button: “Upgrade Now”
     - On click: trigger existing `startUpgrade(upgradePlan)`.
   - Ensure popup doesn’t auto-trigger upgrade without user click.
   - If user already on that plan, still redirect is allowed but popup should not show upgrade flow.

3. Prevent duplicate popup triggers:
   - After showing the popup once, avoid re-show loops on re-render.
   - Optionally strip query param after action or after showing.

4. (Optional if needed) Ensure existing Billing & Upgrade section buttons still work normally.

## Followup steps
- Run frontend dev server and test:
  - Logged-out user clicking Starter/Pro/Agency -> /signup?plan=...
  - Logged-in user clicking Starter/Pro/Agency -> /dashboard/settings?upgradePlan=...
  - Popup appears with Upgrade Now; clicking launches Razorpay.
  - Popup not shown when selecting the same plan.

