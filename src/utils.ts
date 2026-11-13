// Random Domain Generator & Starter Templates

const ADJECTIVES = [
  'swift', 'crimson', 'aurora', 'cyber', 'stellar', 'emerald', 'golden', 'silent',
  'neon', 'velvet', 'cosmic', 'zenith', 'polar', 'vibrant', 'lunar', 'solar',
  'quantum', 'shadow', 'mystic', 'blaze', 'crystal', 'hyper', 'frost', 'nova'
];

const NOUNS = [
  'falcon', 'lotus', 'nebula', 'glacier', 'phoenix', 'cascade', 'horizon', 'prism',
  'oasis', 'pulsar', 'beacon', 'breeze', 'summit', 'vortex', 'spark', 'harbor',
  'orbit', 'grove', 'echo', 'stream', 'mirage', 'atlas', 'stride', 'zenith'
];

export function generateRandomSlug(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}-${noun}-${num}`;
}

export function getWildcardRootDomain(): string {
  const raw = (import.meta.env.VITE_WILDCARD_DOMAIN as string | undefined) || '';
  return raw.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
}

export function getPlatformLabel(): string {
  if (typeof window === 'undefined') return 'Cloud';
  const host = window.location.hostname.toLowerCase();
  if (host.endsWith('.vercel.app')) return 'Vercel';
  if (host.endsWith('.netlify.app')) return 'Netlify';
  if (host.endsWith('.web.app') || host.endsWith('.firebaseapp.com')) return 'Firebase Hosting';
  if (host === 'localhost' || host === '127.0.0.1') return 'Localhost';
  return host;
}

export function getPublicSiteUrl(slug: string): string {
  if (typeof window === 'undefined') return `/s/${slug}`;
  const wildcard = getWildcardRootDomain();
  if (wildcard) {
    return `https://${slug}.${wildcard}`;
  }
  return `${window.location.origin}/s/${slug}`;
}

export function getDisplayDomain(slug: string): string {
  if (typeof window === 'undefined') return `/s/${slug}`;
  const wildcard = getWildcardRootDomain();
  if (wildcard) {
    return `${slug}.${wildcard}`;
  }
  return `${window.location.host}/s/${slug}`;
}

