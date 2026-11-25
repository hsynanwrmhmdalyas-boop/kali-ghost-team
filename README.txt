تحديث ربط KALI COMMUNITY مع Firebase
=====================================

الملفات:
- firebase-bridge.js: يربط مفاتيح التخزين الفعلية في db.js مع Firestore.
- firestore.rules: قواعد بداية للاختبار فقط.
- index-csp-and-script-snippet.txt: التعديلات المطلوبة في index.html.

طريقة التركيب:
1) ارفع firebase-bridge.js إلى جذر مستودع GitHub نفسه الذي يحتوي index.html و db.js.
2) افتح index.html في GitHub واضغط Edit.
3) في وسم Content-Security-Policy الموجود داخل head، أضف:
   script-src 'self' 'unsafe-inline' https://www.gstatic.com;
   connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
   إلى محتوى السياسة، مع الإبقاء على بقية التوجيهات الحالية.
4) بعد سطر db.js مباشرة (السطر الذي يبدأ بـ <script src="db.js...) أضف:
   <script type="module" src="firebase-bridge.js"></script>
5) احفظ التعديل عبر Commit changes.
6) في Firebase Console > Firestore Database > Rules، انشر محتوى firestore.rules.
7) في Authentication > Sign-in method تأكد من تفعيل Anonymous.

تنبيه مهم:
قواعد firestore.rules تسمح لأي مستخدم مجهول مسجل بالدخول بقراءة وكتابة بيانات المجتمع كلها.
هي للاختبار الأولي فقط وليست حماية إنتاجية. لا تستخدمها لموقع عام قبل تصميم صلاحيات موثوقة
للإدارة والكتابة والحذف. كلمة مرور لوحة الإدارة الحالية تعمل داخل المتصفح ولا تمنح صلاحية
آمنة على خادم Firebase.

طريقة التحقق:
بعد رفع التعديلات افتح الموقع، ثم افتح أدوات المطور > Console.
ابحث عن:
[KALI Firebase] Connected to project: kali-community
ثم جرّب إنشاء منشور، وافتح Firestore Data وتحقق من ظهور/تحديث مستندات
kali_app_data/posts وkali_app_data/discussions وغيرها.

ملاحظة:
هذا الربط يحافظ على واجهة KALI_DB والتخزين المحلي الحالي. لا يرفع بيانات المستخدم الحالي
ولا إعدادات كلمة مرور الإدارة إلى Firestore.
