import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Button } from '../common/Button';
import {
  Settings,
  Save,
  CheckCircle,
  Shield,
  Globe,
  FileCheck,
  Database,
  RefreshCw,
  Server,
  AlertTriangle,
} from 'lucide-react';
import {
  isUsingRealSupabase,
  supabaseUrl,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  getSupabaseCredentials,
} from '../../lib/supabase';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings } = useSystem();

  const [collegeName, setCollegeName] = useState(
    settings.college_info?.name && !settings.college_info.name.includes('Apex')
      ? settings.college_info.name
      : 'College of Engineering Trivandrum'
  );
  const [supportEmail, setSupportEmail] = useState(
    settings.college_info?.support_email && !settings.college_info.support_email.includes('college.edu')
      ? settings.college_info.support_email
      : 'grievance@cet.ac.in'
  );
  const [emailDomain, setEmailDomain] = useState(
    settings.auth_config?.allowed_email_domain && !settings.auth_config.allowed_email_domain.includes('college.edu')
      ? settings.auth_config.allowed_email_domain
      : '@cet.ac.in'
  );
  const [maxFileMb, setMaxFileMb] = useState(settings.file_upload_limits.max_file_size_mb);
  const [allowAnon, setAllowAnon] = useState(settings.workflow_rules.allow_anonymous);
  const [reopenDays, setReopenDays] = useState(settings.workflow_rules.reopen_window_days);

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Supabase connection credentials
  const currentCreds = getSupabaseCredentials();
  const [customUrl, setCustomUrl] = useState(currentCreds.url || '');
  const [customKey, setCustomKey] = useState(currentCreds.key || '');
  const [showDbConfig, setShowDbConfig] = useState(false);

  // Sync inputs with settings when settings changes
  useEffect(() => {
    setCollegeName(
      settings.college_info?.name && !settings.college_info.name.includes('Apex')
        ? settings.college_info.name
        : 'College of Engineering Trivandrum'
    );
    setSupportEmail(
      settings.college_info?.support_email && !settings.college_info.support_email.includes('college.edu')
        ? settings.college_info.support_email
        : 'grievance@cet.ac.in'
    );
    setEmailDomain(
      settings.auth_config?.allowed_email_domain && !settings.auth_config.allowed_email_domain.includes('college.edu')
        ? settings.auth_config.allowed_email_domain
        : '@cet.ac.in'
    );
    setMaxFileMb(settings.file_upload_limits.max_file_size_mb);
    setAllowAnon(settings.workflow_rules.allow_anonymous);
    setReopenDays(settings.workflow_rules.reopen_window_days);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateSettings({
        college_info: {
          ...settings.college_info,
          name: collegeName.trim(),
          support_email: supportEmail.trim(),
        },
        auth_config: {
          ...settings.auth_config,
          allowed_email_domain: emailDomain.trim().startsWith('@')
            ? emailDomain.trim()
            : `@${emailDomain.trim()}`,
        },
        file_upload_limits: {
          ...settings.file_upload_limits,
          max_file_size_mb: Number(maxFileMb) || 10,
        },
        workflow_rules: {
          ...settings.workflow_rules,
          allow_anonymous: allowAnon,
          reopen_window_days: Number(reopenDays) || 14,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDbCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl || !customKey) return;
    saveSupabaseCredentials(customUrl, customKey);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Live Branding Reflection Banner */}
      <div className="bg-brand-50/70 border border-brand-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-900">
              Active Portal Identity
            </p>
            <p className="text-sm font-bold text-ink-primary">
              {settings.college_info.name || 'College of Engineering Trivandrum'}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          Live in Headers
        </span>
      </div>

      {/* Supabase Database Connection Card */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-700" />
            <h3 className="text-sm font-semibold text-ink-primary">
              Supabase Backend & Storage Engine
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowDbConfig(!showDbConfig)}
            className="text-xs font-medium text-brand-700 hover:text-brand-900 cursor-pointer"
          >
            {showDbConfig ? 'Hide Connection Details' : 'Configure Connection'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isUsingRealSupabase ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
              }`}>
              <Server className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-primary flex items-center gap-2">
                <span>Database Engine:</span>
                {isUsingRealSupabase ? (
                  <span className="text-emerald-700 font-bold">Connected to Supabase PostgreSQL</span>
                ) : (
                  <span className="text-slate-700 font-bold">Local Database Engine</span>
                )}
              </p>
              <p className="text-[11px] text-ink-muted font-mono truncate max-w-sm sm:max-w-md">
                {isUsingRealSupabase ? supabaseUrl : 'Using integrated mock PostgreSQL engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUsingRealSupabase ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Live Cloud Sync
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Local Mode
              </span>
            )}
          </div>
        </div>

        {showDbConfig && (
          <form onSubmit={handleSaveDbCreds} className="pt-2 border-t border-border space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Supabase Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-lg border border-border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Supabase Anon / Publishable Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-lg border border-border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {currentCreds.isValid && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={clearSupabaseCredentials}
                >
                  Clear & Use Local
                </Button>
              )}
              <Button type="submit" variant="primary" size="sm">
                Save & Connect Supabase
              </Button>
            </div>
          </form>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>System configuration, branding, and security policies updated successfully in Supabase.</span>
          </div>
        )}

        {/* College Identity */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-700" />
            College Portal Identity & Branding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-ink-primary mb-1">
                Institution Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
              <p className="text-[11px] text-ink-muted mt-1">
                Updates top navigation bar, email notification headers, and reports.
              </p>
            </div>

            <div>
              <label className="block font-medium text-ink-primary mb-1">
                Central Grievance Cell Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
              <p className="text-[11px] text-ink-muted mt-1">
                Official contact address included on student receipts and resolution notices.
              </p>
            </div>
          </div>
        </div>

        {/* Student Authentication Security */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-700" />
            Authentication & Email Domain Policy
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-ink-primary mb-1">
                Enforced College Email Domain *
              </label>
              <input
                type="text"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                placeholder="@cet.ac.in"
                className="w-full max-w-sm px-3 py-2 rounded-lg border border-border font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
              <p className="text-[11px] text-ink-muted mt-1">
                Registration is restricted. Students with unverified external domains are rejected.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Limits & Grievance Lifecycle */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-brand-700" />
            Grievance Lifecycle & Evidence Upload Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-ink-primary mb-1">
                Maximum Attachment Size (MB)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxFileMb}
                onChange={(e) => setMaxFileMb(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-ink-primary mb-1">
                Issue Reopening Window (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={reopenDays}
                onChange={(e) => setReopenDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
