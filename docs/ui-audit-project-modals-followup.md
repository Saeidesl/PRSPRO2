# Project modal accessibility follow-up

Date: 2026-10-25
Branch: `fix/project-modal-accessibility-20261025`
PR: #93

## Change
`js/modules/projects.js` now uses a shared keyboard handler for the project color/size and draft material-consumption dialogs. It supports Escape, traps Tab/Shift+Tab inside the active dialog, focuses the first control, restores focus to the opener, and ignores hidden/non-topmost dialogs.

A regression test was added at `tests/project-modal-accessibility.test.js`, and `frontend-check.yml` now runs it with Node's test runner.

## Validation status
The first frontend syntax/assets run passed. The new regression test is awaiting the workflow run triggered by the latest commit. Browser acceptance remains pending; this is not yet marked fully verified. The staging API is not configured, so authenticated end-to-end coverage remains blocked.

No backend, spreadsheet data, or Apps Script deployment was changed.

## دور بعدی — دسترس‌پذیری پنجره تنظیمات پروژه

- یافته: پنجره «تنظیمات» داخل فرم ایجاد/ویرایش پروژه فقط فوکوس اولیه را دستی جابه‌جا می‌کرد؛ کلید Escape و محدودکردن Tab/Shift+Tab به پنجره به‌صورت مشترک مدیریت نمی‌شد.
- اصلاح: از helper مشترک `bindProjectModalKeyboard` برای پنجره تنظیمات استفاده شد؛ هنگام بازشدن فوکوس به پنجره می‌رود، Escape/بستن پنجره فوکوس را به دکمه بازکننده برمی‌گرداند و هنگام حذف فرم اصلی listener پاک‌سازی می‌شود.
- تست رگرسیون: به `tests/project-modal-accessibility.test.js` افزوده شد تا اتصال helper، فوکوس اولیه و پاک‌سازی listener بررسی شود.
- وضعیت: تست منبعی قابل اجرا در CI؛ تست تعامل واقعی مرورگر و صفحه‌خوان همچنان لازم است، بنابراین این اصلاح هنوز `fixed_verified` محسوب نمی‌شود.


## دور بعدی — پنجره دلیل حذف فایل و نمایش تصویر پروژه

- یافته: دو پنجره دیگر در بخش پروژه‌ها (دلیل حذف پیوست و نمایش تصویر) فقط بخشی از رفتار صفحه‌کلید را داشتند و مدیریت مشترک فوکوس/بستن نداشتند.
- اصلاح: هر دو به کنترلر مشترک دسترس‌پذیری وصل شدند. در پنجره دلیل حذف، نتیجه ثبت‌شده (دلیل یا انصراف) حفظ می‌شود و بستن با Escape/پس‌زمینه به‌عنوان انصراف برمی‌گردد؛ پنجره تصویر نیز Escape را از مسیر مشترک مدیریت می‌کند.
- تست رگرسیون منبعی برای اتصال هر دو پنجره اضافه شد.
- وضعیت: اصلاح کد انجام شد؛ تست‌های CI جدید در حال اجرا هستند. چون مرورگر CI فقط موجودی/عملکرد صفحات را بررسی می‌کند و staging احراز هویت‌شده در دسترس نیست، تعامل واقعی هنوز باید جداگانه تأیید شود.


## دور بعدی — پنجره اصلی ایجاد/ویرایش پروژه

- یافته: فرم اصلی ایجاد/ویرایش پروژه هنوز به کنترلر مشترک وصل نبود؛ Escape داشت اما مدیریت Tab/Shift+Tab، فوکوس اولیه و بازگشت فوکوس یکپارچه نبود.
- اصلاح: کنترلر مشترک به پنجره اصلی متصل شد و پاک‌سازی آن هنگام حذف فرم تضمین شد؛ کنترل بستن نیز از مسیر یکسان عبور می‌کند و هنگام ذخیره‌سازی از بسته‌شدن ناخواسته جلوگیری می‌شود.
- تست رگرسیون منبعی برای اتصال پنجره اصلی اضافه شد.
- وضعیت: منتظر اجرای CI برای آخرین commit؛ هنوز تعامل واقعی مرورگر/موبایل تأیید نشده است.


## دور 8 — تبدیل تست دسترس‌پذیری از تطبیق متن به آزمون رفتار کنترلر

- یافته: تست‌های قبلی عمدتاً با عبارت‌های منظم، وجود کدها و اتصال کنترلر را بررسی می‌کردند؛ این تست‌ها به‌تنهایی ثابت نمی‌کردند که رویدادهای صفحه‌کلید واقعاً به جابه‌جایی فوکوس یا بستن پنجره منجر می‌شوند.
- اصلاح: در `tests/project-modal-accessibility.test.js` تست‌هایی اضافه شد که خود تابع `bindProjectModalKeyboard` را از منبع واقعی استخراج و با fixture کنترل‌شده اجرا می‌کنند. تست‌ها فوکوس اولیه، چرخش Tab و Shift+Tab، بستن با Escape، حذف listener و بی‌اثر بودن handler پنجره زیرین را بررسی می‌کنند. بررسی اتصال تمام مودال‌های هدف نیز حفظ شده است.
- محدودیت مهم: این تست‌ها آزمون رفتاری کنترلر با DOM شبیه‌سازی‌شده هستند، نه آزمون مرورگر واقعی؛ ظاهر موبایل، رفتار صفحه‌خوان و DOM کامل برنامه را اثبات نمی‌کنند.
- Commitهای این دور: `b513be6d7a04f724700f1bfd94af9e9bb837acee` و `de1e879e4f332f92957dab01d188ded3feda8014`.
- وضعیت فعلی: `in_progress` تا اجرای تست هدفمند و CI روی آخرین commit. فقط پس از نتیجه واقعی تست، وضعیت به‌روزرسانی می‌شود.
- دامنه تغییر: فقط تست فرانت‌اند و مستندات؛ هیچ کد بک‌اند، داده Google Sheets یا انتشار Apps Script تغییر نکرده است.


## نتیجه نهایی آزمون مرورگر — 2026-10-25

- PR #93 ادغام شد: https://github.com/Saeidesl/PRSPRO2/pull/93؛ commit ادغام `e25d8f6cbc3e42232ab0fc2d20c38b9ceeabc87b`.
- تست واقعی Chromium در workflow ممیزی موفق شد؛ همچنین Frontend checks، agent suite و cross-repository QA موفق شدند.
- تأییدشده: فوکوس اولیه، Tab/Shift+Tab، Escape، بازگشت فوکوس و اولویت مودال بالایی در کنترلر مشترک.
- محدودیت: این تست روی DOM مستقل با کنترلر واقعی اجرا می‌شود؛ آزمون صفحه‌خوان، دستگاه موبایل و جریان احراز هویت‌شده کل برنامه همچنان خارج از پوشش این تست است.
