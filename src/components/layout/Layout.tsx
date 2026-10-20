import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  pageTitle?: string;
  pageDescription?: string;
  headerAction?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  pageTitle,
  pageDescription,
  headerAction,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onNavigate={onNavigate} activeTab={activeTab} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onNavigate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area with Generous Whitespace */}
        <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-10">
          {/* Mobile hamburger button */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface"
            >
              <Menu className="w-4 h-4" />
              Menu Navigation
            </button>
          </div>

          {/* Page Heading Section */}
          {pageTitle && (
            <div className="mb-8 pb-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-semibold text-ink-primary tracking-tight">
                  {pageTitle}
                </h1>
                {pageDescription && (
                  <p className="text-sm text-ink-secondary mt-1">{pageDescription}</p>
                )}
              </div>
              {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>
          )}

          {/* Children View Content */}
          <div className="space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
