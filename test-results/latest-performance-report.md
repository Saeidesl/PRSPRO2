# PMS UI and Performance Audit

- Generated: 2026-10-29T05:39:52.203Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **authentication-failed**

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
| procurementApiRequestsMeasured | 0 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 0 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 0 |
| failedSafeButtonChecks | 0 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| login | loaded | 136 | 754 | 1 | 2 | 2 | no |

## Coverage gaps

- Login failed with test credentials; protected-page audit was not completed. UI message: No visible error message appeared before the login timeout.
- login: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.
