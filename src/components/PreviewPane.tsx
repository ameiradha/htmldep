import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, RotateCw } from 'lucide-react';
import { getDisplayDomain } from '../utils';

interface PreviewPaneProps {
  htmlContent: string;
  title: string;
  domainSlug?: string;
  className?: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  htmlContent,
  title,
  domainSlug,
  className = ''
}) => {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [reloadKey, setReloadKey] = useState<number>(0);

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[375px] h-[640px]';
      case 'tablet':
        return 'max-w-[768px] h-[640px]';
      case 'desktop':
      default:
        return 'w-full h-full min-h-[500px]';
    }
  };

  return (
    <div className={`flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Top Preview Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 gap-3 text-xs">
        {/* Device Mode Switchers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              device === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Paparan Desktop (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              device === 'tablet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Paparan Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              device === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Paparan Telefon Pintar (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Browser Mock Address Bar */}
        <div className="hidden md:flex flex-1 max-w-md items-center justify-center">
          <div className="w-full flex items-center justify-between px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px] truncate">
            <span className="truncate">
              https://{domainSlug ? getDisplayDomain(domainSlug) : 'preview.instant.run'}
            </span>
            <span className="text-emerald-400 ml-2 text-[10px] shrink-0 font-sans">
              Pratinjau Langsung
            </span>
          </div>
        </div>

        {/* Reload button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadKey(prev => prev + 1)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Muat semula pratinjau"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-900/50 p-4 flex items-center justify-center overflow-auto">
        <div
          className={`transition-all duration-200 shadow-2xl rounded-xl overflow-hidden border border-slate-800 bg-white ${getContainerWidth()}`}
        >
          <iframe
            key={reloadKey}
            title={title || 'Pratinjau HTML'}
            srcDoc={htmlContent || '<div style="font-family:sans-serif;padding:2rem;text-align:center;color:#64748b;">Tiada kandungan HTML untuk dipratonton</div>'}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full min-h-[500px] border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
