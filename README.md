# English Final Test Prep - Armidale English College

Aplikasi latihan dan persiapan ujian akhir bahasa Inggris (Final Test) yang modern, ringan, dan interaktif. Dibuat menggunakan **React 19**, **Vite 8**, dan **Tailwind CSS v4**, aplikasi ini dirancang khusus untuk membantu siswa-siswi Armidale English College menguasai berbagai keterampilan bahasa Inggris: Grammar, Listening, Reading, Writing, hingga Speaking (Mock Interview AI).

Aplikasi ini menggunakan perpaduan antara kuis lokal berkecepatan tinggi (100% offline & bebas limit kuota) dan fitur interaktif berbasis AI menggunakan **Google Gemini 3.5 Flash API**.

---

## 🚀 Fitur Utama & Modul

Aplikasi ini dibagi menjadi beberapa modul pembelajaran utama:

1. **Dashboard**
   * Panel ringkasan interaktif yang menampilkan statistik kemajuan siswa.
   * Melacak jumlah topik grammar yang selesai, progress listening unit (dari total 19 unit), kuis reading, dan hasil latihan lainnya menggunakan `localStorage` untuk penyimpanan status.

2. **Grammar Practice (100% Offline)**
   * Berisi puluhan kuis grammar pilihan ganda yang dimuat dari database lokal (`src/data/grammarQuizzes.json`).
   * Memberikan feedback koreksi instan lengkap dengan penjelasan aturan tata bahasa yang mendalam untuk setiap opsi jawaban.

3. **Listening Practice (Units 15 - 33) (100% Offline)**
   * **Audio Full (YouTube Embed):** Memutar rekaman audio asli per unit pelajaran langsung dari YouTube Playlist Armidale English College.
   * **Ringkasan (TTS AI):** Sintesis suara lokal menggunakan Web Speech API untuk mendengarkan rangkuman cerita dengan kecepatan pembacaan yang dioptimalkan (`rate: 0.85`).
   * **Kuis Pemahaman Offline:** Berisi 3 soal pemahaman pilihan ganda per unit (total 57 soal dari unit 15 hingga 33) yang diambil dari database lokal (`src/data/listeningQuizzes.json`). Menghindari kuota API terbuang saat latihan mendengarkan cerita.

4. **Reading Comprehension (100% Offline)**
   * Latihan memahami bacaan bahasa Inggris dengan teks passage dan kuis pemahaman lokal (`src/data/readingPassages.json`).

5. **Writing Practice (AI Assisted)**
   * Tempat latihan menulis esai. Esai siswa akan langsung dinilai oleh Gemini AI berdasarkan kriteria CEFR banding, tata bahasa (grammar), kosa kata (vocabulary), serta koherensi kalimat.
   * Menampilkan saran perbaikan kalimat (sentence correction) secara detail.

6. **Interview AI (AI Interactive Mock Speaking)**
   * Simulasi wawancara bahasa Inggris interaktif. Siswa dapat menjawab menggunakan teks atau suara (Speech-to-Text).
   * Gemini AI berperan sebagai interviewer yang interaktif dan memberikan umpan balik kontekstual serta laporan penilaian kemampuan speaking di akhir sesi.

7. **Study Guide & Settings**
   * Panduan silabus belajar terstruktur.
   * Menu Settings untuk mengganti Tema (Light/Dark Mode), memasukkan Gemini API Key pribadi (opsional jika API key default habis limit), dan mereset data kemajuan belajar (`localStorage`).

---

## 🛠️ Tech Stack & Arsitektur

