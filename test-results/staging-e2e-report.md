# PMS Staging E2E

- Status: **failed**
- Started: 2026-10-24T20:16:42.299Z
- Finished: 2026-10-24T20:17:25.952Z

## Error

page.evaluate: Error: رویداد ثبت شده اما تأیید نهایی آن ذخیره نشد؛ از ارسال مجدد درخواست خودداری کنید و رویداد موجود را بررسی کنید.
    at Object.createApiError (https://saeidesl.github.io/PRSPRO2/js/core/api.js?v=20261022-retry-sync-2:535:21)
    at Object.request (https://saeidesl.github.io/PRSPRO2/js/core/api.js?v=20261022-retry-sync-2:367:22)
    at async eval (eval at evaluate (:370:30), <anonymous>:4:66)
    at async <anonymous>:396:30

## Steps

- create-project: PASS — {"name":"create-project","at":"2026-10-24T20:16:58.673Z","ok":true,"projectId":"PRJ_e9fdb02039a04c1386025ee889acf4ba","projectCode":"QA_E2E_20261024201653","workflowId":"WF_ffff7a68ad9a4af9be56121536a50616","departmentId":"DEP_b4359211"}
- create-material-specification: PASS — {"name":"create-material-specification","at":"2026-10-24T20:17:03.552Z","ok":true,"consumptionPerUnit":1.5}
- configure-cut-event-type: PASS — {"name":"configure-cut-event-type","at":"2026-10-24T20:17:17.431Z","ok":true,"eventTypeId":"ET_c3c46c704582467d8025b4c168ee6d49","fieldId":"EF_0ee6acffa2624ce5a0f7f34dc1565d34"}

## Created test data

{
  "projectId": "PRJ_e9fdb02039a04c1386025ee889acf4ba",
  "projectCode": "QA_E2E_20261024201653",
  "eventTypeId": "ET_c3c46c704582467d8025b4c168ee6d49",
  "eventFieldId": "EF_0ee6acffa2624ce5a0f7f34dc1565d34"
}
