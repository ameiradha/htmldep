import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { 
  Globe, 
  Plus, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  HardDrive, 
  FileCode2, 
  Layers, 
  LogIn, 
  CheckCircle2, 
  ExternalLink,
  Eye,
  AlertCircle,
  X
} from 'lucide-react';
import { auth, getUserSites, deleteSite, loginWithGoogle, getAuthErrorMessage, type DeployedSite } from './firebase';
import { formatBytes, getPublicSiteUrl, getDisplayDomain, extractSlugFromLocation, getPlatformLabel } from './utils';
import { Navbar } from './components/Navbar';
import { SiteCard } from './components/SiteCard';
import { SiteEditorModal } from './components/SiteEditorModal';
import { PublicSiteViewer } from './components/PublicSiteViewer';
import { ShareModal } from './components/ShareModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PreviewPane } from './components/PreviewPane';
import { DeployGuideModal } from './components/DeployGuideModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [sites, setSites] = useState<DeployedSite[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Routing state for public viewer
  const [publicSlug, setPublicSlug] = useState<string | null>(null);

  // Modals state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<DeployedSite | null>(null);

  const [shareSite, setShareSite] = useState<DeployedSite | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');

  const [deleteModalSite, setDeleteModalSite] = useState<DeployedSite | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Standalone Quick Preview Modal
  const [quickPreviewSite, setQuickPreviewSite] = useState<DeployedSite | null>(null);

  // Deploy guide modal & auth error banner
  const [deployGuideOpen, setDeployGuideOpen] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Check URL pathname (/s/:slug), subdomain, hash (#/s/:slug), or search params (?site=:slug)
  useEffect(() => {
    const handleLocationChange = () => {
      setPublicSlug(extractSlugFromLocation());
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
      if (user) {
        loadSites(user.uid);
      } else {
        setSites([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadSites = async (userId: string) => {
    try {
      setLoadingSites(true);
      const userSites = await getUserSites(userId);
      setSites(userSites);
    } catch (err) {
      console.error('Failed to load user sites:', err);
    } finally {
      setLoadingSites(false);
    }
  };

  const getPublicUrl = (slug: string) => {
    return getPublicSiteUrl(slug);
  };

  const handleOpenCreate = () => {
    setEditingSite(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (site: DeployedSite) => {
    setEditingSite(site);
    setEditorOpen(true);
  };

  const handleSiteSaved = (savedSite: DeployedSite) => {
    setSites((prev) => {
      const idx = prev.findIndex((s) => s.id === savedSite.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedSite;
        return copy;
      }
      return [savedSite, ...prev];
    });
    showToast(editingSite ? 'Fail HTML berjaya dikemaskini!' : 'Laman HTML berjaya dideploy!');
  };

  const handleConfirmDelete = async (siteId: string) => {
    try {
      setDeleting(true);
      await deleteSite(siteId);
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      setDeleteModalSite(null);
      showToast('Laman berjaya dipadam.');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Gagal memadam laman. Sila cuba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = (site: DeployedSite, url: string) => {
    setShareSite(site);
    setShareUrl(url);
  };

  // Computed metrics
  const totalSizeBytes = sites.reduce((acc, s) => acc + (s.fileSizeBytes || 0), 0);
  const filteredSites = sites.filter((s) => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If viewing a public site directly
  if (publicSlug) {
    return (
      <PublicSiteViewer
        slug={publicSlug}
        isLoggedIn={Boolean(currentUser)}
        onBackToDashboard={() => {
          window.history.pushState({}, '', '/');
          setPublicSlug(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        loadingAuth={loadingAuth}
        onOpenCreateModal={handleOpenCreate}
        siteCount={sites.length}
        onAuthError={(msg) => setAuthErrorMsg(msg)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authErrorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-100">{authErrorMsg}</p>
                {authErrorMsg.includes('Authorized domains') && (
                  <button
                    type="button"
                    onClick={() => setDeployGuideOpen(true)}
                    className="text-indigo-300 hover:text-indigo-200 underline font-medium"
                  >
                    Lihat langkah tambah domain Vercel / Netlify di sini
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuthErrorMsg(null)}
              className="self-end sm:self-center p-1 text-rose-300 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!currentUser && !loadingAuth ? (
          /* Landing & Welcome Section for Non-Logged In Users */
          <div className="space-y-16 py-6 sm:py-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sokongan Vercel, Netlify & Firebase · Akaun Google Peribadi</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Simpan & Deploy Fail HTML <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                  Untuk Akses Awam Serta-merta
                </span>
              </h1>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Muat naik atau bina fail HTML anda dan dapatkan pautan domain rawak untuk akses awam serta-merta di Vercel, Netlify, atau Firebase. Setiap fail disimpan selamat mengikut akaun Google anda.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={async () => {
                    try {
                      setAuthErrorMsg(null);
                      await loginWithGoogle();
                    } catch (e) {
                      console.error(e);
                      setAuthErrorMsg(getAuthErrorMessage(e));
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2.5"
                >
                  <LogIn className="w-4 h-4" />
                  Log Masuk dengan Google Sekarang
                </button>
              </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Privasi Akaun Google</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fail HTML anda diselaraskan secara selamat mengikut akaun Google peribadi anda. Pengguna lain tidak boleh melihat atau mengusik fail di dashboard anda.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Kemas Kini Kekal URL Sama</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bila-bila masa anda ingin membaiki atau menambah baik kod HTML, domain unik anda tidak berubah. Pautan yang telah dikongsi akan sentiasa terkini.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Pratinjau Sebelum Simpan</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sediakan butang pratinjau responsif (Desktop, Tablet, Telefon) untuk menyemak rupa bentuk fail HTML sebelum anda menekan butang deploy.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* User Dashboard */
          <div className="space-y-8">
            {/* Header / Stats Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Papan Pemuka Laman HTML
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Urus, kemas kini, dan kongsi fail HTML awam anda dengan domain rawak.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Deploy HTML Baharu
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Jumlah Laman Dihoskan</div>
                  <div className="text-lg font-bold text-white font-mono">{sites.length}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Jumlah Ruang HTML</div>
                  <div className="text-lg font-bold text-white font-mono">{formatBytes(totalSizeBytes)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Status Akses Awam</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Aktif & Sedia
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari mengikut tajuk atau domain rawak..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <span className="text-xs text-slate-500 font-mono self-end sm:self-center">
                Menunjukkan {filteredSites.length} daripada {sites.length} laman
              </span>
            </div>

            {/* Sites Grid or Empty State */}
            {loadingSites ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs">Memuatkan senarai fail HTML anda...</p>
              </div>
            ) : filteredSites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    onEdit={handleOpenEdit}
                    onPreview={(s) => setQuickPreviewSite(s)}
                    onDelete={(s) => setDeleteModalSite(s)}
                    onShare={handleShare}
                    getPublicUrl={getPublicUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-white">
                    {searchQuery ? 'Tiada laman sepadan' : 'Belum Ada Laman HTML'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {searchQuery 
                      ? 'Cuba ubah kata carian anda.'
                      : 'Mulakan dengan memuat naik fail .html atau pilih templat yang disediakan.'}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Deploy HTML Sekarang
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span>HostDeploy · Hos Aktif: {getPlatformLabel()}</span>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => setDeployGuideOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline transition"
            >
              Panduan Deploy Vercel & Netlify
            </button>
          </div>
          <span className="font-mono text-[11px] text-slate-600">
            {currentUser ? `Log masuk sebagai: ${currentUser.email}` : 'Sedia untuk Google Sign-In'}
          </span>
        </div>
      </footer>

      {/* Editor Modal (Create / Update with Preview Before Save) */}
      {currentUser && (
        <SiteEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          siteToEdit={editingSite}
          currentUser={currentUser}
          onSiteSaved={handleSiteSaved}
        />
      )}

      {/* Share / QR Modal */}
      <ShareModal
        isOpen={Boolean(shareSite)}
        onClose={() => setShareSite(null)}
        site={shareSite}
        publicUrl={shareUrl}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteModalSite)}
        onClose={() => setDeleteModalSite(null)}
        site={deleteModalSite}
        onConfirmDelete={handleConfirmDelete}
        deleting={deleting}
      />

      {/* Deploy Guide Modal */}
      <DeployGuideModal
        isOpen={deployGuideOpen}
        onClose={() => setDeployGuideOpen(false)}
      />

      {/* Standalone Quick Preview Modal from SiteCard */}
      {quickPreviewSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-bold text-white truncate">{quickPreviewSite.title}</span>
                <span className="text-xs font-mono text-indigo-400 truncate">({getDisplayDomain(quickPreviewSite.slug)})</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getPublicUrl(quickPreviewSite.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Laman Penuh
                </a>
                <button
                  onClick={() => setQuickPreviewSite(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <PreviewPane
                htmlContent={quickPreviewSite.htmlContent}
                title={quickPreviewSite.title}
                domainSlug={quickPreviewSite.slug}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2 transition animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
