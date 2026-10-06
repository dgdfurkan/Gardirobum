# Mimari

## Modüller

| Dosya                              | Sorumluluk                                                                |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `src/App.tsx`                      | Ekran durumu, sıralı kayıt işlemleri, kombinler ve aktarım                |
| `src/components/Rack.tsx`          | Demir, askı, perspektif dönüş, dokunma ve kaydırma                        |
| `src/components/Mirror.tsx`        | Katman sırası, kalibrasyonla yerleşim, içe aktarılan sonuç                |
| `src/components/Calibration.tsx`   | Gerçek fotoğraf koordinatları üzerinde sürükleme ve klavye ile işaretleme |
| `src/components/GarmentEditor.tsx` | Parça bilgileri, fotoğraflar, saat/kordon seçenekleri                     |
| `src/components/PersonEditor.tsx`  | Kişi fotoğrafı ve vücut noktaları                                         |
| `src/components/ui.tsx`            | Radix tabanlı özel menüler, modal ve kaydırıcılar                         |
| `src/lib/model.ts`                 | Kimlik, seçim yuvaları, kombin anlık görüntüsü, doğrulama                 |
| `src/lib/warp.ts`                  | Delaunay ağı ve üçgenler için affine dönüşüm                              |
| `src/lib/storage.ts`               | IndexedDB işlemleri; yalnız `transaction.oncomplete` sonrası başarı       |
| `src/lib/export.ts`                | Fotoğraf/prompt ZIP paketi                                                |
| `src/lib/assets.ts`                | Örnek atlasın ayrı görsellere açılması ve fotoğraf okuma                  |

## Veri sözleşmesi

`Wardrobe.version = 2`. Parçalar değişmez `id` ile bulunur; dizi sırası görsel kimliği olarak kullanılmaz. Her fotoğraf kendi `src`, `width`, `height` değerlerini taşır. Kaynak ve hedef noktalar 0–1 aralığında normalize edilir. Sol/sağ etiketleri fotoğrafta görünen yöne göredir.

Üst, gömlek ve dış giyim ayrı seçim yuvalarıdır. Aksesuarlar konumlarına göre yuvalanır; aynı bilekteki saat değişir, diğer bilekteki korunur. Kombin kaydı seçili kimliklerle beraber açıklık, içeri sokma ve aktif kordonu saklar. Parça silinince kombinlerin referansları temizlenir.

Değişiklikler önce kopyalanır, doğrulanır ve IndexedDB'ye yazılır. Kalıcı işlem tamamlandığında görünür durum değiştirilir. Kullanıcıya kayıt tamamlanmadan başarı mesajı verilmez. Yedek yüklemede mevcut gardırop uygulama içi onaydan sonra değiştirilir.

## Sonraki geliştirme

1. Furkan'ın kişi ve kıyafet fotoğraflarıyla kaynak/hedef noktaları birlikte kalibre et. Referans ekran görüntüsüyle askı aralığı, perspektif ve ışığı karşılaştır.
2. Arka plan temizleme ve varlık hazırlama işini görsel işleme aşamasında yap. Sadece dosyayı PNG olarak kaydetmek arka planı kaldırmaz.
3. İstenirse gerçekçi deneme servisini ayrı sunucu uç noktasına bağla. Görev kimliği, bekleme, başarısızlık, yeniden deneme ve sonuç/parça eşleştirmesi ekle. Servis anahtarını istemciye koyma.
4. İstenirse oturum, özel medya depolama ve cihazlar arası eşitleme ekle. Mevcut yerel veri için göç ve yedek koruması tasarla.
5. Gerçek hacimli dönüş gerekirse çok açılı çekim veya 3D varlık gerekir. Tek ön fotoğrafından kusursuz yan yüzey ve kumaş simülasyonu varsayma.

## Birlikte geliştirme

Codex ve Opus aynı repoyu klonlayabilir. Aynı dosyada eşzamanlı değişiklik yerine ayrı branch kullan; küçük PR'larla birleştir. `model.ts` ve `types.ts` sözleşmesini değiştiren PR'a veri göçü ekle. Her değişiklikte ilgili testleri çalıştır; seçim/kayıt/kalibrasyon hatası varsa önce regresyon senaryosunu koru.
