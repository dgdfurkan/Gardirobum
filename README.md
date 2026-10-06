# Gardırobum

Furkan'ın kişisel gardırobu. React + TypeScript + Vite ile hazırlanmış, mobil ve masaüstünde çalışan bir uygulama.

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

- Metal askı demiri; ahşap askı ve kıyafet aynı hareket grubunda. Fareyle dönüş, telefonda yatay kaydırma; dokunarak kombin seçimi.
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

Askı görüntüsü fotoğrafları perspektifle döndürür; bu sürüm tam bir 3D kumaş modeli veya kumaş fiziği simülasyonu değildir. Gerçek yan görünüm için parçanın yan fotoğrafı eklenebilir. Örnek parçalar başlangıç görselleridir; referanstaki ışık ve açıya uygun kendi parça fotoğraflarıyla değiştirilecektir.

Aynadaki anlık önizleme, işaretlenen noktalara göre 2D görsel yerleşimidir. Fiziksel beden uyumu ve gerçek kumaş davranışını ölçmez. Açık/yarı kapalı önizleme için o durumun fotoğrafı gerekir; eksik görselde ana fotoğraf korunur. İçeri sokma etek yerleşimini değiştirir; yeni kıvrım üretmez.

Otomatik gerçekçi görüntü üretimi için henüz bir AI servisi bağlanmadı. Uygulama kombine özel ZIP ve prompt hazırlar; üretilen sonucu aynı kombin için içe aktarabilir. Sonuç başka bir kombin seçildiğinde otomatik gizlenir. API entegrasyonu sunucu üzerinden yapılmalı; API anahtarı tarayıcı koduna yazılmamalı.

Fotoğraflar ve gardırop kayıtları kullandığın tarayıcıda tutulur. Telefon ile bilgisayar arasında otomatik eşitleme yoktur; JSON yedeği kullanılabilir. Tarayıcı verisi silinirse yedeksiz kayıt kaybolur. Uygulamaya eklenen kendi fotoğrafların GitHub'a gönderilmez. Repodaki tek fotoğraf varlığı örnek kıyafet ve manken atlasıdır.

## GitHub Pages

Repo ayarlarında **Settings → Pages → Build and deployment → Source: GitHub Actions** seç.

Ardından **Actions → Kontrol ve Pages → Run workflow** çalıştır. Sonraki `main` güncellemeleri testlerden geçince otomatik yayımlanır. Pages etkin değilken yalnızca kontroller çalışır; yayın adımı atlanır.

Varsayılan yol `/Gardirobum/`. Başka repo veya kök alan adı için `VITE_BASE` değiştirilebilir. Bu proje Sites'e veya başka bir hosting servisine bağlı değildir.

## Geliştirme

[Mimari ve görev paylaşımı](docs/ARCHITECTURE.md), [fotoğraf hazırlama](docs/PHOTOS.md) ve [Codex/Opus promptları](docs/PROMPTS.md).

Kaynak kodu `src/`; birim testleri `tests/model.test.ts`; üretim derlemesine karşı çalışan tarayıcı testleri `tests/browser/`. Tarayıcı testleri dosyaları yerel HTTPS test kökeninden sunar; uygulamanın kendisi veya veri katmanı taklit edilmez.
