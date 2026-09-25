# Globe Berita Dunia
Globe 3D interaktif: ketuk negara, berita terbaru (GDELT) tampil di dalam aplikasi. Negara dengan mata uang utama juga punya tab Kalender Ekonomi (feed Forex Factory).

## Jalankan
    node server.js        # butuh Node 18+, tanpa npm install
Buka http://localhost:3000

## Hosting
Deploy folder ini ke layanan yang menjalankan Node (Render, Railway, Fly.io, VPS). Start command: `node server.js`. Wajib HTTPS agar bisa di-install ke layar utama.
Opsional: env `FF_FEED_URL` untuk mengganti alamat feed kalender.
Catatan: cek syarat penggunaan GDELT dan Forex Factory sebelum dipakai publik.

## Versi APK (tanpa hosting)
Di dalam APK, aplikasi mengambil berita langsung dari GDELT lewat HTTP native (Capacitor), jadi tidak perlu server.
1. Buat repo GitHub baru, unggah seluruh isi folder ini (branch main).
2. Tab Actions > "Build APK" > Run workflow. Tunggu selesai.
3. Unduh artifact "globe-berita-apk" (berisi app-debug.apk).
Ganti `appId` di capacitor.config.json dengan ID milikmu SEBELUM dibagikan; ID tidak bisa diganti setelah beredar.
