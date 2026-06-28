import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('operator@obsidian.enterprise');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <h1 className="text-headline-md text-on-surface font-bold tracking-tight">
            Obsidian Enterprise
          </h1>
          <p className="text-body-sm text-on-surface-muted mt-2">Precision RPA v4.2</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-xl p-8 shadow-2xl">
          <h2 className="text-headline-sm text-on-surface font-semibold mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-body-xs font-semibold text-on-surface-muted mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-border rounded-lg px-4 py-3 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="operator@corp.local"
              />
            </div>

            <div>
              <label className="block text-body-xs font-semibold text-on-surface-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container border border-border rounded-lg px-4 py-3 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="form-checkbox bg-surface border-border text-primary rounded-sm h-4 w-4" />
                <span className="text-body-xs text-on-surface-muted">Remember me</span>
              </label>
              <button type="button" className="text-body-xs text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-body-sm font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-body-xs text-on-surface-muted">
              Enterprise SSO available via <span className="text-primary">SAML 2.0</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-body-xs text-on-surface-muted mt-6">
          © 2026 Obsidian Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
};
