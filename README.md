# RentVerse Mobile App (Listing Property)

Aplikasi mobile RentVerse dibangun menggunakan React Native dengan Expo, dirancang untuk memberikan pengalaman terbaik bagi tenant dan landlord dalam menyewa dan mengelola properti.

## 📱 Teknologi Utama

- **Framework:** React Native (Expo SDK 54)
- **Bahasa:** TypeScript / JavaScript
- **Styling:** NativeWind (TailwindCSS)
- **Navigasi:** React Navigation 7
- **Peta:** MapLibre GL
- **Pembayaran:** Stripe React Native
- **State Management:** React Hooks & Context
- **Real-time:** Socket.io Client

## ✨ Fitur Mobile

### Tenant (Penyewa)
- **Explorasi Properti:** Tampilan kartu properti dengan gambar berkualitas tinggi.
- **Pencarian Peta:** Cari properti berdasarkan lokasi langsung di peta interaktif.
- **Filter Canggih:** Filter berdasarkan harga, fasilitas, dan tipe properti.
- **Detail Properti:** Info lengkap, galeri foto, fasilitas, dan review.
- **Booking & Pembayaran:** Proses booking mudah dengan pembayaran aman via Stripe.
- **Chat:** Komunikasi langsung dengan pemilik properti.
- **Riwayat Perjalanan:** Lihat status booking aktif dan riwayat masa lalu.

### Landlord (Pemilik)
- **Manajemen Properti:** Tambah, edit, dan kelola listing properti.
- **Dashboard Reservasi:** Terima atau tolak permintaan booking.
- **Stripe Connect:** Hubungkan akun bank untuk menerima pembayaran otomatis.
- **Kalender Ketersediaan:** Atur ketersediaan properti.

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js (v18+)
- npm atau yarn
- Expo Go App (di HP) atau Android Emulator / iOS Simulator

### Instalasi & Setup

1. **Masuk ke direktori mobile:**
   ```bash
   cd listingProperty
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Salin `.env.example` ke `.env` dan isi variabel yang diperlukan.
   ```bash
   cp .env.example .env
   ```
   Pastikan `API_BASE_URL` mengarah ke backend Anda (gunakan IP address komputer jika testing di device fisik, e.g., `http://192.168.1.x:3000`).

4. **Jalankan Aplikasi:**
   ```bash
   npm start
   ```

5. **Buka di Device:**
   - **Fisik (HP):** Scan QR code yang muncul di terminal menggunakan aplikasi Expo Go.
   - **Emulator (Android):** Tekan `a` di terminal.
   - **Simulator (iOS):** Tekan `i` di terminal (hanya di macOS).

## 📁 Struktur Direktori

```
listingProperty/
├── assets/                 # Gambar, font, dan aset statis
├── components/             # Komponen UI reusable (Buttons, Cards, Inputs)
├── contexts/               # React Context untuk global state (Auth, Socket)
├── hooks/                  # Custom hooks (useNetwork, useLocation)
├── navigation/             # Konfigurasi navigasi (Stack, Tab, Drawer)
├── screens/                # Layar aplikasi (halaman utama)
│   ├── auth/               # Login, Register
│   ├── booking/            # Flow booking
│   ├── chat/               # List chat & detail chat
│   ├── home/               # Search & Explore
│   ├── landlord/           # Dashboard landlord
│   ├── map/                # Layar peta
│   └── profile/            # Profil user & settings
├── services/               # Integrasi API (Axios calls)
├── types/                  # Definisi tipe TypeScript
├── utils/                  # Fungsi helper
├── app.json                # Konfigurasi Expo
├── tailwind.config.js      # Konfigurasi TailwindCSS
└── App.tsx                 # Entry point aplikasi
```

## 🛠️ Troubleshooting Umum

- **Masalah Network/Koneksi Backend:**
  Jika aplikasi tidak bisa connect ke backend saat dijalankan di HP fisik, pastikan HP dan Laptop berada di jaringan Wi-Fi yang sama, dan ganti `localhost` di `.env` dengan IP address laptop Anda.

- **Masalah Map tidak muncul:**
  Pastikan Anda memiliki koneksi internet yang stabil untuk memuat tiles peta.

- **Stripe Error:**
  Pastikan `STRIPE_PUBLISHABLE_KEY` sudah benar di `.env`.

## 📦 Build untuk Produksi

Untuk membuat file APK (Android) atau IPA (iOS):

```bash
npm run prebuild
eas build --platform android
eas build --platform ios
```

---
Happy Coding! 🚀
