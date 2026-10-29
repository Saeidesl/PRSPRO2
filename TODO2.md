# TODO2 — پرونده طرح و پیش‌تولید

## 🎯 Current Objective
آماده‌سازی رابط کاربری مستقل پرونده طرح برای تست در محیط آزمایشی.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)
- مخزن: Saeidesl/PRSPRO2، شاخه feature/design-case-preproduction.
- Frontend: index.html؛ js/core/router.js؛ js/components/layout.js؛ js/core/api.js؛ css/unified-theme.css.
- صفحه/ماژول جدید: pages/design-cases.html و js/modules/design-cases.js.
- Backend: Saeidesl/PRSPRO2BACKEND، شاخه feature/design-case-preproduction.
- API: GET /design-cases، GET /design-cases/:id، POST /design-cases، PUT /design-cases/:id، POST /design-cases/:id/approve، GET/POST /design-cases/:id/events، GET/POST /design-cases/:id/attachments.
- درخواست‌ها باید از PMS.Api عبور کنند؛ پروژه‌های تولیدی فعلی و main دست‌نخورده بمانند؛ فقط staging مجاز است.
- مدل ایجاد: Title، Description، RequiredMaterials[{ItemName,Unit,RequiredQuantity,Description}]، IdempotencyKey.
- تأیید تولید فقط در READY_FOR_APPROVAL و با ProjectCode، Quantity و IdempotencyKey انجام می‌شود.

## 📋 Macro-Task Queue & Implementation Log
- [x] Task 1 — کشف معماری و APIها.
  - *Log:* بررسی ARCHITECTURE2.md، index.html، js/core/router.js، js/components/layout.js، js/core/api.js، pages/projects.html، js/modules/projects.js و DesignCaseService.js؛ route و صفحه مستقل پرونده طرح هنوز پیاده‌سازی نشده‌اند.
- [ ] Task 2 — ساخت رابط کاربری پایه پرونده طرح (IN PROGRESS).
  - محدوده: صفحه/ماژول مستقل، route و منو، فهرست و جستجو، فرم ایجاد و ملزومات، جزئیات و وضعیت، سازگاری RTL/تم/موبایل.
  - *Log:* فایل‌های `pages/design-cases.html`، `js/modules/design-cases.js` و `css/design-cases.css` ایجاد شدند. `js/core/router.js` برای route/module و مسیر پایه مستقل `/staging/`، `js/components/layout.js` برای منو، `index.html` برای بارگذاری CSS/JS و `js/core/api.js` برای انتخاب API آزمایشی در مسیر `/staging/` به‌روزرسانی شدند. UI شامل فهرست، جستجو، فیلتر وضعیت، ایجاد پرونده با ملزومات چندردیفی، نمایش جزئیات و تاریخچه است؛ درخواست‌ها از `PMS.Api` عبور می‌کنند. فرم خطاهای اعتبارسنجی/ذخیره را داخل مودال نشان می‌دهد. انتشار فرانت‌اند در حال اجراست؛ آزمون واقعی API هنوز انجام نشده است.
- [ ] Task 3 — اتصال رویدادها و تأیید.
  - محدوده: تاریخچه رویداد، فرم تأیید فقط در وضعیت مجاز، کنترل ارسال تکراری و پیام خطا.
- [ ] Task 4 — انتشار آزمایشی و بررسی نهایی.
  - محدوده: بررسی workflow فرانت‌اند، cache-busting و راهنمای آزمون؛ عدم ادعای تست رفتاری بدون اجرای واقعی.
