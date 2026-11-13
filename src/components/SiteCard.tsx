import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  QrCode,
  Clock,
  HardDrive
} from 'lucide-react';
import { type DeployedSite } from '../firebase';
import { formatBytes, formatDateRelative, getDisplayDomain } from '../utils';

interface SiteCardProps {
  site: DeployedSite;
  onEdit: (site: DeployedSite) => void;
  onPreview: (site: DeployedSite) => void;
  onDelete: (site: DeployedSite) => void;
  onShare: (site: DeployedSite, publicUrl: string) => void;
  getPublicUrl: (slug: string) => string;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onEdit,
  onPreview,
  onDelete,
  onShare,
  getPublicUrl
}) => {
  const [copied, setCopied] = useState(false);
  const publicUrl = getPublicUrl(site.slug);
  const displayDomain = getDisplayDomain(site.slug);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([site.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition">
                {site.title}
              </h3>
              <p className="text-xs text-indigo-400 font-mono truncate" title={publicUrl}>
                {displayDomain}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            v{site.version}
          </span>
        </div>

        {site.description && (
          <p className="text-xs text-slate-400 line-clamp-2">
            {site.description}
          </p>
        )}

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1 font-mono">
            <HardDrive className="w-3 h-3 text-slate-400" />
            {formatBytes(site.fileSizeBytes)}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatDateRelative(site.updatedAt)}
          </span>
          <span>·</span>
          <span className="text-emerald-400/90 font-medium">Aktif</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
            title="Buka URL Awam dalam Tab Baharu"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => onPreview(site)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Pratinjau Laman"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCopyUrl}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Salin Pautan Awam"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onShare(site, publicUrl)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Kod QR & Kongsi"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Muat Turun Fail .html"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(site)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            title="Kemaskini fail HTML dengan mengekalkan URL sedia ada"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kemaskini</span>
          </button>

          <button
            onClick={() => onDelete(site)}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Padam Laman"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
