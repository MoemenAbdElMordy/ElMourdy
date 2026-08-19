import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = "https://mourdy.com";
const outputDirectory = resolve("dist");
const template = await readFile(resolve(outputDirectory, "index.html"), "utf8");

const pages = [
  {
    path: "/",
    title: "منصة المرضي | اللغة العربية للمرحلة الثانوية",
    description: "منصة الأستاذ محمود عبدالمرضي لتعليم اللغة العربية لطلاب المرحلة الثانوية من خلال شرح منظم، محاضرات مسجلة، اختبارات تفاعلية، ومتابعة مستمرة للتقدم.",
    imageAlt: "منصة المرضي لتعليم اللغة العربية للمرحلة الثانوية",
    content: `
      <main aria-label="منصة المرضي">
        <h1>منصة المرضي لتعليم اللغة العربية للمرحلة الثانوية</h1>
        <p>تعلّم اللغة العربية مع الأستاذ محمود عبدالمرضي من خلال محاضرات مسجلة واختبارات تفاعلية ومتابعة مستمرة لمستوى الطالب.</p>
        <h2>شرح منظم ومتابعة حقيقية للتقدم</h2>
        <p>تجمع المنصة المحاضرات والواجبات والاختبارات ونتائج الطالب في مكان واحد، مع لوحة متابعة مخصصة لولي الأمر.</p>
      </main>`,
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          url: `${siteUrl}/`,
          name: "منصة المرضي",
          description: "منصة لتعليم اللغة العربية لطلاب المرحلة الثانوية.",
          inLanguage: "ar-EG",
          publisher: { "@id": `${siteUrl}/#organization` },
        },
        {
          "@type": "EducationalOrganization",
          "@id": `${siteUrl}/#organization`,
          name: "منصة المرضي",
          url: `${siteUrl}/`,
          logo: `${siteUrl}/images/mourdy-logo.png`,
          founder: { "@id": `${siteUrl}/#teacher` },
          areaServed: { "@type": "Country", name: "مصر" },
        },
        {
          "@type": "Person",
          "@id": `${siteUrl}/#teacher`,
          name: "محمود عبدالمرضي",
          jobTitle: "مدرس لغة عربية للمرحلة الثانوية",
          image: `${siteUrl}/teacher-mahmoud-abdelmourdy.jpg`,
          worksFor: { "@id": `${siteUrl}/#organization` },
        },
      ],
    },
  },
  {
    path: "/about",
    title: "عن الأستاذ محمود عبدالمرضي | منصة المرضي",
    description: "تعرف على الأستاذ محمود عبدالمرضي ومنهج منصة المرضي في شرح اللغة العربية لطلاب المرحلة الثانوية ومتابعة تقدمهم.",
    imageAlt: "الأستاذ محمود عبدالمرضي ومنصة المرضي التعليمية",
    content: `
      <main aria-label="عن منصة المرضي">
        <h1>عن منصة المرضي والأستاذ محمود عبدالمرضي</h1>
        <p>منصة تعليمية متخصصة في شرح اللغة العربية لطلاب المرحلة الثانوية من خلال محاضرات منظمة واختبارات تفاعلية ومتابعة مستمرة.</p>
        <h2>تعليم اللغة العربية للمرحلة الثانوية</h2>
        <p>يقدم الأستاذ محمود عبدالمرضي شرحًا مبسطًا للنحو والصرف والبلاغة مع تطبيقات عملية تساعد الطالب على فهم المنهج وقياس تقدمه.</p>
        <h2>تجربة تعليمية للطالب وولي الأمر</h2>
        <p>يحصل الطالب على محتوى مرتب حسب السنة والصف والباب والدرس، بينما يستطيع ولي الأمر متابعة الحضور ونتائج الاختبارات والتقدم من حساب مستقل.</p>
        <nav aria-label="روابط مهمة"><a href="/">الرئيسية</a> <a href="/free-content">المحاضرات المجانية</a></nav>
      </main>`,
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "AboutPage",
          "@id": `${siteUrl}/about#page`,
          url: `${siteUrl}/about`,
          name: "عن الأستاذ محمود عبدالمرضي | منصة المرضي",
          description: "تعرف على الأستاذ محمود عبدالمرضي ومنهج منصة المرضي في تعليم اللغة العربية للمرحلة الثانوية.",
          inLanguage: "ar-EG",
          isPartOf: { "@id": `${siteUrl}/#website` },
          mainEntity: { "@id": `${siteUrl}/#teacher` },
        },
        {
          "@type": "Person",
          "@id": `${siteUrl}/#teacher`,
          name: "محمود عبدالمرضي",
          jobTitle: "مدرس لغة عربية للمرحلة الثانوية",
          worksFor: { "@id": `${siteUrl}/#organization` },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${siteUrl}/` },
            { "@type": "ListItem", position: 2, name: "عن المنصة", item: `${siteUrl}/about` },
          ],
        },
      ],
    },
  },
  {
    path: "/free-content",
    title: "محاضرات لغة عربية مجانية للثانوية | منصة المرضي",
    description: "شاهد محاضرات مجانية في اللغة العربية لطلاب المرحلة الثانوية مع الأستاذ محمود عبدالمرضي، وسجّل مجانًا لحفظ تقدم المشاهدة.",
    imageAlt: "محاضرات اللغة العربية المجانية على منصة المرضي",
    content: `
      <main aria-label="المحتوى المجاني">
        <h1>محاضرات لغة عربية مجانية للمرحلة الثانوية</h1>
        <p>شاهد محتوى مجانيًا في النحو والصرف والبلاغة مع الأستاذ محمود عبدالمرضي، وسجّل حساب طالب لحفظ تقدم المشاهدة.</p>
        <h2>محتوى تعليمي مجاني ومنظم</h2>
        <p>تظهر المحاضرات المجانية المنشورة حسب الصف والفرع، ويمكن للطالب البدء بالمشاهدة ومتابعة تقدمه من حسابه.</p>
        <h2>النحو والصرف والبلاغة للثانوية العامة</h2>
        <p>ابدأ بمحاضرات اللغة العربية المجانية، ثم أنشئ حسابًا لحفظ آخر موضع مشاهدة والعودة إلى المحاضرة من النقطة نفسها.</p>
        <nav aria-label="روابط مهمة"><a href="/">الرئيسية</a> <a href="/about">عن الأستاذ محمود عبدالمرضي</a></nav>
      </main>`,
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${siteUrl}/free-content#page`,
          url: `${siteUrl}/free-content`,
          name: "محاضرات لغة عربية مجانية للمرحلة الثانوية",
          description: "محاضرات مجانية في اللغة العربية لطلاب المرحلة الثانوية مع الأستاذ محمود عبدالمرضي.",
          inLanguage: "ar-EG",
          isPartOf: { "@id": `${siteUrl}/#website` },
          provider: { "@id": `${siteUrl}/#organization` },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${siteUrl}/` },
            { "@type": "ListItem", position: 2, name: "المحتوى المجاني", item: `${siteUrl}/free-content` },
          ],
        },
      ],
    },
  },
];

function replaceMeta(html, selector, value) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(
    new RegExp(`(<meta[^>]+${escapedSelector}[^>]+content=")[^"]*(")`, "i"),
    `$1${value}$2`,
  );
}

for (const page of pages) {
  const canonicalUrl = `${siteUrl}${page.path}`;
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${page.title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/i, `$1${canonicalUrl}$2`)
    .replace(
      /<script id="seo-structured-data" type="application\/ld\+json">.*?<\/script>/s,
      `<script id="seo-structured-data" type="application/ld+json">${JSON.stringify(page.structuredData)}</script>`,
    )
    .replace('<div id="root"></div>', `<div id="root">${page.content}</div>`);

  html = replaceMeta(html, 'name="description"', page.description);
  html = replaceMeta(html, 'property="og:title"', page.title);
  html = replaceMeta(html, 'property="og:description"', page.description);
  html = replaceMeta(html, 'property="og:url"', canonicalUrl);
  html = replaceMeta(html, 'property="og:image:alt"', page.imageAlt);
  html = replaceMeta(html, 'name="twitter:title"', page.title);
  html = replaceMeta(html, 'name="twitter:description"', page.description);
  html = replaceMeta(html, 'name="twitter:image:alt"', page.imageAlt);

  const pageDirectory = page.path === "/" ? outputDirectory : resolve(outputDirectory, page.path.slice(1));
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(resolve(pageDirectory, "index.html"), html, "utf8");
}
