# Gardırobum

[Canlı site](https://dgdfurkan.github.io/Gardirobum/). Furkan'ın kişisel gardırobu. React + TypeScript + Vite ile hazırlanmış, mobil ve masaüstünde çalışan bir uygulama.

## Çalıştırma

Node.js 22 veya üzeri:

```bash
npm ci
npm run dev
```

Geliştirme adresi: `http://localhost:5173/Gardirobum/`.

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

## Bu sürümde

- Metal askı demiri; askıyı içeren ayrı ön ve gerçek yan profil görselleri. Kancadan sabitlenen yumuşak dönüş, hafif salınma ve yakınlığa göre açılma. Telefonda doğal yatay kaydırma.
- Parçaya tıklayınca sahne içi detay görünümü: bulanık arka plan, büyük ürün görseli, parça bilgileri ve giyme düğmesi. Ayakkabı ve aksesuarlar ayrı rafta.
- Askı fotoğrafları, kanca noktaları ve boyutları düzenlenebilir. Askılı görsel ile askısız giydirme görseli ayrı saklanır.
- Görseller doğrudan parça kimliğine bağlı. Siyah ve beyaz tişört farklı görsel varlıklarıdır.
- Üst, gömlek, mont/kaban/ceket, alt, ayakkabı ve konuma göre aksesuar katmanları.
- Fotoğrafta sürüklenebilen 22 vücut noktası ve kıyafete ait kaynak noktaları. Noktalar fotoğrafın gerçek en/boy oranında kaydedilir.
- Kalıp, uzunluk, yaka, kol, beden, parça ölçüleri, notlar, içeri sokma, açık/kapalı/yarı kapalı görünüm.
- Ön, arka ve yan fotoğraflar; açık ve yarı kapalı gömlek için ayrı görseller.
- Saat ve akıllı saatler; her kordon veya saat seçeneğinin kendi fotoğrafı ve ayrı bilek konumu.
- Rastgele kombinler, adlandırılmış kombin kaydı ve geri yükleme.
- Uygulamaya ait seçim menüleri, kaydırıcılar ve onay pencereleri. Görünür yerel `<select>`, `alert` veya `confirm` kullanılmaz.
- IndexedDB'ye tamamlanan işlem sonrası kayıt; başarısız kayıt başarı olarak gösterilmez.
- JSON yedekleme/geri yükleme ve gerçekçi deneme için PNG fotoğraflar, kalibrasyon, parça bilgileri ve prompt içeren ZIP dışa aktarımı.

## Görsel kalite ve sınırlar

Askı, bu projeye özel üretilen ayrı ön/yan şeffaf ürün fotoğrafları arasında akıcı geçiş yapar. İki görünümün kanca noktaları aynı demire oturur; kıyafet ve askı birlikte salınır. Bu, referanstaki 2D ürün sahnesi yaklaşımıdır; 3D kumaş simülasyonu değildir. Kullanıcının parçası için askıyı içeren ön ve gerçek yan fotoğraf gerekir. Askı fotoğrafları hazırlanmamış parça yalnızca mevcut ön fotoğrafıyla gösterilir. [Görsel üretim promptları](docs/ASSET_PROMPTS.md).

Aynadaki anlık önizleme, işaretlenen noktalara göre 2D görsel yerleşimidir. Fiziksel beden uyumu ve gerçek kumaş davranışını ölçmez. Açık/yarı kapalı önizleme için o durumun fotoğrafı gerekir; eksik görselde ana fotoğraf korunur. İçeri sokma etek yerleşimini değiştirir; yeni kıvrım üretmez.

Otomatik gerçekçi görüntü üretimi için henüz bir AI servisi bağlanmadı. Uygulama kombine özel ZIP ve prompt hazırlar; üretilen sonucu aynı kombin için içe aktarabilir. Sonuç başka bir kombin seçildiğinde otomatik gizlenir. API entegrasyonu sunucu üzerinden yapılmalı; API anahtarı tarayıcı koduna yazılmamalı.

Fotoğraflar ve gardırop kayıtları kullandığın tarayıcıda tutulur. Telefon ile bilgisayar arasında otomatik eşitleme yoktur; JSON yedeği kullanılabilir. Tarayıcı verisi silinirse yedeksiz kayıt kaybolur. Uygulamaya eklenen kendi fotoğrafların GitHub'a gönderilmez. Repoda örnek kıyafetler, askılı ön/yan WebP görselleri ve örnek manken bulunur. Kullanıcının fotoğrafları tarayıcıda kalır.

## GitHub Pages

Repo ayarlarında **Settings → Pages → Build and deployment → Source: GitHub Actions** seç.

Ardından **Actions → Kontrol ve Pages → Run workflow** çalıştır. Sonraki `main` güncellemeleri testlerden geçince otomatik yayımlanır. Pages etkin değilken yalnızca kontroller çalışır; yayın adımı atlanır.

Varsayılan yol `/Gardirobum/`. Başka repo veya kök alan adı için `VITE_BASE` değiştirilebilir. Bu proje Sites'e veya başka bir hosting servisine bağlı değildir.

## Performans

Askı animasyonu yalnız görünür sahneyi `requestAnimationFrame` ile günceller; imleç hareketi aynayı veya kayıt durumunu yeniden çizmez. Sekme gizlenince, sahne ekran dışına çıkınca veya detay açılınca animasyon durur. Hareketi azalt tercihi ve klavye gezintisi desteklenir. Düzenleyiciler ile ZIP modülü ihtiyaç anında yüklenir; yazı tipleri yerel dosyalardır. Örnekler WebP olarak sunulur; eski atlas açılışta indirilmez. [Teknik kontroller](docs/PERFORMANCE.md).

## Geliştirme

[Mimari ve görev paylaşımı](docs/ARCHITECTURE.md), [fotoğraf hazırlama](docs/PHOTOS.md) ve [Codex/Opus promptları](docs/PROMPTS.md).

Kaynak kodu `src/`; birim testleri `tests/model.test.ts`; üretim derlemesine karşı çalışan tarayıcı testleri `tests/browser/`. Tarayıcı testleri dosyaları yerel HTTPS test kökeninden sunar; uygulamanın kendisi veya veri katmanı taklit edilmez.
