import React from 'react';
import { Trash2 } from 'lucide-react';
import { type DeployedSite } from '../firebase';
import { getDisplayDomain } from '../utils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: DeployedSite | null;
  onConfirmDelete: (siteId: string) => Promise<void>;
  deleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  site,
  onConfirmDelete,
  deleting
}) => {
  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-base font-bold text-white">Padam Fail HTML Ini?</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Adakah anda pasti mahu memadam laman <span className="font-semibold text-slate-200">"{site.title}"</span>? Pautan domain awam <span className="font-mono text-rose-400 break-all">{getDisplayDomain(site.slug)}</span> tidak lagi boleh diakses. Tindakan ini tidak boleh dipulihkan.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(site.id)}
            disabled={deleting}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memadam...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Padam Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
