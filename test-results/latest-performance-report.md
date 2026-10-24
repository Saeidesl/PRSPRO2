# PMS UI and Performance Audit

- Generated: 2026-10-24T18:03:42.341Z
- Base URL: https://saeidesl.github.io/PRSPRO2/
- Mode: public-login-and-shell-only
- Overall: **limited-no-test-credentials**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 1 |
| loadedRoutes | 1 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 1 |
| visibleButtonsInventoried | 2 |
| visibleInputsAndControlsInventoried | 2 |
| networkRequestsMeasured | 4 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 0 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Navigation ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---|
| login | loaded | 2253 | 1 | 2 | 2 | no |

## Coverage gaps

- login: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.
