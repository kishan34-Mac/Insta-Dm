# TODO
- [ ] Find root cause of 400 Bad Request during Razorpay order creation
  - [ ] Inspect backend billing controller logs to confirm incoming `req.body.plan`
  - [ ] Verify frontend -> backend request URL and payload
  - [ ] Ensure `protect` middleware sets `req.userId`
- [ ] Patch backend to return clearer 400 error + validate request body robustly
- [ ] Add frontend fallback to surface backend error message
- [ ] Test upgrade flow for starter/pro/agency

