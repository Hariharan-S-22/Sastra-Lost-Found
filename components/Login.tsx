
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, loginUser } from '../services/authService.ts';
import { User } from '../types.ts';
import { BRANCHES, YEARS } from '../constants.ts';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const [name, setName] = useState('');
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [residency, setResidency] = useState<'Hosteller' | 'Day Scholar'>('Hosteller');

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if ('error' in result) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.onboarded) {
        onLoginSuccess(result);
        navigate('/');
      } else {
        setPendingUser(result);
        setName(result.name || '');
        setStep(2);
      }
    } catch (e: any) {
      setError('Registry connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!hasAgreed) {
      setError('Acknowledgment required.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!pendingUser) return;

    setIsLoading(true);

    try {
      const user = await loginUser(pendingUser, {
        name: name.trim(),
        branch,
        yearOfStudy: year,
        residency: residency,
        onboarded: true,
        theme
      });
      
      if (user) {
        onLoginSuccess(user);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError('Profile synchronization failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center flex-col gap-4">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-900 dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Registry Identity...</p>
        </div>
      )}

      <button
        onClick={onToggleTheme}
        className="fixed top-6 right-6 p-3 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all z-[60]"
      >
        <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
      </button>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row transition-all duration-700 animate-in fade-in zoom-in">
        
        <div className="md:w-5/12 bg-blue-900 p-12 md:p-16 text-center text-white relative flex flex-col items-center justify-center overflow-hidden">
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-14 h-14 bg-white/10 rounded-[1.25rem] border border-white/20 flex items-center justify-center mb-10 backdrop-blur-md shadow-xl animate-float">
              <i className="fas fa-university text-xl"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.35em] mb-8 leading-[1.2]">
              REGISTRY<br/>PORTAL
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">SASTRA UNIVERSITY</p>
          </div>
        </div>

        <div className="md:w-7/12 p-10 md:p-20 flex flex-col justify-center bg-white dark:bg-slate-900">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full max-w-md mx-auto">
              <div className="mb-14 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Registry Access</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Institutional Verification Required</p>
              </div>
              
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 py-6 rounded-full font-black uppercase tracking-widest text-[10px] hover:border-blue-500 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Sign In with SASTRA Email</span>
              </button>

              {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 border border-red-100 text-center justify-center animate-bounce">
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-12 duration-700 w-full max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Initialize Profile</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] opacity-70">One-time Registry configuration</p>
              </div>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 text-slate-700 dark:text-white"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 text-slate-700 dark:text-white"
                    >
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Residency</label>
                  <div className="flex gap-2">
                    {['Hosteller', 'Day Scholar'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setResidency(opt as any)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition ${residency === opt ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 mt-0.5 rounded accent-blue-900" 
                    checked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
                  />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                    I affirm this data is accurate and linked to my SASTRA identity.
                  </span>
                </label>

                {error && <p className="text-red-500 text-[9px] font-black uppercase text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading || !hasAgreed}
                  className="w-full bg-blue-900 text-white py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-blue-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  Finalize Profile
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
