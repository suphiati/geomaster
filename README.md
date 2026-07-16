# GeoMaster 🌍

**GeoMaster**, 245 ülkeyi kapsayan, içeriği tamamen **çevrimdışı** çalışan eğitici bir
coğrafya bilgi ve quiz oyunudur. Bayraklar, başkentler, nüfuslar, para birimleri, diller,
komşu ülkeler ve landmark'lar tek uygulamada — internet olmadan, hesap açmadan, kişisel
veri toplamadan.

- 📦 **245 ülke** — bayrak, başkent, nüfus, para birimi, dil, komşular, landmark ve daha fazlası
- 🎮 **6 oyun modu** — Klasik, Doğru/Yanlış, Hız Turu, Bayrak Eşleştirme, Komşu Zinciri, Günlük Challenge
- 🏆 **Oyunlaştırma** — XP, seviye, rozetler, günlük streak
- 🌐 **İki dil** — Türkçe ve İngilizce
- 🔒 **Gizlilik odaklı** — içerik offline, geliştirici olarak veri toplamıyoruz, hesap gerektirmez
- 🆓 **Ücretsiz** — uygulama içi satın alma yok; ücretsiz kalabilmesi için Google AdMob banner reklamı içerir
  (AB/BK/İsviçre'de UMP onay formu gösterilir — bkz. [PRIVACY.md](PRIVACY.md))

> Paket adı: `com.suphicelikoz.geomaster` · İletişim: suphi.celikoz@gmail.com

---

## Özellikler

### Oyun Modları
| Mod | Açıklama |
| --- | --- |
| **Klasik** | Çoktan seçmeli soru-cevap |
| **Doğru/Yanlış** | Hızlı karar odaklı sorular |
| **Hız Turu** | Zamana karşı yarış |
| **Bayrak Eşleştirme** | Bayrak ↔ ülke eşleştirme |
| **Komşu Zinciri** | Sınır komşularıyla zincir kurma |
| **Günlük Challenge** | Her gün yeni, seri (streak) koruyan meydan okuma |

### İlerleme & Oyunlaştırma
XP ve seviye sistemi, rozet koleksiyonu, günlük streak takibi, skor ve quiz geçmişi —
tümü cihazda yerel SQLite veritabanında tutulur.

---

## Teknoloji Yığını

- **Expo SDK 54** (React Native 0.81, New Architecture etkin)
- **React 19** + **TypeScript**
- **expo-router** — dosya tabanlı yönlendirme (typed routes)
- **zustand** — durum yönetimi (stores/)
- **expo-sqlite** — cihaz içi yerel veritabanı (db/)
- **i18next / react-i18next** + **expo-localization** — TR/EN yerelleştirme (i18n/)
- **expo-haptics** — dokunsal geri bildirim
- **react-native-reanimated** — animasyonlar

### Proje Yapısı
```
app/            Ekranlar (expo-router) — (tabs), quiz/, country/, onboarding, settings...
components/     Yeniden kullanılabilir UI ve alan bileşenleri (ui/, quiz/, country/, gamification/)
data/           Statik içerik: countries/ (kıtalara göre), levels, badges, quizModes
db/             SQLite şema, migrasyonlar, sorgular
engine/         Oyun mantığı: soru üretimi, skorlama, zorluk, günlük challenge, başarımlar
stores/         Zustand store'ları (settings, game, quiz, progress)
i18n/           tr.json, en.json ve i18n kurulumu
types/          Ortak TypeScript tipleri
scripts/        Veri seed script'i
constants/      Tema ve yapılandırma
```

---

## Kurulum

Gereksinimler: Node.js (LTS önerilir) ve npm. Fiziksel cihazda denemek için
[Expo Go](https://expo.dev/go) uygulaması.

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npx expo start
```

Çıkan menüden Android emülatörü, iOS simülatörü veya Expo Go ile açabilirsiniz.

Faydalı script'ler:
```bash
npm run android   # Android'de aç
npm run ios       # iOS'ta aç
npm run web       # Web'de aç
npm run lint      # ESLint
```

---

## Veri Güncelleme

Ülke veri tabanı `scripts/seed-countries.mjs` ile üretilir. Script iki kaynaktan veri
çeker ve `data/countries/_generated.ts` dosyasını oluşturur:

1. **mledoze/countries** (statik JSON) — coğrafya + kimlik verisi (isim, başkent,
   koordinat, sınırlar, para birimi, dil, bayrak emoji, landlocked vb.)
2. **World Bank `SP.POP.TOTL`** — güncel nüfus (ISO3 eşleşmesiyle)

```bash
node scripts/seed-countries.mjs
```

`data/countries/index.ts`, üretilen diziyi manuel ülke kayıtlarıyla (id çakışması
olmadan) birleştirir. `highestPoint`, `funFacts`, `landmarks`, `majorCities`,
`timezones`, `governmentType` gibi alanlar kaynakta bulunmaz ve manuel olarak
zenginleştirilebilir; ilgili quiz kategorileri eksik veriyi otomatik atlar.

> Not: restcountries.com v3.1 API'si kullanımdan kaldırıldığı için (2026) mledoze
> statik dataset'ine geçilmiştir.

---

## Build & Yayın (EAS)

Uygulama [EAS Build](https://docs.expo.dev/build/introduction/) ile derlenir. Profiller
`eas.json` içinde tanımlıdır.

```bash
# EAS CLI (bir kez)
npm install -g eas-cli
eas login

# Android APK (dahili test)
eas build --profile preview --platform android

# Production App Bundle (Play Store)
eas build --profile production --platform android

# Play Store'a gönderim (service account key gerekir)
eas submit --profile production --platform android
```

**Önemli:** Play Store gönderimi için `google-play-key.json` (Google Play service
account anahtarı) proje kökünde gereklidir. Bu dosya ve imzalama keystore'ları **gizli**
olup depoya eklenmemelidir (`.gitignore` ile hariç tutulmuştur). Ayrıca `app.json`
içindeki `extra.eas.projectId` alanının gerçek EAS proje kimliğinizle güncellenmesi
gerekir.

---

## Gizlilik

GeoMaster'ın içeriği çevrimdışı çalışır ve **geliştirici olarak sizden kişisel veri
toplamıyoruz** — hesap yok, sunucumuz yok, kendi analitiğimiz yok. İlerlemeniz yalnızca
cihazınızda kalır.

Uygulama ücretsiz kalabilmesi için **Google AdMob banner reklamı** içerir. Reklam sunmak
ve ölçmek amacıyla Google, üçüncü taraf olarak reklam kimliği ve IP gibi verileri
toplar/işler; AB/BK/İsviçre'de UMP onay formu gösterilir. Ayrıntılar için
[PRIVACY.md](./PRIVACY.md) dosyasına bakın.

## Lisans & İletişim

Geliştirici: **Suphi Çelikoz** — suphi.celikoz@gmail.com
