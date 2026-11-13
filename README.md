# HostDeploy — Instant HTML Hosting (Vercel, Netlify & Firebase)

Webapp ini membolehkan pengguna log masuk menggunakan akaun Google, memuat naik atau mengedit fail HTML, membuat pratinjau responsif sebelum menyimpan, dan menjana pautan awam rawak secara serta-merta.

## Tidak Perlu Environment Variable!
Anda **tidak perlu mengisi sebarang Environment Variable** semasa deploy ke Vercel atau Netlify kerana konfigurasi Firebase projek anda (`firebase-applet-config.json`) sudah tersedia terus dalam kod ini.

## Langkah Deploy ke Vercel atau Netlify

1. **Import projek ke Vercel / Netlify** dan klik **Deploy** terus (biarkan bahagian Environment Variables kosong):
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Benarkan Domain di Firebase Authentication** *(Supaya Google Login berfungsi)*:
   - Buka [Firebase Console](https://console.firebase.google.com/project/charming-freedom-88gvj/authentication/settings) → **Authentication** → **Settings** → **Authorized domains**.
   - Klik **Add domain** dan masukkan domain Vercel/Netlify anda (contoh: `nama-app.vercel.app` atau `nama-app.netlify.app`).

3. **URL Rawak Berfungsi Automatik**:
   - Setiap fail HTML yang dideploy akan terus mendapat pautan awam unik seperti:
     `https://nama-app.vercel.app/s/swift-falcon-842`
