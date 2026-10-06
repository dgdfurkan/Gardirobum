# Codex / Opus çalışma promptları

Bu promptlar görevleri ayırmak içindir. Projeyi baştan yazmadan önce mevcut dosyaları ve testleri oku. Fotoğraflar eklenmeden bedene kusursuz oturma iddiasında bulunma.

## Proje devamı

> dgdfurkan/Gardirobum reposundaki React/TypeScript uygulamasını geliştir. Önce README.md, docs/ARCHITECTURE.md, src/lib/types.ts, model.ts ve mevcut testleri oku. Kararlı parça kimliğini, sıralı IndexedDB kayıtlarını, özel Radix arayüzlerini ve mobil kaydırmayı koru. Görünür native select, alert veya confirm kullanma. Görevin kapsamındaki dosyalar için ayrı branch oluştur; üretim derlemesini ve ilgili testleri çalıştır. Kişisel fotoğrafları kaynak koduna, API anahtarını tarayıcıya ekleme. Tamamlanan ve henüz uygulanmayan özellikleri ayrı belirt.

## Askı kalitesi

> Ekli referans video/ekran görüntüsüyle src/components/Rack.tsx ve styles.css görünümünü karşılaştır. Demir kancası fiziksel pivot olsun. Askı ve kıyafet aynı ebeveyn dönüşümünde sallansın; kanca demirden kopmasın. Omuzlar ahşap askıya otursun; pantolon klipslere bağlansın. Fareyle odak değişirken görünümü sürekli yeniden merkezleme. Telefonda kaydırma sonu tıklamayı bastır. Gerçek yan fotoğraf varsa onu kullan; tek ön fotoğrafla gerçek 3D yüzey üretildiğini söyleme. Masaüstü ve mobil ekran görüntülerini incele ve dokunma regresyonunu çalıştır.

## Fotoğraf varlığı hazırlama

> Ekli kıyafetin arka planını şeffaf yap, kenarlardaki renk saçılmalarını temizle ve yüksek çözünürlüklü PNG üret. Gerçek renk, desen, logo, dikiş, yırtık, yaka ve boy oranlarını koru. Yeni detay uydurma. Kıyafetin tamamı kadrajda kalsın. Ön/arka/yan/açık/yarı kapalı görünümleri ayrı dosyalarda, aynı ölçek ve tutarlı ışıkla hazırla. Eksik açı varsa çekim gereksinimini belirt.

## Kalibrasyon

> Ekli kişi fotoğrafında omuz, koltuk altı, dirsek, bilek, bel, kalça, diz ve ayak noktalarını fotoğraf piksel koordinatlarında işaretle; uygulamanın 0–1 normalizasyonuna dönüştür. Kıyafetin karşılık gelen kaynak noktalarını ayrıca doğrula. Fotoğrafın görünen en/boy oranı ile nokta alanı aynı olsun; letterbox boşluğunu koordinata katma. Kol örtüşmesi, uzun etek, bol kalıp ve pantolon paçasını önizlemede incele. Görsel yerleşimi fiziksel beden ölçümü olarak sunma.

## Gerçekçi deneme entegrasyonu

> Mevcut ZIP/prompt aktarımını koruyarak gerçekçi sanal giydirme servisi için ayrı sunucu katmanı tasarla. Önce sağlayıcının güncel resmi API belgelerini doğrula. İstemci seçili parçaların gerçek görsellerini, aktif kordon/açıklık durumunu ve kişi fotoğrafını gönderir. Sunucu görev kimliği döndürür; istemci bekleme, hata, yeniden deneme ve tamamlanma durumlarını gösterir. Başarı sonucu yalnız ilgili kişi+parça anlık görüntüsüne bağlansın. API anahtarı sunucu ortam değişkeninde olsun. Otomatik maliyetli çağrı veya kullanıcı fotoğrafı gönderimi başlamadan önce düğme akışını açıkça göster.

## Üretilen görsel için prompt

Uygulamadaki **Gerçekçi Deneme → Paketi İndir** her kombin için gerçek fotoğrafların dosya adlarını ve seçilen ayarları içeren `prompt.txt` hazırlar. Bu promptu kişi ve parça görselleriyle birlikte görsel üreten modele ver. Codex/Opus kod geliştirme işini yürütebilir; yalnız metin üretimi görsel giydirme sonucu oluşturmaz.
