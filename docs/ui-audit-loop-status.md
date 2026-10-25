# PMS — وضعیت چرخه اصلاح ممیزی رابط کاربری

آخرین به‌روزرسانی: 2026-10-25  
مخزن: `Saeidesl/PRSPRO2`  
شاخه کاری: `fix/project-modal-accessibility-20261025`  
PR: https://github.com/Saeidesl/PRSPRO2/pull/93

## هدف این چرخه
برای هر ایراد: بررسی کد فعلی ← اصلاح کوچک و کنترل‌شده ← اجرای تست هدفمند و CI ← بررسی شواهد ← به‌روزرسانی وضعیت. فقط وقتی شواهد کافی وجود دارد وضعیت `fixed_verified` می‌شود. تست منبعی یا تست شبیه‌سازی‌شده به‌تنهایی اثبات تست کامل مرورگر نیست.

## دور جاری — آزمون رفتاری کنترل صفحه‌کلید مودال‌ها

- ایراد: تست‌های قبلی بیشتر حضور کدها و اتصال کنترلر را با الگوهای متنی بررسی می‌کردند و رفتار کلیدها را اجرا نمی‌کردند.
- فایل برنامه بررسی‌شده: `js/modules/projects.js`، تابع `bindProjectModalKeyboard`.
- فایل تست تغییرکرده: `tests/project-modal-accessibility.test.js`.
- تغییر: افزودن تست برای فوکوس اولیه، چرخش Tab و Shift+Tab، بستن با Escape، پاک‌سازی listener و نادیده‌گرفتن پنجره زیرین؛ fixture چند listener را نیز پشتیبانی می‌کند.
- مستند جزئیات: [گزارش تکمیلی مودال‌ها](ui-audit-project-modals-followup.md).
- Commitهای تست: `b513be6d7a04f724700f1bfd94af9e9bb837acee` و `de1e879e4f332f92957dab01d188ded3feda8014`.
- Commit گزارش اولیه: `ef68b8194baf9bbe37c1e959efbd4ce88ffb1628`; مستند وضعیت در این دور تکمیل شد.
- وضعیت: `in_progress` — تست هدفمند روی commit `de1e879e4f332f92957dab01d188ded3feda8014` در Frontend checks موفق شد؛ اجرای CI برای commit جدید گزارش `dc5e3bb9a8dd48a094bd453aba189db9e86a4f49` هنوز در حال اجرا/صف است.
- محدودیت: این تست رفتار کنترلر را با fixture شبیه‌سازی‌شده بررسی می‌کند، نه مرورگر واقعی یا صفحه‌خوان. آزمون تعاملی کامل مرورگر و staging احراز هویت‌شده همچنان مسدود/در انتظار است.
- دامنه: فقط تست‌ها و مستندات فرانت‌اند؛ بک‌اند، Google Sheets و انتشار Apps Script تغییر نکردند.

## گام تکمیلی — آزمون واقعی Chromium

- افزوده شد: `tests/project-modal-accessibility.browser.cjs`؛ تست از تابع واقعی کنترلر استفاده می‌کند و در مرورگر Chromium واقعی، فوکوس اولیه، Tab/Shift+Tab، Escape، بازگشت فوکوس و اولویت پنجره بالایی را بررسی می‌کند.
- `.github/workflows/pms-ui-performance-audit.yml` پس از نصب Playwright این تست را اجرا می‌کند.
- Commit تست مرورگر: `c286b1a3da5d1804ba58c94ae607dcbbb552688b`.
- Commit اتصال تست به CI: `5aec2ad27450c80ec999799cbb2ceaf1f119c491`.
- وضعیت: `fixed_verified` برای رفتار کنترلر صفحه‌کلید در Chromium. تست مرورگر و همه بررسی‌های مرتبط موفق شدند؛ PR #93 در commit `e25d8f6cbc3e42232ab0fc2d20c38b9ceeabc87b` ادغام شد.



## نتیجه نهایی دور — دسترس‌پذیری صفحه‌کلید مودال‌های پروژه

