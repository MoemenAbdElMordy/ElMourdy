# Arabic RTL Educational Frontend


## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Lucide icons
- Vitest + Testing Library

## Commands

```bash
npm install
npm run dev
npm run build
npm run test
npm run check
```

## Architecture

- `src/app`: تشغيل التطبيق، routing، الصلاحيات والـproviders.
- `src/features`: نطاقات الطالب وولي الأمر والإدارة والتسجيل.
- `src/pages`: صفحات الـroutes.
- `src/shared`: مكوّنات UI والأدوات المشتركة.
- `src/data`: بيانات mock وعقود طبقة البيانات.
- `src/styles`: design tokens والأنماط العامة.

تتم مقارنة الشاشات بملف Figma أثناء التطوير فقط، بينما تظل بنية المشروع ومنطقه مستقلين تمامًا عن Figma Make.

`npm run check` هو بوابة الجودة النهائية ويشغّل TypeScript وESLint والاختبارات ثم production build.

الخط Cairo مستضاف محليًا داخل `src/assets/fonts`، ولا يعتمد العرض على Google Fonts وقت التشغيل.
