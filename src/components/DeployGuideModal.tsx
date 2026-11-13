import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Server, ShieldAlert, Globe } from 'lucide-react';
import { firebaseProjectId } from '../firebase';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedHost, setCopiedHost] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseAuthConsoleUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;

  const handleCopyHost = () => {
    navigator.clipboard.writeText(currentHost);
    setCopiedHost(true);
    setTimeout(() => setCopiedHost(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Panduan Deploy Vercel, Netlify & Firebase</h3>
              <p className="text-xs text-slate-400">Konfigurasi sedia ada untuk hos percuma di mana-mana platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <div className="font-bold text-emerald-300">
              Tiada Environment Variable Diperlukan!
            </div>
            <p className="text-slate-300">
              Anda <strong>tidak perlu</strong> mengisi apa-apa Environment Variable di Vercel atau Netlify. Semua tetapan Firebase sudah terbina siap di dalam projek ini (<code className="text-emerald-200">firebase-applet-config.json</code>). Anda hanya perlu deploy terus.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              1. Fail Konfigurasi Sedia Ada
            </div>
            <p className="text-slate-400">
              Projek ini telah dilengkapi dengan <code className="text-indigo-300">vercel.json</code>, <code className="text-indigo-300">netlify.toml</code>, <code className="text-indigo-300">public/_redirects</code> dan <code className="text-indigo-300">firebase.json</code> supaya semua pautan rawak <code className="text-emerald-300">/s/&lt;slug-rawak&gt;</code> berfungsi terus tanpa ralat 404.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              2. Satu Langkah Sahaja Selepas Deploy (Untuk Google Login)
            </div>
            <p className="text-slate-400">
              Selepas anda deploy ke Vercel atau Netlify, anda hanya perlu tambah alamat laman web baharu anda (contoh: <code className="text-slate-200">projek.vercel.app</code>) ke senarai <strong>Authorized domains</strong> dalam Firebase Authentication supaya butang Log Masuk Google berfungsi.
            </p>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-indigo-300">
              <span className="truncate flex-1 pl-1">{currentHost}</span>
              <button
                type="button"
                onClick={handleCopyHost}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-sans text-[11px] font-semibold flex items-center gap-1 shrink-0"
              >
                {copiedHost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedHost ? 'Disalin' : 'Salin Domain'}
              </button>
            </div>

            <a
              href={firebaseAuthConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <span>Buka Tetapan Authorized Domains Firebase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-white">3. Format Pautan Rawak Anda</div>
            <p className="text-slate-400">
              Setiap fail HTML yang anda deploy akan mendapat URL unik secara automatik seperti <code className="text-emerald-300">https://app-anda.vercel.app/s/swift-falcon-842</code> atau <code className="text-emerald-300">https://app-anda.netlify.app/s/swift-falcon-842</code> tanpa perlu sebarang tetapan tambahan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Faham & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
