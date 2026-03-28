// 1. PROFESYONEL SAAT (UTC ZAMAN DİLİMİ)
function updateClock() {
    const now = new Date();
    document.getElementById('live-clock').textContent = 
        String(now.getUTCHours()).padStart(2, '0') + ':' + 
        String(now.getUTCMinutes()).padStart(2, '0') + ':' + 
        String(now.getUTCSeconds()).padStart(2, '0') + ' UTC';
}
setInterval(updateClock, 1000); updateClock();

// 2. 2D TAKTİKSEL HARİTA SİSTEMİ
let mapCurrent, mapForecast;
let heatCurrent, heatForecast;

function initRadars() {
    mapCurrent = L.map('map-current', { zoomControl: false }).setView([41.3, 36.3], 2);
    // noWrap: true eklendi (Dünya'nın yan yana klonlanmasını engeller)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 10, noWrap: true }).addTo(mapCurrent);
    heatCurrent = L.heatLayer([], { radius: 25, blur: 20, maxZoom: 5, gradient: { 0.4: '#38bdf8', 0.8: '#f87171' } }).addTo(mapCurrent);

    mapForecast = L.map('map-forecast', { zoomControl: false }).setView([41.3, 36.3], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 10, noWrap: true }).addTo(mapForecast);
    heatForecast = L.heatLayer([], { radius: 25, blur: 20, maxZoom: 5, gradient: { 0.4: '#fbbf24', 0.8: '#f87171' } }).addTo(mapForecast);

    // Haritaları birbirine kilitleme
    mapCurrent.on('drag', function() { mapForecast.setView(mapCurrent.getCenter(), mapCurrent.getZoom(), {animate: false}); });
    mapCurrent.on('zoom', function() { mapForecast.setView(mapCurrent.getCenter(), mapCurrent.getZoom(), {animate: false}); });
    mapForecast.on('drag', function() { mapCurrent.setView(mapForecast.getCenter(), mapForecast.getZoom(), {animate: false}); });
    mapForecast.on('zoom', function() { mapCurrent.setView(mapForecast.getCenter(), mapForecast.getZoom(), {animate: false}); });

    setTimeout(() => { mapCurrent.invalidateSize(); mapForecast.invalidateSize(); }, 500);

    // Sistem başlarken örnek veriyi yükle
    loadMockData();
}

// 3. ÖRNEK VERİ SİMÜLASYONU
const ornekVeri = {
    "success": true,
    "time": "2026-03-28T17:21:00.675Z",
    "guess": {
        "kp_index": 2.1,
        "ourWarningSystem": { "durum": "TEHLİKE", "renk": "Kırmızı" },
        "noaa_standarts": { "g_olcegi": "G0", "g_aciklama": "Normal Uzay Havası" }
    },
    "harita_verisi": {
        "etkilenen_minimum_enlem": 60.8,
        "etki_alani_aciklamasi": "Fırtına etkileri 60.8 derece manyetik enlem ve kuzeyine kadar genişleyecek."
    },
    "ham_veriler": { "bz_gsm": -3.56, "ruzgar_hizi": 347.3, "proton_yogunlugu": 0.39 }
};

function loadMockData() {
    // Veri objesini kolay kullanım için değişkene atıyoruz
    // Gerçek API'ye geçtiğinde buradaki "ornekVeri" değişkenini API'den dönen "data" ile değiştireceksin.
    const data = ornekVeri; 

    if (data.success) {
        document.getElementById('val-plasma-speed').innerText = data.ham_veriler.ruzgar_hizi;
        document.getElementById('val-plasma-dens').innerText = data.ham_veriler.proton_yogunlugu;
        document.getElementById('val-mag-bz').innerText = data.ham_veriler.bz_gsm;
        
        // Kp İndeksi ve Renk Durumu Düzeltmesi
        const kpElement = document.getElementById('val-kp');
        const kpContainer = document.getElementById('kp-container');
        kpElement.innerText = data.guess.kp_index;
        
        let durumRenk = "#f87171"; // Kırmızı (Varsayılan Tehlike)
        kpContainer.className = "data-value blink"; 

        if (data.guess.ourWarningSystem.durum === "GUVENLI" || data.guess.ourWarningSystem.renk === "Yeşil") {
            durumRenk = "#38bdf8"; // Mavi/Yeşil Güvenli
            kpContainer.className = "data-value"; // Blink animasyonunu kaldır
        } else if (data.guess.ourWarningSystem.renk === "Sarı") {
            durumRenk = "#fbbf24"; // Sarı Uyarı
            kpContainer.className = "data-value";
        }
        
        kpContainer.style.color = durumRenk;

        // Yapay Zeka Raporu
        const timeStr = new Date(data.time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        const reportContent = `
            <strong style="color: ${durumRenk}">SİSTEM DURUMU [${data.guess.ourWarningSystem.durum}]:</strong> 
            NOAA Skalası: ${data.guess.noaa_standarts.g_olcegi} (${data.guess.noaa_standarts.g_aciklama}). 
            <br><br>
            <strong style="color: #38bdf8">ETKİ ANALİZİ:</strong> ${data.harita_verisi.etki_alani_aciklamasi} 
            <br><em>Sistem Güncelleme: ${timeStr}</em>
        `;
        document.getElementById('ai-report-text').innerHTML = reportContent;

        // Harita Radarı Çizimi
        if (data.guess.ourWarningSystem.durum !== "GUVENLI") {
            let threatPoints = [];
            for(let lng = -180; lng <= 180; lng += 10) {
                threatPoints.push([data.harita_verisi.etkilenen_minimum_enlem + 5, lng, 0.8]); 
            }
            heatCurrent.setLatLngs(threatPoints);
            heatForecast.setLatLngs(threatPoints);
        } else {
            heatCurrent.setLatLngs([]); 
            heatForecast.setLatLngs([]);
        }
    }
}

window.addEventListener('load', initRadars);

// =========================================================================
// GERÇEK SUNUCU (BACKEND) BAĞLANTISI
// Arkadaşın sunucuyu aktif ettiğinde aşağıdaki kod bloklarının başındaki ve sonundaki /* ve */ işaretlerini sil.
// İçindeki URL'yi arkadaşının verdiği adresle değiştir.
// =========================================================================

/*
async function fetchGercekData() {
    try {
        const response = await fetch('http://ARKADASININ_SUNUCU_IPSI/api/endpoint');
        const data = await response.json();
        
        // Örnek veriyi yükleyen fonksiyonu, canlı data ile çağırıyoruz!
        // Bunun çalışması için loadMockData() fonksiyonunun adını loadMockData(data) yapıp içini düzenleyebilirsin
        // veya direkt oradaki işlemleri buraya yapıştırabilirsin.

    } catch (error) {
        console.error("Backend bağlantı hatası:", error);
    }
}
setInterval(fetchGercekData, 30000); // 30 saniyede bir otomatik veriyi günceller
*/