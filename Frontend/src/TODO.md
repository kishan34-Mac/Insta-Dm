# TODO

- [x] Update landing Pricing CTA behavior to redirect logged-in users to `/dashboard/settings?upgradePlan=...` instead of `/signup?plan=...`
- [ ] Update `/dashboard/settings` page to read `upgradePlan` query param, show pop-up/notification, and auto-start Razorpay upgrade
- [ ] Ensure refresh does not re-trigger upgrade (remove query param after handling)
- [ ] Sanity test: logged-out signup flow still works; logged-in auto upgrade works for Starter/Pro/Agency

