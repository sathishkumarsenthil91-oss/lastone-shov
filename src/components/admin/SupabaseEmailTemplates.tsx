import React, { useState, useMemo } from 'react';
import { 
  SUPABASE_EMAIL_TEMPLATES, 
  SUPABASE_EMAIL_VARIABLES_SPEC, 
  SupabaseEmailTemplate,
  renderEmailPreview 
} from '../../data/supabaseEmailTemplates';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Code, 
  Eye, 
  RotateCcw, 
  Send, 
  Layers, 
  FileText, 
  KeyRound, 
  CheckCircle2, 
  Settings, 
  AlertCircle,
  HelpCircle,
  Download,
  Info
} from 'lucide-react';

export const SupabaseEmailTemplates: React.FC = () => {
  const { addNotification, user } = useAuth();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('confirm-signup');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'AUTH' | 'SECURITY'>('ALL');
  const [viewMode, setViewMode] = useState<'RENDERED' | 'HTML' | 'PLAIN_TEXT' | 'GUIDE'>('RENDERED');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Custom edited states (initialized from selected template)
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customHtml, setCustomHtml] = useState<string>('');
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Test send simulation modal
  const [testEmailAddress, setTestEmailAddress] = useState<string>(user?.email || 'student@shov.college.edu');
  const [isTestSending, setIsTestSending] = useState(false);

  // Find active template
  const currentTemplate = useMemo(() => {
    return SUPABASE_EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId) || SUPABASE_EMAIL_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Sync state whenever template changes
  React.useEffect(() => {
    setCustomSubject(currentTemplate.defaultSubject);
    setCustomHtml(currentTemplate.htmlBody);
    setCustomVariables({ ...currentTemplate.previewMockData });
  }, [currentTemplate]);

  // Filter templates list
  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'AUTH') return SUPABASE_EMAIL_TEMPLATES.filter(t => t.category === 'authentication');
    if (activeCategory === 'SECURITY') return SUPABASE_EMAIL_TEMPLATES.filter(t => t.category === 'security');
    return SUPABASE_EMAIL_TEMPLATES;
  }, [activeCategory]);

  // Interpolate preview HTML
  const interpolatedHtml = useMemo(() => {
    return renderEmailPreview(customHtml, customVariables);
  }, [customHtml, customVariables]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    addNotification('Copied to Clipboard', `${label} copied successfully. Paste into Supabase dashboard.`, 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleResetToDefault = () => {
    setCustomSubject(currentTemplate.defaultSubject);
    setCustomHtml(currentTemplate.htmlBody);
    setCustomVariables({ ...currentTemplate.previewMockData });
    addNotification('Template Reset', `Reset ${currentTemplate.name} to SHOV default styling.`, 'info');
  };

  const handleInsertVariable = (variableTag: string) => {
    setCustomHtml(prev => prev + `\n${variableTag}`);
    addNotification('Variable Added', `Appended ${variableTag} into template code.`, 'info');
  };

  const handleVariableChange = (key: string, val: string) => {
    setCustomVariables(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSimulateSend = () => {
    setIsTestSending(true);
    setTimeout(() => {
      setIsTestSending(false);
      addNotification(
        `Email Dispatched: ${customSubject}`,
        `Simulated Supabase SMTP message sent to ${testEmailAddress} with active token (${customVariables['Token'] || 'CONFIRMED'}).`,
        'success'
      );
    }, 700);
  };

  const handleDownloadAllTemplates = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SUPABASE_EMAIL_TEMPLATES, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "shov-supabase-auth-email-templates.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addNotification('Templates Exported', 'Downloaded all 13 Supabase Auth Email Templates (JSON).', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-black uppercase tracking-widest border border-blue-500/30 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-blue-400" />
                <span>SUPABASE AUTH CONFIGURATION</span>
              </span>
              <span className="text-xs text-slate-400 font-bold">13 Built-In Templates</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Supabase Email Templates Studio</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Design, preview, customize, and export institutional email templates for Supabase Authentication and Security Notifications with live variable interpolation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadAllTemplates}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export All 13 (.JSON)</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/eviprapchoufgatgvcwk/auth/templates"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase Auth Dashboard</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Editor/Preview Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Template Catalog Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Category Filter Pills */}
          <div className="p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-1">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All (13)
            </button>
            <button
              onClick={() => setActiveCategory('AUTH')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'AUTH'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Auth (6)
            </button>
            <button
              onClick={() => setActiveCategory('SECURITY')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'SECURITY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Security (7)
            </button>
          </div>

          {/* Template List Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 max-h-[700px] overflow-y-auto shadow-sm">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Supabase Template</span>
              <span>Category</span>
            </div>

            {filteredTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    template.category === 'authentication'
                      ? (isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400')
                      : (isSelected ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400')
                  }`}>
                    {template.category === 'authentication' ? (
                      <KeyRound className="w-4 h-4" />
                    ) : (
                      <ShieldAlert className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {template.name}
                      </p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono uppercase shrink-0 ${
                        template.category === 'authentication'
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {template.category === 'authentication' ? 'Auth' : 'Security'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {template.supportedVariables.length} variables
                      </span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {template.supabasePath.split('→').pop()?.trim()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Variable Reference Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Supabase Variables Quick-Copy
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Click any variable tag to copy or insert into your template code:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {SUPABASE_EMAIL_VARIABLES_SPEC.map((v) => (
                <button
                  key={v.name}
                  onClick={() => handleCopy(v.name, v.name)}
                  title={v.description}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700/60 font-mono text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{v.name}</span>
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Studio Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Action Ribbon & Navigation */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
            
            {/* Top row: Name, Path & Quick Copy Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {currentTemplate.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                    currentTemplate.category === 'authentication'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {currentTemplate.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="text-blue-500">Path:</span> {currentTemplate.supabasePath}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleCopy(customSubject, 'Subject Line')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === 'Subject Line' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Subject</span>
                </button>

                <button
                  onClick={() => handleCopy(customHtml, 'HTML Template')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === 'HTML Template' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy HTML for Supabase</span>
                </button>

                <button
                  onClick={handleResetToDefault}
                  title="Reset to default SHOV styling"
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subject Input Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Subject Line:
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* View Mode Switcher + Device Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                <button
                  onClick={() => setViewMode('RENDERED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'RENDERED'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Render</span>
                </button>

                <button
                  onClick={() => setViewMode('HTML')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'HTML'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>HTML Source</span>
                </button>

                <button
                  onClick={() => setViewMode('PLAIN_TEXT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'PLAIN_TEXT'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Plain Text</span>
                </button>

                <button
                  onClick={() => setViewMode('GUIDE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'GUIDE'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Setup Guide</span>
                </button>
              </div>

              {viewMode === 'RENDERED' && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* VIEW: LIVE RENDER */}
          {viewMode === 'RENDERED' && (
            <div className="space-y-4">
              
              {/* Dynamic Variables Sandbox Inputs */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Live Variable Interpolation Sandbox</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Edits update the preview in real-time</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {Object.entries(customVariables).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 truncate">
                        {`{{ .${key} }}`}
                      </label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rendered Email Frame */}
              <div className="p-4 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center min-h-[500px]">
                <div 
                  className={`w-full transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'max-w-sm rounded-3xl border-4 border-slate-700 overflow-hidden shadow-2xl' : 'max-w-2xl rounded-2xl overflow-hidden'
                  }`}
                >
                  {/* Simulated Email Client Bar */}
                  <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-mono text-[11px] ml-2 text-slate-300 truncate max-w-xs">
                        Subject: {customSubject}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">From: auth@shov.college.edu</span>
                  </div>

                  {/* Rendered HTML Container */}
                  <div 
                    className="overflow-y-auto max-h-[600px] bg-slate-900"
                    dangerouslySetInnerHTML={{ __html: interpolatedHtml }}
                  />
                </div>
              </div>

              {/* Simulation Dispatcher */}
              <div className="p-4 rounded-3xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <Send className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    Test Delivery Simulator:
                  </span>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="student@shov.college.edu"
                    className="px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleSimulateSend}
                  disabled={isTestSending}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTestSending ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isTestSending ? 'Dispatching Test...' : 'Send Live Test'}</span>
                </button>
              </div>

            </div>
          )}

          {/* VIEW: HTML SOURCE CODE */}
          {viewMode === 'HTML' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-blue-500" />
                  <span>HTML Email Template Source Code (Ready for Supabase)</span>
                </span>
                <button
                  onClick={() => handleCopy(customHtml, 'HTML Template')}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All HTML</span>
                </button>
              </div>

              <textarea
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                rows={22}
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                spellCheck={false}
              />
            </div>
          )}

          {/* VIEW: PLAIN TEXT */}
          {viewMode === 'PLAIN_TEXT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Plain Text Fallback Template</span>
                </span>
                <button
                  onClick={() => handleCopy(currentTemplate.plainTextBody, 'Plain Text Template')}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Plain Text</span>
                </button>
              </div>

              <textarea
                readOnly
                value={currentTemplate.plainTextBody}
                rows={12}
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed"
              />
            </div>
          )}

          {/* VIEW: SETUP & CONFIGURATION GUIDE */}
          {viewMode === 'GUIDE' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>How to Apply Email Templates in Supabase</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Follow these steps to copy your customized SHOV templates into your active Supabase project.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Navigate to Supabase Auth Email Templates</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 pl-7">
                    Open your Supabase Project Dashboard → Go to <strong>Authentication</strong> in the sidebar → Select <strong>Email Templates</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Select the Target Template</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 pl-7">
                    Select <strong>{currentTemplate.name}</strong> from the template dropdown list.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Paste Subject & HTML Content</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 pl-7">
                    Click <strong>"Copy Subject"</strong> and <strong>"Copy HTML for Supabase"</strong> from this studio, paste into the respective fields in Supabase, and click <strong>Save</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Security Notifications Requirement</span>
                  </p>
                  <p className="text-amber-800 dark:text-amber-400 pl-6 text-[11px] leading-relaxed">
                    Security notification emails (Password changed, Email changed, Phone changed, MFA methods, Provider links) are only dispatched by Supabase if the respective security notifications have been enabled in your project's Auth settings.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
