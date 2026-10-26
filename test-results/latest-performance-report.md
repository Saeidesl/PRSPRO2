# PMS UI and Performance Audit

- Generated: 2026-10-26T11:46:06.341Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: public-login-and-shell-only
- Overall: **blocked-no-staging-api**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 1 |
| loadedRoutes | 1 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 1 |
| dynamicFormsInventoried | 0 |
| formOpenersChecked | 0 |
| visibleButtonsInventoried | 2 |
| visibleInputsAndControlsInventoried | 2 |
| networkRequestsMeasured | 3 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 0 |
| failedSafeButtonChecks | 0 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| login | loaded | 159 | 774 | 1 | 2 | 2 | no |

## Coverage gaps

- Authenticated audit skipped: configure PMS_STAGING_API_BASE_URL to a separate staging Apps Script deployment. Production API will not be used for test login.
- login: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.
