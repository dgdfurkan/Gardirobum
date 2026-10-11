# Askı görselleri

Bu projeye özel örnekler built-in Imagegen ile ayrı ayrı üretildi. Referans sitenin görselleri alınmadı. Nihai şeffaf WebP dosyaları `public/assets/rack/` içindedir; askısız giydirme görselleri `public/assets/tryon/` içinde ayrı tutulur. Kanca koordinatları ve görüntü ölçüleri `src/lib/demo-assets.json` dosyasında yer alır. Örnekler kullanıcının gerçek kıyafet fotoğrafları değildir.

Ön ve yan görselin kanca noktaları sahnede aynı konuma oturur. Kumaş ile askı tek görüntüdür; birlikte hareket ederler. Görüntülerin şeffaf kanalı korunarak web boyutuna indirildi ve WebP olarak kodlandı. Gerçek kıyafetler için bu tarif sadece görsel hazırlama referansıdır; renk, dikiş, logo ve kalıp gerçek fotoğrafa sadık kalmalıdır.

## white-front

Use case: product-mockup. Asset type: production transparent wardrobe app sprite, ONE garment, FRONT VIEW. Create an extremely photorealistic premium plain ivory white heavyweight cotton crewneck short-sleeve T-shirt hanging naturally on a beautiful light oak triangular clothing hanger with a thin chrome silver hook. Straight-on perfectly frontal symmetrical catalog view, fabric has lifelike weight, subtle seams, natural small folds, hem hangs straight, both sleeves visible. No logo, no text, no human, no mannequin, no rod, no floor or cast background shadow. Actual transparent background, preserve delicate silver hook edges. Portrait canvas 1024x1536. Garment and hanger together centered; top of chrome hook at x50%, y5%; bottom of hook at y15%; oak hanger shoulders centered y25%; white shirt hem at y88%, full silhouette width about75% canvas. Neutral soft studio light from upper left, gentle natural dark shading inside collar and sleeves. Entire object isolated with generous transparent margins. This will crossfade to a separate exact right-side view with its hook staying fixed. Single image, not a collage.

## white-side

Use case: product-mockup. Reference image shows the SAME white cotton T-shirt on oak hanger. Create a NEW exact 90-degree RIGHT SIDE PROFILE product photograph of this same garment AND hanger. True photographic side view, NOT a thin squashed frontal image: near sleeve folded naturally hanging downward, folded layered fabric has depth and subtle creases, small collar side edge, only narrow edge of oak hanger visible and its silver hook seen from the side. Full shirt length identical, hook top at 6% height x50%, hem at91%, canvas1024x1536. Shirt side silhouette around18–23% canvas width, realistic volume like densely hung clothes in a boutique. Single isolated garment, physically plausible shoulder suspended on hanger, soft upper-left studio lighting. Actual transparent background with alpha ZERO outside the object, NO glow, NO haze, NO vignette, NO background, NO text/logos/rod. Preserve white color and entire full hook, generous transparent margins.

## black-front

Use case: precise-object-edit. Edit target image1. Change ONLY white shirt fabric to rich matte jet black heavyweight cotton, preserve identical garment geometry, framing, length, wrinkles, seams, oak hanger and chrome hook color, alignment and lighting. Frontal premium product photo. Background must be genuinely transparent, clear any background glow or mist: alpha ZERO everywhere outside shirt and hanger, no halo or background shadow. No logo/text. Same portrait1024x1536. This is a black shirt, not gray or white.

## black-side

Use case: precise-object-edit. Edit target image1. Change ONLY white T-shirt fabric to rich matte jet black heavyweight cotton. Preserve exact TRUE SIDE PROFILE silhouette, same oak hanger narrow edge, full silver hook, camera, framing, geometry, wrinkles and lighting. Single identical side-view T-shirt, but jet black, not gray. Portrait1024x1536, genuinely transparent alpha-zero background outside the object. No halo/text/logo. Preserve the precise hook position for a wardrobe animation.

## shirt-front

