// One-off helper: captures each in-app screen in desktop + mobile viewports and
// composites them into a single "device mockup" image for the landing Gallery.
// Relies on the dev-only /screens/* routes in App.jsx.
// Usage: BASE_URL=http://localhost:5173 node scripts/screenshot-app.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "pictures", "app");

const screens = [
  { slug: "beranda", path: "/screens/beranda" },
  { slug: "arisan", path: "/screens/arisan" },
  { slug: "bayar", path: "/screens/bayar" },
  { slug: "patungan", path: "/screens/patungan" },
  { slug: "profil", path: "/screens/profil" },
];

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

async function capture(path, viewport, deviceScaleFactor) {
  const page = await browser.newPage({ viewport, deviceScaleFactor });
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const buf = await page.screenshot();
  await page.close();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

// Page used purely to render + screenshot the composition.
const composer = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});

for (const { slug, path } of screens) {
  const desktop = await capture(path, { width: 1440, height: 900 }, 2);
  const mobile = await capture(path, { width: 390, height: 844 }, 3);

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    #stage {
      width: 1600px; height: 1000px; position: relative;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #e9f9f1 0%, #f1ecfe 100%);
      font-family: system-ui, sans-serif;
    }
    .desktop {
      width: 1180px; border-radius: 16px; overflow: hidden;
      box-shadow: 0 30px 80px rgba(16,24,40,0.22);
      background: #fff; position: relative; left: -120px;
    }
    .bar {
      height: 34px; background: #f3f4f6; display: flex; align-items: center;
      gap: 8px; padding: 0 14px; border-bottom: 1px solid #e5e7eb;
    }
    .bar i { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
    .desktop img { display: block; width: 100%; }
    .phone {
      position: absolute; right: 90px; bottom: 70px;
      width: 290px; padding: 12px; background: #0b0b0f;
      border-radius: 40px; box-shadow: 0 28px 70px rgba(16,24,40,0.32);
    }
    .phone img { display: block; width: 100%; border-radius: 28px; }
  </style></head><body>
    <div id="stage">
      <div class="desktop">
        <div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
        <img src="${desktop}" />
      </div>
      <div class="phone"><img src="${mobile}" /></div>
    </div>
  </body></html>`;

  await composer.setContent(html, { waitUntil: "networkidle" });
  const file = join(OUT_DIR, `${slug}.png`);
  await composer.locator("#stage").screenshot({ path: file });
  console.log(`composited ${slug} -> ${file}`);
}

await composer.close();
await browser.close();
console.log("done");