- وضعیت: `fixed_verified` برای رفتار کنترلر صفحه‌کلید در مرورگر Chromium و آزمون‌های CI.
- PR #93 ادغام شد: https://github.com/Saeidesl/PRSPRO2/pull/93
- Commit ادغام: `e25d8f6cbc3e42232ab0fc2d20c38b9ceeabc87b`.
- شواهد: [Frontend checks](https://github.com/Saeidesl/PRSPRO2/actions/runs/40223671848) موفق؛ [PMS frontend agent suite](https://github.com/Saeidesl/PRSPRO2/actions/runs/40223671853) موفق؛ [PMS cross-repository QA](https://github.com/Saeidesl/PRSPRO2/actions/runs/40223671836) موفق؛ [ممیزی Chromium و UI](https://github.com/Saeidesl/PRSPRO2/actions/runs/40223671862) موفق. در job مرورگر، نصب Playwright، تست واقعی Chromium و ممیزی UI همگی موفق شدند.
- تست Chromium بررسی می‌کند: فوکوس اولیه، چرخش Tab و Shift+Tab، Escape، بازگشت فوکوس به عنصر بازکننده و بسته‌شدن فقط پنجره بالایی.
- محدوده اثبات: رفتار تابع مشترک در Chromium تأیید شده؛ آزمون کامل صفحه‌خوان و آزمون دستی در دستگاه موبایل جداگانه انجام نشده است.
- گزارش ممیزی عمومی همچنان `blocked-no-staging-api` است و فقط login/shell را بررسی کرده؛ بنابراین این دور، موفقیت سناریوی کامل PMS یا تعامل احراز هویت‌شده در تمام صفحات را اثبات نمی‌کند.
- بک‌اند، Google Sheets و Apps Script تغییر نکردند؛ انتشار نسخه جدید لازم نبود.
- گام بعدی: بررسی مورد بعدی قابل اصلاح از فهرست ممیزی؛ مشکل نبود staging برای سناریوهای نوشتنی به‌عنوان مانع محیطی باقی می‌ماند.


## معیار بستن دور
1. Frontend checks روی آخرین SHA موفق شود.
2. سایر بررسی‌های مرتبط بدون شکست باشند.
3. گزارش و وضعیت PR با SHA نهایی و شواهد واقعی به‌روز شود.
4. محدودیت آزمون مرورگر صریح بماند؛ آن را با تست شبیه‌سازی‌شده «رفع‌شده» اعلام نکنیم.

## گام بعدی
نتیجه workflowهای آخرین SHA را بررسی کن؛ اگر تست شکست خورد، علت را از لاگ مشخص و تست/اصلاح را تکرار کن. اگر همه بررسی‌های قابل اجرا موفق شدند، گزارش را به‌روز کن و فقط مواردی را ادغام کن که معیارهای پذیرش‌شان واقعاً اثبات شده‌اند. انتشار Apps Script برای این مورد لازم نیست.


## نتیجه نهایی دور دوم — بازخورد فوری فرم سفارش پروژه

- وضعیت: `fixed_verified` برای نمایش فوری فرم سفارش پروژه و حالت انتظار lookup.
- PR #94 ادغام شد: https://github.com/Saeidesl/PRSPRO2/pull/94
- Commit ادغام: `de18dc32764d1689faf5c8859889f7e7ce60bf2d`.
- تست‌ها: [Frontend checks](https://github.com/Saeidesl/PRSPRO2/actions/runs/40224303088) موفق؛ [PMS frontend agent suite](https://github.com/Saeidesl/PRSPRO2/actions/runs/40224303092) موفق؛ [PMS cross-repository QA](https://github.com/Saeidesl/PRSPRO2/actions/runs/40224303161) موفق؛ [ممیزی مرورگر و UI](https://github.com/Saeidesl/PRSPRO2/actions/runs/40224303127) موفق. تست Chromium دسترس‌پذیری نیز در این اجرا موفق شد.
- محدودیت: ممیزی UI در این اجرا به‌دلیل نبود staging احراز هویت‌شده فقط shell/login را بررسی می‌کند؛ سناریوی واقعی ثبت سفارش ارسال نشده است.
- دامنه: فرانت‌اند و تست‌ها؛ بک‌اند، Google Sheets و Apps Script تغییر نکردند.

## دور بعدی — بازخورد فوری فرم ثبت دریافت انبار

- یافته: `openReceiptForm` در `js/modules/procurement.js` نیز پیش از ساخت فرم، `await loadProjectsForOrder()` را اجرا می‌کند. در نتیجه کاربر هنگام lookup هیچ فرم/حالت انتظار نمی‌بیند.
- وضعیت اولیه: `in_progress`; این مورد جدا از اصلاح فرم سفارش پروژه است، چون فرم دریافت به فهرست پروژه‌ها و سفارش‌های قابل دریافت وابسته است.
- معیار پذیرش: فرم دریافت باید فوری ظاهر شود؛ فهرست پروژه/سفارش تا زمان دریافت، غیرفعال و دارای متن انتظار باشد؛ ثبت دریافت تا آماده‌شدن فهرست غیرفعال بماند؛ خطای lookup پیام قابل فهم بدهد و داده‌ای ارسال نشود.
