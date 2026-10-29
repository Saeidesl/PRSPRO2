# TODO2 — پرونده طرح و پیش‌تولید

## 🌿 شاخه کاری
- شاخه فعال هر دو مخزن از این پس `main` است: `Saeidesl/PRSPRO2` و `Saeidesl/PRSPRO2BACKEND`.
- شاخه `feature/design-case-preproduction` ادغام شده؛ تغییرات جدید فقط روی `main` انجام شوند.
- برای بررسی‌های داده‌ای و تست رفتاری، از محیط و دیتابیس آزمایشی استفاده شود؛ بدون تأیید صریح، داده‌های اصلی یا عملیات مخرب اجرا نشود.

## 🎯 Current Objective
آماده‌سازی رابط کاربری مستقل پرونده طرح برای تست در محیط آزمایشی.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)
- مخزن: Saeidesl/PRSPRO2، شاخه فعال `main` (ادغام شاخه feature/design-case-preproduction انجام شده است).
- Frontend: index.html؛ js/core/router.js؛ js/components/layout.js؛ js/core/api.js؛ css/unified-theme.css.
- صفحه/ماژول جدید: pages/design-cases.html و js/modules/design-cases.js.
- Backend: Saeidesl/PRSPRO2BACKEND، شاخه فعال `main`.
- API: GET /design-cases، GET /design-cases/:id، POST /design-cases، PUT /design-cases/:id، POST /design-cases/:id/approve، GET/POST /design-cases/:id/events، GET/POST /design-cases/:id/attachments.
- درخواست‌های فرانت‌اند باید از PMS.Api عبور کنند. توسعه از این پس روی main انجام می‌شود؛ برای آزمون‌های داده‌ای فقط از محیط آزمایشی استفاده شود و انتشار به محیط تولید مطابق کنترل‌های انتشار موجود انجام گیرد.
- مدل ایجاد: Title، Description، RequiredMaterials[{ItemName,Unit,RequiredQuantity,Description}]، IdempotencyKey.
- تأیید تولید فقط در READY_FOR_APPROVAL و با ProjectCode، Quantity و IdempotencyKey انجام می‌شود.

## 📋 Macro-Task Queue & Implementation Log
- [x] Task 1 — کشف معماری و APIها.
  - *Log:* بررسی ARCHITECTURE2.md، index.html، js/core/router.js، js/components/layout.js، js/core/api.js، pages/projects.html، js/modules/projects.js و DesignCaseService.js؛ route و صفحه مستقل پرونده طرح هنوز پیاده‌سازی نشده‌اند.
- [x] Task 2 — ساخت رابط کاربری پایه پرونده طرح.
  - محدوده: صفحه/ماژول مستقل، route و منو، فهرست و جستجو، فرم ایجاد و ملزومات، جزئیات و وضعیت، سازگاری RTL/تم/موبایل.
  - *Log:* فایل‌های `pages/design-cases.html`، `js/modules/design-cases.js` و `css/design-cases.css` ایجاد شدند. `js/core/router.js` برای route/module و مسیر پایه مستقل `/staging/`، `js/components/layout.js` برای منو، `index.html` برای بارگذاری CSS/JS و `js/core/api.js` برای انتخاب API آزمایشی در مسیر `/staging/` به‌روزرسانی شدند. UI شامل فهرست، جستجو، فیلتر وضعیت، ایجاد پرونده با ملزومات چندردیفی، نمایش جزئیات و تاریخچه است؛ درخواست‌ها از `PMS.Api` عبور می‌کنند. فرم خطاهای اعتبارسنجی/ذخیره را داخل مودال نشان می‌دهد. پس از گزارش کاربر مبنی بر دیده‌نشدن گزینه، مشخص شد منو و Router نمایش/ورود به صفحه را بر اساس دسترسی‌های PROJECT_VIEW/PROJECT_CREATE فیلتر می‌کردند؛ برای قابل‌دسترسی بودن صفحه آزمایشی، فیلتر فرانت‌اند برای design-cases برداشته شد. مجوزهای داده همچنان در بک‌اند اعمال می‌شوند. کاربر ایجاد یک پرونده طرح جدید را در محیط آزمایشی با موفقیت تأیید کرد؛ بنابراین مسیر پایه ایجاد پرونده در آزمون عملی اولیه تأیید شد. سایر وضعیت‌ها و مسیرهای رویداد/تأیید هنوز جداگانه آزموده نشده‌اند.
- [ ] Task 3 — اتصال رویدادها و تأیید (IN PROGRESS).
  - محدوده: تاریخچه رویداد، فرم تأیید فقط در وضعیت مجاز، کنترل ارسال تکراری و پیام خطا.
  - *Log:* در `js/modules/design-cases.js`، جزئیات پرونده اکنون تاریخچه رویدادها را از `GET /design-cases/:id/events` بارگذاری می‌کند؛ امکان ثبت رویداد از انواع فعال با `ConnectionType=DESIGN_CASE` از طریق `POST /design-cases/:id/events` اضافه شد. فرم تأیید فقط در وضعیت `READY_FOR_APPROVAL` نمایش داده می‌شود و با دریافت گردش‌کار/واحدها، `POST /design-cases/:id/approve` را با `ProjectCode`, `Quantity`, `WorkflowID`, `AvailableDepartmentIDs` و `IdempotencyKey` فراخوانی می‌کند. ارسال تکراری سمت UI مهار شده و خطاها داخل فرم نمایش داده می‌شوند. تغییرات ثبت شده و نیازمند آزمون عملی کاربر در محیط آزمایشی است.
  - *Log:* علت دیده‌نشدن گزینه مشخص شد: `index.html` هنوز نسخه قدیمی `js/modules/event-types.js` را با پارامتر cache-busting ثابت بارگذاری می‌کرد و ممکن بود نسخه قبلی در مرورگر استفاده شود. پارامتر نسخه در `index.html` به `20261030-design-case-connection-1` تغییر کرد تا فایل اصلاح‌شده بارگذاری شود؛ نیازمند بررسی در محیط آزمایشی است.
  - *Log:* در `js/modules/event-types.js`، گزینه `ConnectionType=DESIGN_CASE` به فرم اضافه شد. هنگام انتخاب آن، تنظیمات گردش پروژه پنهان و تنظیمات اختصاصی پرونده طرح نمایش داده می‌شوند؛ شامل `TargetDesignCaseStatus` با وضعیت‌های مجاز بک‌اند و `TransitionsToProduction` برای انتقال به `READY_FOR_APPROVAL`. هنگام ذخیره، فیلدهای ناسازگار تولید پاک/غیرفعال ارسال می‌شوند تا تغییر نوع ارتباط باعث باقی‌ماندن تنظیمات ناسازگار نشود. تغییرات برای آزمون عملی در محیط آزمایشی آماده‌اند.
- [ ] Task 4 — انتشار آزمایشی و بررسی نهایی.
  - محدوده: بررسی workflow فرانت‌اند، cache-busting و راهنمای آزمون؛ عدم ادعای تست رفتاری بدون اجرای واقعی.