Use case: product-mockup. Reference image1 only sets composition/hanger/light. Generate a DIFFERENT garment: photorealistic olive green long-sleeve Oxford button-down casual shirt, ALL buttons closed, with realistic cuff seams, chest pocket on viewer right, beautiful collar and subtly wrinkled cotton. Straight FRONT view on same light oak triangular hanger and chrome hook. Portrait1024x1536; hook apex centered x50% y6%, hanger shoulders y23%, hem y91%; full sleeve silhouette <=85%width. Exact isolated alpha cutout, background transparent, alpha ZERO beyond garment and hanger edges. Neutral soft studio light, no halo/fog/vignette/rod/person/logo/text. Entire hook and garment visible. Garment is olive green, clearly different from T-shirts.

## shirt-side

Use case: product-mockup. Reference image1 is the front view of this EXACT olive green Oxford long-sleeve button-down shirt on a light oak hanger. Produce its genuine 90-degree RIGHT SIDE PROFILE: a narrow volumetric folded shirt, nearer long sleeve hangs fully down, realistic cuff and fabric depth, small side of collar, front buttons closed, identical olive color and same light oak hanger viewed along its narrow side with full silver chrome hook. Do not squash a frontal photograph. Portrait1024x1536, hook apex x50% y5%; hem y92%; narrow garment width<=28% canvas. Alpha-zero transparent background outside crisp object edges, soft studio light, no halo, rod, logo/text/person.

## jeans-front

Use case: product-mockup. Reference1 sets ONLY lighting and framing. Single photorealistic pair of premium mid-blue denim jeans hanging by TWO silver clips at the waistband from a horizontal LIGHT OAK CLIP PANTS HANGER with thin silver chrome hook. Perfect FRONT view, both full-length legs naturally hang straight parallel; authentic denim weave, indigo wash seams, pockets and fly, natural folds, no brand. Portrait1024x1536. Hook apex x50% y5%, horizontal wood bar y17%, waistband y21%, hems y92%, jeans fullwidth50%. Entire hanger and jeans, isolated transparent background alpha ZERO beyond object, no halo/vignette/text/rod/person. No triangular hanger, the jeans are attached to clips on a wooden bar.

## jeans-side

Use case: product-mockup. Reference1 sets ONLY lighting/framing. Single pair of premium mid-blue denim jeans on a horizontal light oak CLIP PANTS HANGER and silver chrome hook. Genuine 90-degree RIGHT SIDE PROFILE: jeans' two long legs overlap in a narrow layered volumetric side view, full denim side seam visible, believable side pocket and wash texture, denim folds, waistband clamped with two clips to wooden bar which is now seen from its narrow end. Portrait1024x1536, hook apex x50% y5%, wood hanger y17%, waistband y21%, hems y92%, narrow jeans silhouette<=22% canvaswidth. All object centered, same upper-left soft studio light, alpha-zero transparent background outside object, no halo/rod/person/text/logo.

## chino-front

Use case: product-mockup. Reference1 sets ONLY lighting/framing. Photorealistic premium SAND BEIGE chino trousers suspended with TWO silver metal clips at waistband from a horizontal natural LIGHT OAK CLIP PANTS HANGER with full thin silver chrome hook. Exact FRONT view, full length straight legs, smooth subtly creased cotton twill, neat fly seam, realistic pockets and cuffs, no logos. Portrait1024x1536 hook apex centered x50% y5%, wood hanger horizontal bar y17%, waistband y21%, hems y92%, pants totalwidth50%. Actual transparent alpha-zero background outside object, no halo/fog/rod/person/text. Full hanger physically connected to pants, no triangular hanger.

## chino-side

Use case: product-mockup. Reference1 sets ONLY lighting/framing. Photorealistic premium SAND BEIGE chino trousers on a horizontal light oak clip pants hanger and silver chrome hook. Genuine 90-degree RIGHT SIDE PROFILE: both full-length legs overlap, slim volumetric cotton fabric layered, the long outseam and side pocket visible, natural gentle creases. Hanger bar seen from narrow end with believable silver clips supporting waistband. Portrait1024x1536 hook apex x50% y5%, wooden hanger y17%, waistband y21%, hems y92%, trousers silhouette<=22% canvaswidth. Entire object isolated, actual alpha-zero transparent background outside object, soft upper-left studio lighting, no halo/fog/rod/person/text/logo.
