import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
async function serve(page: Page) {
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.route('https://wardrobe.test/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname,
      rel = pathname.replace(/^\/Gardirobum\//, '') || 'index.html',
      file = path.join(process.cwd(), 'dist', rel);
    const mime: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    try {
      await route.fulfill({
        body: await fs.readFile(file),
        contentType: mime[path.extname(file)],
      });
    } catch {
      await route.fulfill({ status: 404, body: 'Not found' });
    }
  });
  await page.goto('https://wardrobe.test/Gardirobum/');
  await expect(
    page.getByRole('heading', { name: 'Ne giyiyoruz bugün?' }),
  ).toBeVisible();
}
async function stored(page: Page) {
  return page.evaluate(
    () =>
      new Promise<any>((resolve, reject) => {
        const r = indexedDB.open('gardirobum-react-v2', 1);
        r.onsuccess = () => {
          const g = r.result
            .transaction('wardrobe', 'readonly')
            .objectStore('wardrobe')
            .get('state');
          g.onsuccess = () => resolve(g.result);
          g.onerror = () => reject(g.error);
        };
      }),
  );
}
test.beforeEach(async ({ page }) => {
  await serve(page);
});
test('askı merkezde açılır ve kıyafet aynı salınma grubundadır', async ({
  page,
}) => {
  const rack = page.getByTestId('rack-demo-shirt');
  await expect(rack).toBeVisible();
  await page.waitForTimeout(300);
  const rail = await page.locator('.chrome-rail').boundingBox(),
    box = await rack.locator('..').boundingBox();
  expect(
    Math.abs(box!.x + box!.width / 2 - (rail!.x + rail!.width / 2)),
  ).toBeLessThan(2);
  expect(await rack.locator('.hanger-svg').count()).toBe(1);
  expect(await rack.locator('.hanging-garment').count()).toBe(1);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await rack.hover();
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});
test('siyah tişört tam olarak siyah görseli seçer; beyaz tişörtü kaldırır', async ({
  page,
}) => {
  await page.getByRole('button', { name: /^Üstler/ }).click();
  const rack = page.getByTestId('rack-demo-black');
  await rack.click();
  await expect(page.getByTestId('selected-demo-black')).toBeVisible();
  await expect(page.getByTestId('selected-demo-white')).toHaveCount(0);
  const src = await rack.locator('img').getAttribute('src');
  expect(
    await page
      .getByTestId('selected-demo-black')
      .locator('img')
      .getAttribute('src'),
  ).toBe(src);
  const average = await page.evaluate(async (src) => {
    const image = new Image();
    image.src = src!;
    await image.decode();
    const c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let sum = 0,
      count = 0;
    for (let i = 0; i < data.length; i += 4)
      if (data[i + 3] > 220) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        count++;
      }
    return sum / count;
  }, src);
  expect(average).toBeLessThan(80);
  const state = await stored(page);
  expect(state.selected).toContain('demo-black');
});
test('parça kaydı ve özel seçim menüsü yenilemeden sonra korunur', async ({
  page,
}) => {
  await page.getByTestId('selected-demo-white').locator('.outfit-main').click();
  await page
    .getByLabel('Parça Adı', { exact: true })
    .fill('Beyaz Tişört Güncellendi');
  await page.getByRole('combobox', { name: 'Kalıp', exact: true }).click();
  await page
    .getByRole('option', { name: 'Bol / Oversize', exact: true })
    .click();
  expect(await page.locator('select:visible').count()).toBe(0);
  await page
    .getByRole('button', { name: 'Parçayı Kaydet', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('selected-demo-white')).toContainText(
    'Beyaz Tişört Güncellendi',
  );
  expect(
    (await stored(page)).items.find((i: any) => i.id === 'demo-white').fit,
  ).toBe('oversize');
});
test('kayıt hatasında başarı göstermez ve düzenlenen bilgiyi kaybetmez', async ({
  page,
}) => {
  await page.getByTestId('selected-demo-white').locator('.outfit-main').click();
  await page
    .getByLabel('Parça Adı', { exact: true })
    .fill('Kaydedilmemiş Değişiklik');
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException('Test quota failure', 'QuotaExceededError');
    };
  });
  await page
    .getByRole('button', { name: 'Parçayı Kaydet', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Kayıt tamamlanmadı');
  await expect(page.getByLabel('Parça Adı', { exact: true })).toHaveValue(
    'Kaydedilmemiş Değişiklik',
  );
  expect((await stored(page)).items[0].name).toBe('Beyaz Tişört');
});
test('kombin adı, parça seçimi ve açılma durumu kalıcıdır', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Kombini Kaydet', exact: true })
    .click();
  await page.getByLabel('Kombin Adı', { exact: true }).fill('Günlük Kombin');
  await page.locator('#save-outfit').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Günlük Kombin', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Temizle', exact: true }).click();
  await expect(page.getByTestId('selected-demo-white')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Günlük Kombin', exact: true })
    .click();
  await expect(page.getByTestId('selected-demo-white')).toBeVisible();
});
test('akıllı saat, ayrı kordon fotoğrafı ve seçenek kaydedilir', async ({
  page,
}) => {
  const white = await page
    .getByTestId('selected-demo-white')
    .locator('img')
    .getAttribute('src');
  const black = await page
    .getByTestId('rack-demo-black')
    .locator('img')
    .getAttribute('src');
  await page.getByRole('button', { name: 'Parça Ekle', exact: true }).click();
  await page.getByLabel('Parça Adı', { exact: true }).fill('Akıllı Saatim');
  await page.getByRole('combobox', { name: 'Parça Türü', exact: true }).click();
  await page.getByRole('option', { name: 'Akıllı Saat', exact: true }).click();
  await page.getByRole('tab', { name: 'Fotoğraflar', exact: true }).click();
  await page.getByLabel('Ön Görünüm', { exact: true }).setInputFiles({
    name: 'watch.png',
    mimeType: 'image/png',
    buffer: Buffer.from(white!.split(',')[1], 'base64'),
  });
  await page
    .getByRole('tab', { name: 'Saat & Kordonlar', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Kordon / Saat Seçeneği Ekle', exact: true })
    .click();
  await page.getByLabel('Kordon Adı 1', { exact: true }).fill('Siyah Kordon');
  await page.getByLabel('Siyah Kordon', { exact: true }).setInputFiles({
    name: 'strap.png',
    mimeType: 'image/png',
    buffer: Buffer.from(black!.split(',')[1], 'base64'),
  });
  await page
    .locator('.variant-options')
    .getByRole('button', { name: 'Siyah Kordon', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Parçayı Kaydet', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  const value = await stored(page),
    watch = value.items.find((i: any) => i.name === 'Akıllı Saatim');
  expect(watch.kind).toBe('smartwatch');
  expect(watch.activeVariant).toBe(watch.variants[0].id);
  expect(watch.variants[0].image.src).toBe(black);
});
test('fotoğraftaki omuz noktası sürüklenip kalıcı kaydedilir', async ({
  page,
}) => {
  const photo = await page
    .locator('.person-frame svg>image')
    .first()
    .getAttribute('href');
  await page
    .getByRole('button', { name: 'Fotoğrafımı Ekle', exact: true })
    .click();
  await page
    .getByLabel('Tam Boy Fotoğrafını Ekle', { exact: true })
    .setInputFiles({
      name: 'person.png',
      mimeType: 'image/png',
      buffer: Buffer.from(photo!.split(',')[1], 'base64'),
    });
  const point = page.locator('[data-anchor=shoulderLeft]'),
    box = await point.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + 20,
    box!.y + box!.height / 2 + 10,
    { steps: 5 },
  );
  await page.mouse.up();
  await page
    .getByRole('button', { name: 'Fotoğrafı Ve Noktaları Kaydet', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const value = await stored(page);
  expect(value.person.photo.src).toBe(photo);
  expect(value.person.anchors.shoulderLeft.x).toBeGreaterThan(0.16);
  await page.reload();
  const after = await stored(page);
  expect(after.person.anchors.shoulderLeft).toEqual(
    value.person.anchors.shoulderLeft,
  );
});
test('geçersiz yedek mevcut gardırobu değiştirmez ve yerel uyarı açmaz', async ({
  page,
}) => {
  let nativeDialogs = 0;
  page.on('dialog', async (d) => {
    nativeDialogs++;
    await d.dismiss();
  });
  await page.getByRole('button', { name: 'Yedekleme Ve Aktarım' }).click();
  await page.getByLabel('Gardırop Yedeği').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":1}'),
  });
  await expect(page.getByRole('alert')).toContainText(
    'Geçerli bir gardırop yedeği değil',
  );
  expect((await stored(page)).items).toHaveLength(7);
  expect(nativeDialogs).toBe(0);
});
test('mobil görünüm taşmaz; kaydırma parçayı değiştirir ve yanlışlıkla giydirmez', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const before = (await stored(page)).selected;
  const caption = await page.locator('.rack-selection h2').textContent();
  const area = await page.locator('.rack-stage').boundingBox(),
    client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: area!.x + area!.width * 0.75, y: area!.y + 160 }],
  });
  for (let i = 1; i <= 5; i++)
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: area!.x + area!.width * 0.75 - i * 25, y: area!.y + 160 },
      ],
    });
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await page.waitForTimeout(300);
  expect(await page.locator('.rack-selection h2').textContent()).not.toBe(
    caption,
  );
  expect((await stored(page)).selected).toEqual(before);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});
