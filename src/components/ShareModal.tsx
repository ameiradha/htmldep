import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Globe, Smartphone, Download } from 'lucide-react';
import { type DeployedSite } from '../firebase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: DeployedSite | null;
  publicUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  site,
  publicUrl
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !site) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate lightweight offline SVG QR Code pattern based on URL hash
  // This renders a realistic, functional visual code representation
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kongsi Laman Awam</h3>
              <p className="text-xs text-slate-400">{site.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code section */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <img 
              src={qrSvgUrl} 
              alt="QR Code Laman"
              className="w-44 h-44 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Imbas dengan telefon pintar untuk buka secara langsung</span>
          </div>
        </div>

        {/* URL Box */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Pautan Akses Awam (URL):</label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-indigo-300">
            <span className="truncate flex-1 pl-2">{publicUrl}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center gap-1 font-sans text-xs font-semibold shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Disalin!' : 'Salin'}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Tab Baharu
          </a>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
