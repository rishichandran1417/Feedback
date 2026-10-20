import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Button } from '../common/Button';
import { Settings, Save, CheckCircle, Shield, Globe, FileCheck } from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings } = useSystem();

  const [collegeName, setCollegeName] = useState(settings.college_info.name);
  const [supportEmail, setSupportEmail] = useState(settings.college_info.support_email);
  const [emailDomain, setEmailDomain] = useState(settings.auth_config.allowed_email_domain);
  const [maxFileMb, setMaxFileMb] = useState(settings.file_upload_limits.max_file_size_mb);
  const [allowAnon, setAllowAnon] = useState(settings.workflow_rules.allow_anonymous);
  const [reopenDays, setReopenDays] = useState(settings.workflow_rules.reopen_window_days);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings({
      college_info: {
        ...settings.college_info,
        name: collegeName.trim(),
        support_email: supportEmail.trim(),
      },
      auth_config: {
        ...settings.auth_config,
        allowed_email_domain: emailDomain.trim().startsWith('@') ? emailDomain.trim() : `@${emailDomain.trim()}`,
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
  };

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-8">
      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>System configuration and security policies updated successfully.</span>
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
              placeholder="@college.edu"
              className="w-full max-w-sm px-3 py-2 rounded-lg border border-border font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
            <p className="text-[11px] text-ink-muted mt-1">
              Registration is restricted. Students with unverified external domains (e.g. @gmail.com) are rejected.
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

          <div className="sm:col-span-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowAnon}
                onChange={(e) => setAllowAnon(e.target.checked)}
                className="rounded border-border text-brand-700 focus:ring-brand-500 h-4 w-4"
              />
              <span className="text-ink-primary font-medium">
                Allow students to submit feedback anonymously to departments
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
          Save Configuration
        </Button>
      </div>
    </form>
  );
};
