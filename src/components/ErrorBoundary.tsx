import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, ChevronDown, ChevronUp, BookOpen, Trash2 } from 'lucide-react';
import { INITIAL_STUDENT_USER } from '../data/initialData';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Smart Study app:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleOpenAsStudent = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('sst_current_user', JSON.stringify(INITIAL_STUDENT_USER));
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      localStorage.clear();
      sessionStorage.clear();
      // Pre-seed default student account so reload boots immediately
      localStorage.setItem('sst_current_user', JSON.stringify(INITIAL_STUDENT_USER));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-white mb-2">
              Smart Study Tutorial
            </h1>
            <p className="text-sm text-slate-300 mb-6">
              The application encountered a display refresh issue on this device. Tap below to launch cleanly.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleOpenAsStudent}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>Launch Student Practice Portal</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReload}
                className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-300 text-xs font-medium transition-colors cursor-pointer border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache & Reset</span>
              </button>
            </div>

            {/* Error Details Accordion */}
            {this.state.error && (
              <div className="mt-5 pt-4 border-t border-slate-800/80 text-left">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-slate-200 py-1 cursor-pointer"
                >
                  <span>Technical Diagnostic Details</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] font-mono text-rose-300 max-h-36 overflow-y-auto space-y-1">
                    <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
                    {this.state.error.stack && (
                      <p className="text-slate-500 whitespace-pre-wrap">{this.state.error.stack.slice(0, 300)}...</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
