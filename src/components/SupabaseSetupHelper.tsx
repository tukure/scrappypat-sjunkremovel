import { useState } from 'react';
import { supabase, SETUP_SQL } from '../utils/supabaseClient';
import { Database, Copy, Check, ExternalLink, RefreshCw, X, AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';

interface SupabaseSetupHelperProps {
  dbConnected: boolean | null;
  dbError: string | null;
  onRefresh: () => Promise<void>;
}

export default function SupabaseSetupHelper({ dbConnected, dbError, onRefresh }: SupabaseSetupHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <>
      {/* Mini Bar Status indicator */}
      <div className="bg-ink text-cream/90 border-b border-olive/20 text-[11px] px-4 py-2 font-mono flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-2">
          <Database className={`h-3.5 w-3.5 ${dbConnected ? 'text-green-400 animate-pulse' : 'text-amber-400 animate-bounce'}`} />
          <span>
            Supabase: <strong className="text-cream">{dbConnected ? 'CONNECTED' : 'TABLES MISSING / LOCAL FALLBACK'}</strong>
          </span>
          {dbConnected && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
              Live DB Synced
            </span>
          )}
          {!dbConnected && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              Needs Schema Setup
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {dbConnected === false && (
            <button
              onClick={() => setIsOpen(true)}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-ink font-bold rounded text-[10px] transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>Setup Supabase Tables</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </button>
          )}

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className={`flex items-center space-x-1 text-[10px] hover:text-cream cursor-pointer disabled:opacity-50`}
            title="Refresh database connection status"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Verifying...' : 'Re-verify'}</span>
          </button>
        </div>
      </div>

      {/* Database Setup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cream border-2 border-olive/30 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-olive/10 border-b border-olive/20 p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink text-lg leading-tight">
                    Set up Supabase Tables
                  </h3>
                  <p className="text-xs text-stone leading-relaxed">
                    Execute the schema SQL script in your Supabase project to enable persistent storage.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-ink hover:bg-stone/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="space-y-2">
                <h4 className="font-sans font-semibold text-sm text-ink flex items-center space-x-2">
                  <span className="flex items-center justify-center bg-olive text-cream rounded-full h-5 w-5 text-xs font-bold font-mono">1</span>
                  <span>Go to your Supabase SQL Editor</span>
                </h4>
                <p className="text-xs text-stone pl-7 leading-relaxed">
                  Open your Supabase dashboard for project <code className="font-mono bg-stone/10 px-1 py-0.5 rounded text-olive">yxjhmobstnqnjgkrogbk</code>. Click on the <strong>SQL Editor</strong> tab on the left sidebar, and click <strong>New Query</strong>.
                </p>
                <div className="pl-7">
                  <a
                    href="https://supabase.com/dashboard/project/yxjhmobstnqnjgkrogbk/sql/new"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-olive hover:underline"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-sans font-semibold text-sm text-ink flex items-center space-x-2">
                  <span className="flex items-center justify-center bg-olive text-cream rounded-full h-5 w-5 text-xs font-bold font-mono">2</span>
                  <span>Copy & paste this SQL schema script</span>
                </h4>
                <p className="text-xs text-stone pl-7 leading-relaxed">
                  This script creates the <code className="font-mono bg-stone/10 px-1 rounded text-ink">bookings</code> and <code className="font-mono bg-stone/10 px-1 rounded text-ink">reviews</code> tables and sets up public row-level security (RLS) policies so the frontend can read/write data.
                </p>

                <div className="pl-7 pt-1 relative group">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-ink text-cream hover:bg-olive border border-stone/30 rounded-md text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy SQL Script</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-ink border-2 border-stone/20 rounded-xl p-4 max-h-56 overflow-y-auto text-[11px] font-mono text-cream/90 leading-relaxed shadow-inner">
                    <pre>{SETUP_SQL}</pre>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-sans font-semibold text-sm text-ink flex items-center space-x-2">
                  <span className="flex items-center justify-center bg-olive text-cream rounded-full h-5 w-5 text-xs font-bold font-mono">3</span>
                  <span>Run the script and verify</span>
                </h4>
                <p className="text-xs text-stone pl-7 leading-relaxed">
                  Paste the code into the query editor, click <strong>Run</strong> in the bottom right corner of Supabase. Once completed, return here and click the re-verify button to refresh!
                </p>
              </div>

              {dbError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-600 flex items-start space-x-2 font-mono">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Current connection state: {dbError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-stone/5 border-t border-olive/10 p-4 flex justify-between items-center">
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="px-4 py-2 bg-olive hover:bg-olive-dark text-cream font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Verifying...' : 'Verify Now'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-stone/10 hover:bg-stone/20 text-ink font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Setup Instructions
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
