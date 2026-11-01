# PMS UI and Performance Audit

- Generated: 2026-11-01T06:27:06.961Z
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
| visibleFormsInventoried | 0 |
| dynamicFormsInventoried | 0 |
| formOpenersChecked | 0 |
| visibleButtonsInventoried | 5 |
| visibleInputsAndControlsInventoried | 1 |
| networkRequestsMeasured | 11 |
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
| login | loaded | 2928 | 5587 | 0 | 5 | 1 | no |

## Coverage gaps

- Login failed with test credentials; protected-page audit was not completed. UI message: No visible error message appeared before the login timeout.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.