export function extractSlugFromLocation(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check custom wildcard subdomain (e.g., swift-falcon-842.domainanda.com)
  const wildcard = getWildcardRootDomain();
  const hostname = window.location.hostname.toLowerCase();
  if (wildcard && hostname.endsWith(`.${wildcard}`)) {
    const sub = hostname.slice(0, -(wildcard.length + 1));
    if (sub && sub !== 'www' && /^[a-z0-9-]+$/i.test(sub)) {
      return sub;
    }
  }

  // 2. Check clean path URL: /s/<slug> or /site/<slug> (Vercel & Netlify native)
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/^\/(?:s|site)\/([a-zA-Z0-9_-]+)\/?$/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  // 3. Check query parameter: ?site=<slug>
  const params = new URLSearchParams(window.location.search);
  const querySite = params.get('site');
  if (querySite && /^[a-zA-Z0-9_-]+$/.test(querySite)) {
    return querySite;
  }

  // 4. Check hash fallback: #/s/<slug> or #/site/<slug>
  const hash = window.location.hash;
  if (hash.startsWith('#/s/') || hash.startsWith('#/site/')) {
    const slug = hash.replace(/^#\/(s|site)\//, '').split('?')[0].replace(/\/$/, '');
    if (slug && /^[a-zA-Z0-9_-]+$/.test(slug)) {
      return slug;
    }
  }

  return null;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDateRelative(dateVal: any): string {
  if (!dateVal) return 'Baru sahaja';
  let date: Date;
  if (dateVal.toDate && typeof dateVal.toDate === 'function') {
    date = dateVal.toDate();
  } else if (dateVal.seconds) {
    date = new Date(dateVal.seconds * 1000);
  } else {
    date = new Date(dateVal);
  }
  
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Baru sahaja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
  return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface HtmlTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  html: string;
}

export const STARTER_TEMPLATES: HtmlTemplate[] = [
  {
    id: 'portfolio',
    name: 'Portfolio Moden & Resume',
    description: 'Profil peribadi profesional dengan senarai projek dan butang pautan.',
    category: 'Peribadi',
    html: `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ahmad Zaid - Web Developer & Designer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 md:p-12">
  <div class="max-w-3xl mx-auto space-y-12">
    <!-- Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
      <div>
        <div class="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-full mb-3 border border-indigo-500/20">
          Sedia untuk Projek Baharu
        </div>
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white">Ahmad Zaid</h1>
        <p class="text-slate-400 mt-2 text-base">Full-Stack Engineer & UI Designer berpusat di Kuala Lumpur.</p>
      </div>
      <div class="flex gap-3">
        <a href="mailto:contact@example.com" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/20">
          Hubungi Saya
        </a>
      </div>
    </header>

    <!-- About -->
    <section class="space-y-4">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Mengenai Saya</h2>
      <p class="text-slate-300 leading-relaxed">
        Berpengalaman lebih 5 tahun dalam membina aplikasi web moden, sistem awan dan antaramuka yang mesra pengguna. Meminati teknologi TypeScript, React, Tailwind CSS dan seni bina serverless.
      </p>
    </section>

    <!-- Projects -->
    <section class="space-y-6">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Projek Terkini</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-indigo-400">Web App</span>
            <span class="text-xs text-slate-500">2026</span>
          </div>
          <h3 class="text-lg font-semibold text-white mt-2 group-hover:text-indigo-400 transition">PayFlow MY</h3>
          <p class="text-sm text-slate-400 mt-1">Gerbang pembayaran pantas untuk perniagaan kecil tempatan.</p>
        </div>
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-emerald-400">SaaS</span>
            <span class="text-xs text-slate-500">2026</span>
          </div>
          <h3 class="text-lg font-semibold text-white mt-2 group-hover:text-emerald-400 transition">DocuSigner</h3>
          <p class="text-sm text-slate-400 mt-1">Pengurusan tandatangan dokumen secara digital dan selamat.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="pt-8 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
      <span>© 2026 Ahmad Zaid. Dihoskan di HostDeploy.</span>
      <div class="flex gap-4">
        <a href="#" class="hover:text-slate-300">GitHub</a>
        <a href="#" class="hover:text-slate-300">Twitter</a>
        <a href="#" class="hover:text-slate-300">LinkedIn</a>
      </div>
    </footer>
  </div>
</body>
</html>`
  },
  {
    id: 'landing',
    name: 'Laman Pendaratan Produk (Landing Page)',
    description: 'Reka bentuk moden dengan hero, kelebihan produk, dan butang tindakan (CTA).',
    category: 'Perniagaan',
    html: `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AeroSync - Automasi Aliran Kerja Pintar</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen">
  <!-- Nav -->
  <nav class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">A</div>
      <span class="text-xl font-bold tracking-tight">AeroSync</span>
    </div>
    <a href="#daftar" class="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-lg transition">Cuba Percuma</a>
  </nav>

  <!-- Hero -->
  <header class="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center space-y-6">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
      🚀 Versi 2.0 Kini Dilancarkan
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
      Urus Kerja Pasukan Anda <br class="hidden sm:inline"/>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">10 Kali Lebih Pantas</span>
    </h1>
    <p class="text-slate-400 text-lg max-w-2xl mx-auto">
      Platform automasi moden yang menghubungkan aplikasi kegemaran anda dalam satu papan pemuka pintar tanpa memerlukan kod rumit.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      <button class="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/30 transition">
        Mulakan Sekarang — Percuma 14 Hari
      </button>
      <button class="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition">
        Tonton Demo (2 Minit)
      </button>
    </div>
  </header>

  <!-- Features -->
  <section class="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
      <div class="text-2xl mb-3">⚡</div>
      <h3 class="text-lg font-semibold mb-2">Penyegerakan Sebenar</h3>
      <p class="text-sm text-slate-400">Data anda dikemaskini dalam masa nyata tanpa sebarang lengah waktu.</p>
    </div>
    <div class="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
      <div class="text-2xl mb-3">🔒</div>
      <h3 class="text-lg font-semibold mb-2">Keselamatan gred Bank</h3>
      <p class="text-sm text-slate-400">Penyulitan hujung ke hujung 256-bit memastikan data sulit selamat.</p>
    </div>
    <div class="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
      <div class="text-2xl mb-3">📊</div>
      <h3 class="text-lg font-semibold mb-2">Analisis Terperinci</h3>
      <p class="text-sm text-slate-400">Pantau produktiviti dan metrik penting secara automatik.</p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="text-center py-8 text-xs text-slate-500 border-t border-slate-800">
    © 2026 AeroSync Inc. Hak cipta terpelihara.
  </footer>
</body>
</html>`
  },
  {
    id: 'bio',
    name: 'Kad Digital & Link-in-Bio',
    description: 'Sesuai untuk pautan di Instagram, TikTok, WhatsApp & kad bisnes maya.',
    category: 'Sosial',
    html: `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nurul Ain | Link in Bio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 text-white min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 text-center shadow-2xl space-y-6">
    <!-- Avatar -->
    <div class="relative w-24 h-24 mx-auto">
      <div class="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-purple-500/30">
        NA
      </div>
    </div>

    <!-- Bio -->
    <div>
      <h1 class="text-2xl font-bold">Nurul Ain</h1>
      <p class="text-purple-300 text-sm mt-1">Pencipta Kandungan & Pengasas Dapur Ain</p>
      <p class="text-slate-400 text-xs mt-2">Kuala Lumpur, Malaysia · Berkongsi resepi harian & tips masakan mudah ✨</p>
    </div>

    <!-- Links -->
    <div class="space-y-3">
      <a href="https://whatsapp.com" target="_blank" class="block w-full py-3.5 px-4 bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-sm rounded-2xl transition shadow-lg shadow-emerald-900/30">
        💬 Tempah Katering (WhatsApp)
      </a>
      <a href="#" class="block w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-sm rounded-2xl border border-slate-700 transition">
        📖 E-Book 50 Resepi Viral 2026
      </a>
      <a href="#" class="block w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-sm rounded-2xl border border-slate-700 transition">
        🎬 Saluran YouTube Saya
      </a>
      <a href="#" class="block w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-sm rounded-2xl border border-slate-700 transition">
        📸 Galeri Instagram (@nurulain.cooks)
      </a>
    </div>

    <!-- Footer -->
    <p class="text-xs text-slate-500 pt-2">
      Dikuasakan oleh HostDeploy
    </p>
  </div>
</body>
</html>`
  },
  {
    id: 'invitation',
    name: 'Kad Jemputan / Event RSVP',
    description: 'Kad majlis atau kenduri dengan kiraan masa nyata (countdown) dan butang RSVP.',
    category: 'Majlis',
    html: `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Walimatul Urus: Amirul & Sofea</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    .font-serif { font-family: 'Playfair Display', serif; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-stone-900 text-stone-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-lg w-full bg-stone-950 border border-amber-900/40 rounded-3xl p-8 text-center shadow-2xl space-y-6">
    <div class="text-amber-400 text-xs tracking-widest uppercase font-semibold">Walimatul Urus</div>
    
    <div class="space-y-1">
      <h1 class="font-serif text-3xl md:text-4xl text-amber-200">Amirul & Sofea</h1>
      <p class="text-stone-400 text-xs italic">Mengharap kehadiran dan doa restu ke majlis kami</p>
    </div>

    <div class="py-4 border-y border-stone-800 space-y-2">
      <div class="text-sm font-semibold text-stone-200">Sabtu, 12 Disember 2026</div>
      <div class="text-xs text-stone-400">11:00 Pagi - 4:00 Petang</div>
      <div class="text-xs text-amber-300">Dewan Perdana Felda, Jalan Semarak, KL</div>
    </div>

    <!-- Countdown Timer -->
    <div class="grid grid-cols-4 gap-2 text-center">
      <div class="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
        <span id="days" class="text-xl font-bold text-amber-200 font-mono">28</span>
        <span class="block text-[10px] text-stone-400 uppercase">Hari</span>
      </div>
      <div class="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
        <span id="hours" class="text-xl font-bold text-amber-200 font-mono">14</span>
        <span class="block text-[10px] text-stone-400 uppercase">Jam</span>
      </div>
      <div class="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
        <span id="minutes" class="text-xl font-bold text-amber-200 font-mono">35</span>
        <span class="block text-[10px] text-stone-400 uppercase">Minit</span>
      </div>
      <div class="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
        <span id="seconds" class="text-xl font-bold text-amber-200 font-mono">50</span>
        <span class="block text-[10px] text-stone-400 uppercase">Saat</span>
      </div>
    </div>

    <!-- RSVP Actions -->
    <div class="space-y-3 pt-2">
      <button onclick="alert('Terima kasih atas pengesahan kehadiran anda!')" class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-600/20">
        Sahkan Kehadiran (RSVP)
      </button>
      <a href="https://maps.google.com" target="_blank" class="block w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium rounded-xl border border-stone-800 transition">
        Buka Petunjuk Arah (Waze / Maps)
      </a>
    </div>

    <div class="text-[11px] text-stone-500">
      #AmirulSofea2026 · Kad Digital Dihoskan di HostDeploy
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'blank',
    name: 'Boilerplate HTML5 Bersih',
    description: 'Templat asas kosong dengan struktur HTML5 dan penataan gaya Tailwind.',
    category: 'Asas',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laman Baharu Saya</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md text-center space-y-4">
    <h1 class="text-3xl font-bold">Helo Dunia! 🚀</h1>
    <p class="text-slate-400">Fail HTML anda berjaya dideploy dan sedia untuk diakses secara awam.</p>
    <button onclick="alert('Butang berfungsi!')" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition">
      Klik Sini
    </button>
  </div>
</body>
</html>`
  }
];
