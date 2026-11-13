import React, { useState, useEffect, useRef } from 'react';
import { type User } from 'firebase/auth';
import { 
  X, 
  Upload, 
  Eye, 
  Code, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Lock, 
  FileCode2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Sliders,
  Columns
} from 'lucide-react';
import { type DeployedSite, createSite, updateSite } from '../firebase';
import { generateRandomSlug, formatBytes, getDisplayDomain, STARTER_TEMPLATES, type HtmlTemplate } from '../utils';
import { PreviewPane } from './PreviewPane';

interface SiteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteToEdit: DeployedSite | null;
  currentUser: User;
  onSiteSaved: (site: DeployedSite) => void;
}

type TabMode = 'editor' | 'preview' | 'split';

export const SiteEditorModal: React.FC<SiteEditorModalProps> = ({
  isOpen,
  onClose,
  siteToEdit,
  currentUser,
  onSiteSaved
}) => {
  const isEditing = Boolean(siteToEdit);
  const [slug, setSlug] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabMode>('editor');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      if (siteToEdit) {
        setSlug(siteToEdit.slug);
        setTitle(siteToEdit.title);
        setDescription(siteToEdit.description || '');
        setHtmlContent(siteToEdit.htmlContent);
      } else {
        setSlug(generateRandomSlug());
        setTitle('Laman HTML Baharu');
        setDescription('');
        setHtmlContent(STARTER_TEMPLATES[0].html);
      }
      setActiveTab('editor');
      setErrorMsg(null);
      setShowTemplates(false);
    }
  }, [isOpen, siteToEdit]);

  if (!isOpen) return null;

  const handleRerollSlug = () => {
    if (!isEditing) {
      setSlug(generateRandomSlug());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setErrorMsg('Sila muat naik fail berformat .html atau .htm sahaja.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);
      
      // Auto-extract title from <title> if present
      const match = content.match(/<title>(.*?)<\/title>/i);
      if (match && match[1]) {
        setTitle(match[1].trim());
      } else {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca fail yang dimuat naik.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setHtmlContent(content);
        const match = content.match(/<title>(.*?)<\/title>/i);
        if (match && match[1]) {
          setTitle(match[1].trim());
        } else {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleApplyTemplate = (tmpl: HtmlTemplate) => {
    setHtmlContent(tmpl.html);
    setTitle(tmpl.name);
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Sila masukkan tajuk laman.');
      return;
    }
    if (!htmlContent.trim()) {
      setErrorMsg('Kandungan fail HTML tidak boleh kosong.');
      return;
    }

    // Size check (<1MB for Firestore safety)
    const contentBytes = new Blob([htmlContent]).size;
    if (contentBytes > 1048576) {
      setErrorMsg(`Saiz fail (${formatBytes(contentBytes)}) melebihi had maksimum 1 MB.`);
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      if (isEditing && siteToEdit) {
        // Update existing site while retaining exact same slug & URL
        await updateSite({
          siteId: siteToEdit.id,
          title,
          htmlContent,
          currentVersion: siteToEdit.version,
          description,
        });

        const updated: DeployedSite = {
          ...siteToEdit,
          title,
          htmlContent,
          description,
          fileSizeBytes: contentBytes,
          version: siteToEdit.version + 1,
          updatedAt: new Date(),
        };
        onSiteSaved(updated);
      } else {
        // Create new site with random slug
        const created = await createSite({
          slug,
          title,
          htmlContent,
          description,
          user: currentUser,
        });
        onSiteSaved(created);
      }
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg(err.message || 'Gagal menyimpan fail HTML. Sila cuba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="w-full max-w-6xl h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isEditing ? 'Kemaskini Fail HTML' : 'Deploy Laman HTML Baharu'}
                {isEditing && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    URL Dikekalkan
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing 
                  ? 'Kemas kini kod HTML anda tanpa mengubah pautan awam sedia ada.'
                  : 'Fail HTML akan dideploy serta-merta dengan domain rawak unik.'}
              </p>
            </div>
          </div>

          {/* Mode Switchers: Editor | Pratinjau | Split */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Kod HTML
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau Fail
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'split'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Belah Skrin (Split)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Domain Information */}
          <div className="flex items-center gap-2 max-w-full">
            <span className="text-slate-400 font-medium shrink-0">URL Awam Rawak:</span>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-indigo-300 max-w-[260px] sm:max-w-sm">
              {isEditing ? <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : null}
              <span className="truncate" title={getDisplayDomain(slug)}>{getDisplayDomain(slug)}</span>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleRerollSlug}
                  className="ml-1 p-0.5 text-slate-400 hover:text-indigo-400 transition shrink-0"
                  title="Jana Domain Rawak Lain"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {isEditing && (
              <span className="text-[11px] text-amber-400/90 hidden md:inline">
                (URL ini kekal sama walaupun fail dikemaskini)
              </span>
            )}
          </div>

          {/* Title input */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <span className="text-slate-400 font-medium shrink-0">Tajuk:</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth: Laman Web Saya"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick upload & templates buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".html,.htm"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Muat Naik Fail .html
            </button>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pilih Templat
            </button>
          </div>
        </div>

        {/* Template selector dropdown drawer */}
        {showTemplates && (
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Pilih Templat HTML Siap Pasang:
              </span>
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Tutup
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {STARTER_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl cursor-pointer transition group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400">
                    {tmpl.name}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message notification */}
        {errorMsg && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col">
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">index.html ({formatBytes(new Blob([htmlContent]).size)})</span>
                <span className="text-slate-500 text-[11px]">Boleh taip kod terus atau tarik & lepas fail .html ke sini</span>
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Tampal atau taip kod HTML di sini..."
                className="flex-1 w-full p-4 font-mono text-xs sm:text-sm bg-transparent text-slate-100 resize-none focus:outline-none selection:bg-indigo-600 selection:text-white leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col">
              <PreviewPane
                htmlContent={htmlContent}
                title={title}
                domainSlug={slug}
                className="flex-1"
              />
            </div>
          )}

          {activeTab === 'split' && (
            <div className="flex-1 grid grid-cols-2 gap-4 h-full">
              {/* Left: Code Editor */}
              <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">Editor Kod</span>
                  <span className="font-mono">{formatBytes(new Blob([htmlContent]).size)}</span>
                </div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Tampal atau taip kod HTML di sini..."
                  className="flex-1 w-full p-4 font-mono text-xs bg-transparent text-slate-100 resize-none focus:outline-none selection:bg-indigo-600 selection:text-white leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Right: Live Preview */}
              <div className="flex flex-col">
                <PreviewPane
                  htmlContent={htmlContent}
                  title={title}
                  domainSlug={slug}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>
              {isEditing 
                ? 'Perubahan akan aktif serta merta pada URL yang sama.'
                : 'Laman akan boleh diakses awam serta-merta selepas deploy.'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Butang Pratinjau Cepat */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'editor' : 'preview')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              {activeTab === 'preview' ? 'Kembali ke Editor' : 'Pratinjau Dahulu'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEditing ? 'Mengemaskini...' : 'Mendeploy...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Simpan & Kemaskini' : 'Deploy Sekarang'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
