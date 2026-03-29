// 1. PROFESYONEL SAAT (UTC ZAMAN DİLİMİ)
function updateClock() {
    const now = new Date();
    document.getElementById("live-clock").textContent = String(now.getUTCHours()).padStart(2, "0") + ":" + String(now.getUTCMinutes()).padStart(2, "0") + ":" + String(now.getUTCSeconds()).padStart(2, "0") + " UTC";
}
setInterval(updateClock, 1000);
updateClock();

// 2. 2D TAKTİKSEL HARİTA SİSTEMİ
let mapCurrent, mapForecast;
let heatCurrent, heatForecast;

function initRadars() {
    mapCurrent = L.map("map-current", { zoomControl: false }).setView([41.3, 36.3], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 10,
        noWrap: true,
        crossOrigin: true,
    }).addTo(mapCurrent);

    heatCurrent = L.heatLayer([], { radius: 25, blur: 20, maxZoom: 5, gradient: { 0.4: "#38bdf8", 0.8: "#f87171" } }).addTo(mapCurrent);

    mapForecast = L.map("map-forecast", { zoomControl: false }).setView([41.3, 36.3], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 10,
        noWrap: true,
        crossOrigin: true,
    }).addTo(mapForecast);

    heatForecast = L.heatLayer([], { radius: 25, blur: 20, maxZoom: 5, gradient: { 0.4: "#fbbf24", 0.8: "#f87171" } }).addTo(mapForecast);

    // Haritaları birbirine kilitleme
    mapCurrent.on("drag", function () {
        mapForecast.setView(mapCurrent.getCenter(), mapCurrent.getZoom(), { animate: false });
    });
    mapCurrent.on("zoom", function () {
        mapForecast.setView(mapCurrent.getCenter(), mapCurrent.getZoom(), { animate: false });
    });
    mapForecast.on("drag", function () {
        mapCurrent.setView(mapForecast.getCenter(), mapForecast.getZoom(), { animate: false });
    });
    mapForecast.on("zoom", function () {
        mapCurrent.setView(mapForecast.getCenter(), mapForecast.getZoom(), { animate: false });
    });

    setTimeout(() => {
        mapCurrent.invalidateSize();
        mapForecast.invalidateSize();
    }, 500);
}

function loadMockData(data) {
    if (data && data.success) {
        document.getElementById("val-plasma-speed").innerText = data.ham_veriler.ruzgar_hizi.toFixed(1);
        document.getElementById("val-plasma-dens").innerText = data.ham_veriler.proton_yogunlugu.toFixed(2);
        document.getElementById("val-mag-bz").innerText = data.ham_veriler.bz_gsm.toFixed(1);

        const kpElement = document.getElementById("val-kp");
        const kpContainer = document.getElementById("kp-container");

        const anlikKp = data.guess.kp_index;
        kpElement.innerText = anlikKp;

        let durumRenk = "#f87171";
        kpContainer.className = "data-value blink";

        const uyariSistemi = data.guess.ourWarningSystem;
        if (uyariSistemi.durum === "GUVENLI" || uyariSistemi.renk === "Yeşil") {
            durumRenk = "#38bdf8";
            kpContainer.className = "data-value";
        } else if (uyariSistemi.renk === "Sarı") {
            durumRenk = "#fbbf24";
            kpContainer.className = "data-value";
        }

        kpContainer.style.color = durumRenk;

        // DİNAMİK ÇARPIŞMA ZAMANI HESAPLAMA (T=X/V)
        const l1UzaklikKm = 1500000;
        const ruzgarHizi = data.ham_veriler.ruzgar_hizi;
        // Eğer hız 0 veya tanımsız gelirse sonsuzluk hatası almamak için güvenlik kontrolü
        let tahminiDakika = "--";
        if (ruzgarHizi > 0) {
            const saniye = l1UzaklikKm / ruzgarHizi;
            tahminiDakika = Math.round(saniye / 60);
        }

        const timeStr = new Date(data.time).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const noaaData = data.guess.noaa_standarts;

        let reportContent = `
            <strong style="color: ${durumRenk}">BEKLENEN ETKİ [${uyariSistemi.durum}]:</strong> 
            NOAA Skalası: ${noaaData.g_olcegi} (${noaaData.g_aciklama}). 
            <br><br>
            <strong style="color: #38bdf8">ETKİ ANALİZİ:</strong> ${data.harita_verisi.etki_alani_aciklamasi} 
            <br><em>Sistem Güncelleme: ${timeStr}</em>
        `;
        document.getElementById("ai-report-text").innerHTML = reportContent;

        if (uyariSistemi.durum !== "GUVENLI") {
            let threatPoints = [];
            // Gelen enlem verisini bir değişkene alıyoruz (Örn: 50)
            const minEnlem = data.harita_verisi.etkilenen_minimum_enlem;

            for (let lng = -180; lng <= 180; lng += 10) {
                // Kuzey Yarımküre uyarı çizgisi (Örn: +55 enlemi)
                threatPoints.push([minEnlem + 5, lng, 0.8]);

                // Güney Yarımküre uyarı çizgisi (Örn: -55 enlemi)
                threatPoints.push([-minEnlem - 5, lng, 0.8]);
            }

            heatCurrent.setLatLngs(threatPoints);
            heatForecast.setLatLngs(threatPoints);

            reportContent += `<strong style="color: #fbbf24">ÇARPIŞMA SAYACI:</strong> L1 noktasındaki güncel plazma hızı (${ruzgarHizi} km/s) baz alınarak, haritadaki etkinin yeryüzüne ulaşmasına <strong>yaklaşık ${tahminiDakika} dakika</strong> kalmıştır.`;
        } else {
            heatCurrent.setLatLngs([]);
            heatForecast.setLatLngs([]);
        }

        document.getElementById("fc-1h-kp").innerText = "Kp " + data.gecmis_kp_trendleri.eksi_1_saat;
        document.getElementById("fc-2h-kp").innerText = "Kp " + data.gecmis_kp_trendleri.eksi_2_saat;
        document.getElementById("fc-3h-kp").innerText = "Kp " + data.gecmis_kp_trendleri.eksi_3_saat;
    }
}
// Olay dinleyicilerini tek bir blokta, sırayla çalışacak şekilde düzenledik
window.addEventListener("load", async () => {
    initRadars(); // Önce haritayı oluştur
    await fetchData(); // Harita oluştuktan sonra veriyi çek ve içine bas
});

async function fetchData() {
    try {
        const response = await fetch("http://localhost:8080/api/forecast/current");
        const data = await response.json();
        loadMockData(data); // Çekilen veriyi işleme gönder
    } catch (error) {
        console.error("Backend bağlantı hatası:", error);
    }
}
setInterval(fetchData, 1000 * 30 * 60); // 30 dakikada bir otomatik veriyi günceller
