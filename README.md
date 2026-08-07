# Etsy → Vela Aracı v2 — Foto yükleme artık sunucu tarafında

Bu sürümde tek değişen şey: düzenlenen fotoğrafların linke dönüştürülmesi artık **senin tarayıcından değil, Netlify'ın kendi sunucusundan** yapılıyor (`netlify/functions/upload-image.js`). Bu yüzden tarayıcı/ağ/CORS engelleri artık sorun olmuyor.

**Önemli:** Bu sürüm, sürükle-bırak (Netlify Drop) ile ÇALIŞMAZ — çünkü Netlify Drop, `netlify/functions` klasörünü işlemiyor. Bunun yerine GitHub üzerinden bağlamamız lazım (tek seferlik bir kurulum, sonrasında her güncellemede yine sürükle-bırak kullanabileceğin bir "Production deploys" ekranı olacak, ama bu klasörün tamamıyla).

## 1) GitHub'a yükle
1. github.com → sağ üstten yeni hesap aç ya da giriş yap.
2. **"+"** → **"New repository"** → bir isim ver (örn. `etsy-vela-tool`) → **"Create repository"**.
3. Repo sayfasında **"Add file" → "Upload files"** butonuna bas.
4. Bu klasörün İÇİNDEKİ TÜM DOSYA VE KLASÖRLERİ (netlify.toml, package.json, public/, netlify/ — hepsini birden) sürükleyip bırak. Modern GitHub, klasör yapısını olduğu gibi koruyarak yükler.
5. Altta **"Commit changes"** de.

## 2) Netlify'a bağla
1. app.netlify.com → **"Add new site" → "Import an existing project"**.
2. **"Deploy with GitHub"** seç, izin ver, az önce oluşturduğun repoyu seç.
3. Netlify `netlify.toml`'ı otomatik okuyacak (publish=public, functions=netlify/functions) — hiçbir ayarı değiştirmeden **"Deploy site"** de.

## 3) ImgBB anahtarını (opsiyonel) ekle
Bu adım **zorunlu değil** — anahtar girmezsen sistem otomatik olarak catbox.moe kullanır (ücretsiz, kayıtsız). Daha "markalı" bir link istiyorsan:
1. Site oluştuktan sonra: **Site settings → Environment variables → "Add a variable"**.
2. Key: `IMGBB_API_KEY`, Value: (ImgBB anahtarın).
3. Kaydettikten sonra **Deploys** sekmesinden **"Trigger deploy" → "Deploy site"** ile yeniden yayınla.

## 4) Kullan
Netlify'ın verdiği linki aç. "Ayarlar & AI" sekmesinde artık sadece Gemini anahtarını gireceksin (o da tarayıcıda kalıcı olarak saklanıyor). "🔎 Yükleme fonksiyonunu test et" butonuyla foto yüklemenin çalıştığını hemen doğrulayabilirsin.

## Güncelleme yapmak istersen
`public/index.html` ya da `netlify/functions/upload-image.js` içinde değişiklik olursa:
1. GitHub'daki dosyayı aç → kalem/edit ikonuna bas → değişikliği yapıştır → "Commit changes".
2. Netlify birkaç saniye içinde otomatik olarak yeniden deploy eder (GitHub'a bağlı olduğu için elle bir şey yapmana gerek yok).

## Sorun giderme
- **"Yükleme fonksiyonunu test et" hata veriyor** → Netlify'daki **Functions** sekmesine bak, `upload-image` fonksiyonu listede görünüyor mu kontrol et. Görünmüyorsa deploy'un netlify.toml'ı doğru okumadığı anlamına gelir — repo kök dizininde `netlify.toml`, `netlify/functions/upload-image.js` ve `public/index.html` dosyalarının tam bu yollarda olduğundan emin ol.
- **Gemini anahtarı her seferinde sıfırlanıyor** → Bu artık olmamalı (localStorage'da saklanıyor); olursa tarayıcının "üçüncü taraf çerez/depolama" ayarlarını kontrol et.
