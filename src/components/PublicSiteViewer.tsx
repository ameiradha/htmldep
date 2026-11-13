import React, { useEffect, useState } from 'react';
import { getSiteBySlugOrId, type DeployedSite } from '../firebase';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowLeft, 
  Code2, 
  EyeOff, 
  Eye, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { formatBytes, getDisplayDomain, getPublicSiteUrl } from '../utils';

interface PublicSiteViewerProps {
  slug: string;
  onBackToDashboard: () => void;
  isLoggedIn: boolean;
}

export const PublicSiteViewer: React.FC<PublicSiteViewerProps> = ({
  slug,
  onBackToDashboard,
  isLoggedIn
}) => {
  const [site, setSite] = useState<DeployedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    async function fetchSite() {
      try {
        setLoading(true);
        setError(null);
        const fetched = await getSiteBySlugOrId(slug);
        if (fetched) {
          setSite(fetched);
          document.title = `${fetched.title} - HostDeploy`;
        } else {
          setError('Laman web HTML ini tidak wujud atau telah dipadam oleh pemilik.');
        }
      } catch (err: any) {
        console.error('Failed to load public site:', err);
        setError('Gagal memuatkan laman web. Sila semak pautan URL anda.');
      } finally {
        setLoading(false);
      }
    }
    fetchSite();
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(getPublicSiteUrl(slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Memuatkan laman HTML awam...</p>
        <span className="text-xs text-slate-500 font-mono">{getDisplayDomain(slug)}</span>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">404: Laman Tidak Ditemui</h1>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Laman Utama
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col">
      {/* Floating Top Mini Bar */}
      {showBanner ? (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92%] sm:w-auto px-4 py-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex items-center justify-between gap-4 text-xs transition">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <div className="font-semibold text-white truncate max-w-[160px] sm:max-w-xs">
                {site.title}
              </div>
              <div className="text-[10px] text-indigo-400 font-mono truncate">
                {getDisplayDomain(site.slug)} · v{site.version}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Salin Pautan Awam"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSource(!showSource)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Lihat Kod HTML"
            >
              <Code2 className="w-4 h-4" />
            </button>

            {isLoggedIn && (
              <button
                onClick={onBackToDashboard}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </button>
            )}

            <button
              onClick={() => setShowBanner(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Sembunyikan Bar Toolbar"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowBanner(true)}
          className="absolute top-3 right-3 z-50 p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white rounded-xl shadow-lg transition"
          title="Tunjukkan Bar Toolbar"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {/* Raw HTML Source Modal */}
      {showSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-3xl w-full max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono">
                Sumber Kod ({formatBytes(site.fileSizeBytes)})
              </span>
              <button
                onClick={() => setShowSource(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Tutup
              </button>
            </div>
            <pre className="p-4 flex-1 overflow-auto text-xs font-mono text-slate-200 bg-slate-950 selection:bg-indigo-600">
              <code>{site.htmlContent}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Rendered HTML in Sandboxed Frame */}
      <iframe
        title={site.title}
        srcDoc={site.htmlContent}
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
        className="w-full h-full border-0 bg-white"
      />
    </div>
  );
};
