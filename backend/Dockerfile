# ONNX (C++ tabanlı makine öğrenmesi) kütüphanesinin sorunsuz çalışması için 
# Alpine yerine Debian Bookworm tabanlı slim imajı kullanıyoruz.
FROM node:24-bookworm-slim

# Konteyner içindeki çalışma dizinimiz
WORKDIR /app

# Sadece package dosyalarını kopyalayıp npm install yapıyoruz (Önbelleği verimli kullanmak için)
COPY package*.json ./
RUN npm install

# Kalan tüm dosyaları (src, server.js, onnx modeli vs.) kopyalıyoruz
COPY . .

# Uygulamanın çalışacağı portu dışarıya açıyoruz
EXPOSE 8080

# Konteyner ayağa kalktığında çalıştırılacak komut
CMD ["node", "server.js"]