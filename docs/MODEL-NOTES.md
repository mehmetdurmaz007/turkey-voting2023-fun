# Model notları

## Mevcut durum

Model, 2023 resmî oy paylarını başlangıç dağılımı olarak kullanır. Seçilen profil özellikleri parti puanlarına log-olasılık katkıları ekler. Sonuçlar softmax dönüşümüyle olasılıklara çevrilir.

Katılım ayrı bir lojistik modelle, Cumhurbaşkanlığı ikinci turu ise parlamenter parti olasılıklarından blok geçişleri ve bazı doğrudan profil etkileriyle hesaplanır.

## Aile etkileşimleri

Çocuk sahibi olmak tek başına sabit bir parti etkisine sahip değildir. Etki şu değişkenlerle koşullandırılır:

- medeni durum;
- dindarlık;
- mezhep/inanç geleneği;
- cinsiyet;
- çalışma durumu.

Bu nedenle evli ve dindar bir ebeveyn ile bekâr veya boşanmış bir ebeveyn için aynı çocuk sayısı farklı sonuç üretir.

## Rastgele profil üretimi

Rastgeleleştirici alanları tamamen bağımsız çekmez. Örneğin:

- eğitim yaşa göre;
- çalışma durumu yaşa göre;
- gelir eğitime göre;
- medeni durum yaşa göre;
- çocuk sayısı medeni durum ve yaşa göre;
- etnik kimlik bölgeye göre;
- mezhep etnik kimliğe göre;
- dindarlık mezhep ve yaşa göre çekilir.

Sayfa yüklenirken `randomProfile()` çalışır. Kaynak kodda kullanıcıya ait sabit bir başlangıç profili tutulmaz.

## Bilimsel sürüm için yapılması gerekenler

- CSES Türkiye 2023 mikroverisiyle ağırlıklı çok kategorili model tahmini;
- nadir profil kesişimleri için kısmi havuzlama;
- TÜİK marjinleriyle poststratifikasyon;
- YSK ulusal ve bölgesel sonuçlarına kalibrasyon;
- bootstrap veya Bayesçi posterior üzerinden gerçek belirsizlik aralıkları;
- çapraz doğrulama, log loss, Brier skoru ve kalibrasyon grafikleri.
