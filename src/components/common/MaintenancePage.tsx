import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, RotateCw, Shield, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface MaintenancePageProps {
  message?: string;
  estimatedEnd?: string;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  message,
  estimatedEnd,
}) => {
  const displayMessage =
    message?.trim() ||
    'This website is currently under maintenance. We are performing scheduled system updates and improvements to provide you with a faster, more reliable experience.';

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-brand-600 selection:text-white">
      {/* Top Header Identity */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src="/voice-logo.png"
            alt="voice"
            className="h-8 sm:h-9 w-auto object-contain rounded-lg shadow-xs"
          />
          <div className="hidden sm:block">
            <p className="text-[11px] text-ink-muted">
              College of Engineering Trivandrum • Student Feedback & Resolution
            </p>
          </div>
        </div>

        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface/80 text-ink-secondary hover:text-ink-primary text-xs font-medium transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-brand-400" />
          <span>Admin Portal</span>
        </Link>
      </header>

      {/* Main Central Maintenance Notice Card */}
      <main className="max-w-lg mx-auto w-full my-auto py-8">
        <div className="bg-surface rounded-2xl border border-border shadow-2xl p-6 sm:p-10 text-center space-y-6 relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-400" />

          {/* Animated Icon Badge */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-400 flex items-center justify-center shadow-inner">
            <Wrench className="w-8 h-8 animate-pulse text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
            </span>
          </div>

          {/* Status Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-800/60 text-[11px] font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Scheduled Maintenance in Progress</span>
          </div>

          {/* Headings */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
              This website is under maintenance
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-md mx-auto">
              {displayMessage}
            </p>
          </div>

          {/* Estimated Completion Card if configured */}
          {estimatedEnd && (
            <div className="p-3.5 rounded-xl bg-background border border-border text-xs text-ink-secondary flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                Estimated return:{' '}
                <strong className="text-ink-primary font-semibold">{estimatedEnd}</strong>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={handleReload}
              leftIcon={<RotateCw className="w-4 h-4" />}
            >
              Check Again
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-ink-muted pt-4 border-t border-border max-w-4xl mx-auto w-full">
        College of Engineering Trivandrum • voice Grievance & Feedback Platform
      </footer>
    </div>
  );
};
