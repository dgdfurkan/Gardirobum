# Görsel kalite ve performans kontrolü

11 Ekim 2026 üretim derlemesi. Referansın ayrı askılı ön/yan görseller, sabit kanca ve yakınlığa göre açılma yaklaşımı uygulandı; bu proje için 10 ayrı görsel üretildi. Kıyafet fotoğrafları referans siteden kopyalanmadı.

## Yükleme

| Ölçüm                      |        Önceki sürüm |            Bu sürüm |
| -------------------------- | ------------------: | ------------------: |
| Başlangıç JavaScript       |     yaklaşık 525 kB |           324,19 kB |
| Başlangıç JavaScript, gzip |     yaklaşık 173 kB |           105,02 kB |
| Harici yazı tipi isteği    |        Google Fonts |      0; yerel WOFF2 |
| Görsel kaynağı             | açılışta PNG atlası | ayrı WebP dosyaları |

Düzenleyiciler ve ZIP kodu gerektiğinde yüklenir. 10 askı, 8 askısız kıyafet/aksesuar ve 1 örnek manken WebP görselinin toplamı 936.864 bayttır. Yeni askı görselleri 768 × 1152 piksel ve gerçek alpha kanalı içerir.

## Kare ölçümü

Üretim dosyaları, 1440 × 1050 görünümde yerel HTTPS test kökeninden Chromium 143'e sunuldu. Askı görünürken 120 ardışık `requestAnimationFrame` aralığında medyan **16,7 ms**, yüzde 95 **16,8 ms** ölçüldü. Bu ortamda yaklaşık 60 kare/s akıcılık görüldü; farklı telefon veya ağ için aynı hız garantisi değildir. Referans siteyle aynı donanım/ağ üzerinde karşılaştırmalı benchmark yapılmadı.

Animasyon yalnız askı dönüş ve opacity değerlerini değiştirir. İmleç gezintisi sırasında aynanın DOM'unda değişiklik olmadığı tarayıcı testiyle doğrulandı. Sahne görünmezken, sekme arka plandayken ve detay görünümü açıkken döngü durur. Hareketi azalt tercihinde geçişler doğrudan uygulanır; klavye ile seçim çalışır.

## Kontroller

- 16 birim testi: parça kimliği, katmanlar, kombin/kordon kaydı, kaynak ağının tam görüntü kapsamı, eski kayıtlara askı göçü ve yedek doğrulama.
- 13 tarayıcı testi: askı kanca eşleşmesi, siyah/beyaz doğru görsel, kalıcı kayıt ve kayıt hatası, kendi kordon fotoğrafı, kişi kalibrasyonu, mobil taşma/kaydırma, detaydan dönüş, imleçte ayna kararlılığı, hareketi azalt tercihi ve yükleme sonrası yeniden deneme.
- 1440 px masaüstü ve 390 px mobil tam sayfa görsel kontrolü; kesilen etek ve odak dönüşünde kayan kanca düzeltildi.
- TypeScript üretim derlemesi ve Prettier biçim kontrolü.

Anlık ayna, fotoğrafları noktalara göre yerleştirir. Gerçekçi AI görüntü üretimi için sunucu servisi henüz bağlı değildir; fotoğraf/prompt paketi ve sonuç içe aktarma hazırdır.
