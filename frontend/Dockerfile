# Sektör standardı, ultra hafif Nginx sunucusunu kullanıyoruz
FROM nginx:alpine

# Konteynerin içindeki varsayılan Nginx HTML klasörünü temizle
RUN rm -rf /usr/share/nginx/html/*

# Senin bilgisayarındaki dosyaları (index, css, js) Nginx'in içine kopyala
COPY . /usr/share/nginx/html

# Nginx varsayılan olarak 80 portundan yayın yapar
EXPOSE 80

# Nginx'i arka planda değil, ön planda sürekli çalışacak şekilde başlat
CMD ["nginx", "-g", "daemon off;"]