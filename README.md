# Bir Türkiye Seçmeni Oluştur

2023 Türkiye genel seçimi için hazırlanmış etkileşimli, statik bir araştırma prototipi.

## Özellikler

- Sayfa her açıldığında sabit bir profil yerine ağırlıklı ve tutarlı bir rastgele profil oluşturur.
- Yaş, eğitim, çalışma durumu, gelir, bölge, aile yapısı, etnik kimlik, mezhep ve dindarlık arasındaki bazı koşullu ilişkileri hesaba katar.
- Milletvekili seçimi, katılım ve Cumhurbaşkanlığı ikinci turu için ayrı sonuçlar gösterir.
- Masaüstünde profil metni ekranı taşırmayacak biçimde sınırlandırılmıştır.
- Sunucu veya derleme sistemi gerektirmez; GitHub Pages üzerinde doğrudan çalışır.

## Dosya yapısı

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── docs/
│   └── MODEL-NOTES.md
├── .gitignore
├── .nojekyll
└── LICENSE
```

## Yerelde çalıştırma

Dosyaları doğrudan açmak yerine küçük bir yerel sunucu kullanmak daha güvenlidir:

```bash
python3 -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini açın.

## GitHub Pages ile yayımlama

1. Bu klasörün içeriğini yeni bir GitHub deposuna yükleyin.
2. GitHub'da **Settings → Pages** bölümüne gidin.
3. **Deploy from a branch** seçeneğini kullanın.
4. `main` dalını ve `/(root)` klasörünü seçin.
5. Kaydedin.

Site şu biçimde yayımlanır:

```text
https://KULLANICI-ADI.github.io/DEPO-ADI/
```

## Model uyarısı

Bu sürümdeki katsayılar gerçek CSES mikroverisi üzerinde tahmin edilmiş nihai katsayılar değildir. Sonuçlar bir araştırma ve arayüz prototipi olarak yorumlanmalıdır; güncel oy niyeti tahmini değildir.