* **Framework Utama:** [React 19](https://react.dev/)
* **Bundler & Dev Server:** [Vite 8](https://vite.dev/) (Kecepatan reload super instan dengan HMR)
* **Styling (CSS):** [Tailwind CSS v4](https://tailwindcss.com/) (Menggunakan `@tailwindcss/vite` compiler baru yang sangat cepat)
* **Icons:** [Lucide React](https://lucide.dev/) (Dilengkapi kustomisasi SVG inline untuk logo Youtube)
* **AI Integration:** Google Gemini API SDK (`@google/generative-ai` atau fetch langsung ke REST API)
* **Audio & Speech:** Web Speech API (`speechSynthesis` untuk TTS text-to-speech)

---

## 📁 Struktur Direktori

```bash
final-test/
├── .vercel/                 # Konfigurasi deployment Vercel
├── public/                  # Aset statis aplikasi
│   ├── logo.jpg             # Logo institusi
│   └── og-image.png         # Open Graph preview card (1200x630) untuk WhatsApp/Telegram
├── scripts/                 # Skrip pembantu developer (offline generator)
│   ├── generate-questions.js          # Generator soal kuis grammar via Gemini API
│   └── generate-listening-quizzes.js  # Generator soal kuis listening via Gemini API
├── src/
│   ├── assets/              # Aset gambar/styling tambahan
│   ├── components/          # Komponen UI global (Navbar, Dashboard, Settings, StudyGuide)
│   ├── context/             # State Management global (PracticeContext)
│   ├── data/                # Database JSON lokal
│   │   ├── grammarTopics.json       # Topik silabus grammar
│   │   ├── grammarQuizzes.json      # Database soal grammar (offline)
│   │   ├── listeningUnits.json      # Rangkuman materi listening
│   │   ├── listeningQuizzes.json    # Database soal pemahaman listening (offline)
│   │   └── readingPassages.json     # Teks reading & kuis pemahaman
│   ├── modules/             # Modul halaman utama (Grammar, Listening, Reading, Writing, Interview)
│   ├── utils/               # Utilitas pembantu (TTS audio speech, integrasi API Gemini, error handler)
│   │   ├── gemini.js                # Integrasi Gemini & penanganan error rate-limit (429)
│   │   └── speech.js                # Utilitas Text-To-Speech (Web Speech API)
│   ├── App.css
│   ├── App.jsx              # Main router & app shell
│   ├── index.css            # Desain system & custom utility CSS
│   └── main.jsx
├── .env                     # File konfigurasi API Key
├── index.html               # File entri HTML (dilengkapi optimasi tag SEO & Open Graph)
├── package.json             # Manajer dependensi & skrip build
├── vite.config.js           # Konfigurasi Vite & compiler Tailwind v4
└── README.md                # Dokumentasi proyek
```

---

## ⚙️ Cara Menjalankan secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** (versi 18 ke atas disarankan) dan **npm** di komputer Anda.

### 1. Kloning Repositori
```bash
git clone https://github.com/najibarif/finalTestPrep.git
cd finalTestPrep
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Buat file bernama `.env` di direktori utama (root) proyek, lalu isi dengan Google Gemini API Key Anda:
```env
VITE_GEMINI_API_KEY=isi_dengan_api_key_gemini_anda
```
> **Catatan:** Jika API Key dikosongkan, fitur menulis dan mock interview akan meminta siswa memasukkan API Key mereka secara manual di menu Settings aplikasi. Kuis Grammar, Reading, dan Listening akan tetap berfungsi penuh karena berjalan secara offline.

### 4. Jalankan Aplikasi dalam Mode Pengembangan
```bash
npm run dev
```
Aplikasi akan berjalan secara lokal di alamat: `http://localhost:5173`.

### 5. Build untuk Produksi
Untuk melakukan kompilasi bundel kode yang teroptimasi ke folder `dist/`:
```bash
npm run build
```

---

## 🛠️ Skrip Utilitas Developer (Offline Generator)

Kami menyediakan skrip utilitas di folder `scripts/` untuk mengisi atau memperbarui soal kuis lokal secara otomatis menggunakan AI sebelum dideploy ke produksi. Hal ini berguna untuk menghindari request API Gemini di sisi pengguna akhir:

### 1. Menghasilkan Soal Grammar Baru
Menambahkan 5 soal kuis baru secara otomatis untuk topik tertentu berdasarkan topik di `grammarTopics.json`:
```bash
# Penggunaan: node scripts/generate-questions.js <TopicId1> <TopicId2> ...
node scripts/generate-questions.js PP1 PP2
```
Skrip ini akan mengambil pedoman dari `grammarTopics.json` untuk ID yang ditentukan, mengirimkan prompt ke Gemini API, memformat responnya menjadi format JSON yang aman, lalu langsung memasukkannya ke database `src/data/grammarQuizzes.json`.

### 2. Menghasilkan Seluruh Kuis Listening (Unit 15-33)
Menghasilkan 3 soal pemahaman cerita per unit untuk 19 unit listening:
```bash
node scripts/generate-listening-quizzes.js
```
Skrip ini akan mengiterasi semua unit cerita, meminta Gemini membuat soal pemahaman, menyortir urutan unit, dan menyimpannya di `src/data/listeningQuizzes.json`. Dilengkapi dengan fungsi penunda (delay) dan penanganan otomatis terhadap pembatasan rate limit (HTTP 429) bawaan API gratis Gemini.

---

## 🌐 SEO & Open Graph Preview Tags

Untuk membuat link website terlihat premium dan profesional saat dibagikan ke WhatsApp, Telegram, Facebook, atau platform media sosial lainnya, file `index.html` telah dilengkapi dengan tag meta **Open Graph** dan **Twitter Card**:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://final-test-prep.vercel.app/">
<meta property="og:title" content="English Final Test Prep - Armidale English College">
<meta property="og:description" content="Aplikasi persiapan ujian akhir bahasa Inggris interaktif dengan kuis offline dan teknologi AI. Latih Grammar, Listening, Reading, Writing & Speaking di sini.">
<meta property="og:image" content="https://final-test-prep.vercel.app/og-image.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://final-test-prep.vercel.app/">
<meta property="twitter:title" content="English Final Test Prep - Armidale English College">
<meta property="twitter:description" content="Aplikasi persiapan ujian akhir bahasa Inggris interaktif dengan kuis offline dan teknologi AI.">
<meta property="twitter:image" content="https://final-test-prep.vercel.app/og-image.png">
```

Aset gambar peninjau menggunakan banner beresolusi **1200x630 piksel** yang berlokasi di `public/og-image.png` dengan desain modern gelap-ungu (glassmorphism) yang memukau.

---

## 🚀 Deployment ke Vercel

Aplikasi ini dapat dideploy dengan sangat mudah ke Vercel melalui Terminal / CLI:

1. Pastikan Anda telah menginstal Vercel CLI secara global:
   ```bash
   npm install -g vercel
   ```
2. Hubungkan dan deploy ke Vercel (Ikuti instruksi interaktif):
   ```bash
   vercel
   ```
3. Deploy hasil akhir ke produksi:
   ```bash
   vercel --prod
   ```

Tautan website langsung (Production): [https://final-test-prep.vercel.app](https://final-test-prep.vercel.app)
