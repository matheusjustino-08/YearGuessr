'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  LogOut, User as UserIcon, X, Save, Settings, Flame, Trophy, Sun, Moon, Laptop,
  Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { updateAndFetchUserStreak } from '@/lib/streak-calculator';
import { useGameStore } from '@/store/useGameStore';
import { CustomSelect } from './CustomSelect';

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [isAnonimo, setIsAnonimo] = useState(false);
  const [streakAtual, setStreakAtual] = useState(0);
  const [maiorStreak, setMaiorStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guest Auth State (Email Login / Register / Password Reset)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regUsernameInput, setRegUsernameInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const themeOverride = useGameStore((state) => state.themeOverride);
  const setThemeOverride = useGameStore((state) => state.setThemeOverride);
  const colorMode = useGameStore((state) => state.colorMode);
  const setColorMode = useGameStore((state) => state.setColorMode);

  const supabase = useMemo(() => createClient(), []);
  const locale = useLocale();
  const tAuth = useTranslations('auth');
  const tNav = useTranslations('nav');
  const tSettings = useTranslations('settings');
  const tEras = useTranslations('eras');

  useEffect(() => {
    setMounted(true);

    const loadUserData = async (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        const streaks = await updateAndFetchUserStreak(supabase, currentUser.id);

        const { data: profile } = await supabase
          .from('perfis')
          .select('username, role, e_anonimo')
          .eq('id', currentUser.id)
          .single();
        
        if (profile) {
          setUsername(profile.username || currentUser.user_metadata?.full_name || '');
          setProfileRole(profile.role || 'user');
          setIsAnonimo(profile.e_anonimo ?? false);
          setStreakAtual(streaks.streak_atual);
          setMaiorStreak(streaks.maior_streak);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserData(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('perfis')
        .upsert({
          id: user.id,
          username: username.trim(),
          avatar_url: user.user_metadata?.avatar_url || '',
          e_anonimo: isAnonimo,
        });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError(tAuth('err_fill_fields'));
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput,
      });

      if (error) throw error;
      setIsOpen(false);
    } catch (err: any) {
      setAuthError(err.message || tAuth('err_invalid_login'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError(tAuth('err_fill_fields'));
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError(tAuth('err_password_short'));
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailInput.trim(),
        password: passwordInput,
        options: {
          data: {
            full_name: regUsernameInput.trim() || emailInput.split('@')[0],
            username: regUsernameInput.trim() || emailInput.split('@')[0],
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('perfis').upsert({
          id: data.user.id,
          username: regUsernameInput.trim() || emailInput.split('@')[0],
          e_anonimo: false,
        });
      }

      setAuthSuccess(tAuth('success_account_created'));
    } catch (err: any) {
      setAuthError(err.message || tAuth('err_register_failed'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setAuthError(tAuth('err_email_required'));
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailInput.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });

      if (error) throw error;
      setAuthSuccess(tAuth('success_reset_sent'));
    } catch (err: any) {
      setAuthError(err.message || tAuth('err_reset_failed'));
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`bg-card text-card-foreground border border-border/50 w-full ${user ? 'max-w-3xl' : 'max-w-md'} p-6 sm:p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto`}>
        <button 
          onClick={() => {
            setIsOpen(false);
            setAuthError(null);
            setAuthSuccess(null);
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-center tracking-tight font-serif">
          {user ? tAuth('title_logged') : (
            authMode === 'forgot' 
              ? (locale === 'en' ? 'Reset Password' : locale === 'es' ? 'Restablecer Contraseña' : 'Recuperar Senha')
              : tAuth('title_guest')
          )}
        </h2>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 items-start">
            {/* Left Column (5 cols): User Identity, Stats & Main Actions */}
            <div className="md:col-span-5 space-y-4">
              {/* User Profile Card */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                {user.user_metadata?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary">
                    <UserIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="w-full min-w-0">
                  <p className="font-bold truncate text-base text-foreground">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{user.email}</p>
                </div>
              </div>

              {/* User Stats Summary Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">{tSettings('current_streak')}</p>
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-xl font-black text-amber-500 font-mono mt-0.5">
                    {streakAtual} <span className="text-xs font-normal">{streakAtual === 1 ? tSettings('day_singular') : tSettings('days')}</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">{tSettings('best_streak')}</p>
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xl font-black text-primary font-mono mt-0.5">
                    {maiorStreak} <span className="text-xs font-normal">{maiorStreak === 1 ? tSettings('day_singular') : tSettings('days')}</span>
                  </p>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="space-y-2 pt-2">
                {username && (
                  <Link
                    href={`/perfil/${encodeURIComponent(username)}`}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all font-semibold text-xs text-center cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>{tSettings('view_public_profile')}</span>
                  </Link>
                )}

                {profileRole === 'admin' && (
                  <a
                    href={`/${locale}/admin`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 transition-all font-semibold text-xs"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{tSettings('cms_panel')}</span>
                  </a>
                )}

                <button
                  onClick={signOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors font-semibold text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{tAuth('btn_logout')}</span>
                </button>
              </div>
            </div>

            {/* Right Column (7 cols): Preferences & Settings Form */}
            <div className="md:col-span-7 space-y-4 md:border-l md:border-border/40 md:pl-6">
              {/* Appearance Mode (Light / Dark / System) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  {tSettings('theme_mode_label')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorMode('system')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      colorMode === 'system'
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{tSettings('system')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('light')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      colorMode === 'light'
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{tSettings('light')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('dark')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      colorMode === 'dark'
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{tSettings('dark')}</span>
                  </button>
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  {tSettings('username_label')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={tSettings('username_placeholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Theme Era Lock Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  {tSettings('theme_era_label')}
                </label>
                <CustomSelect
                  value={themeOverride}
                  onChange={(val) => setThemeOverride(val)}
                  options={[
                    {
                      value: 'auto',
                      label: (() => {
                        try {
                          const res = tSettings('dynamic_era');
                          if (res && !res.startsWith('settings.')) return res;
                        } catch {}
                        return 'Dinâmico (Altera conforme o ano)';
                      })()
                    },
                    {
                      value: 'era-neutral',
                      label: (() => {
                        try {
                          const res = tSettings('neutral_era');
                          if (res && !res.startsWith('settings.')) return res;
                        } catch {}
                        return locale === 'en' ? 'Neutral (No era theme changes)' : locale === 'es' ? 'Neutro (Sin cambios por era)' : 'Neutro (Sem alteração por era)';
                      })()
                    },
                    { value: 'era-medieval', label: `${tEras('medieval')} (< 1500)` },
                    { value: 'era-renaissance', label: `${tEras('renaissance')} (1500 - 1799)` },
                    { value: 'era-industrial', label: `${tEras('industrial')} (1800 - 1899)` },
                    { value: 'era-early20th', label: `${tEras('early20th')} (1900 - 1949)` },
                    { value: 'era-golden', label: `${tEras('golden')} (1950 - 1979)` },
                    { value: 'era-retro', label: `${tEras('retro')} (1980 - 1999)` },
                    { value: 'era-modern', label: `${tEras('modern')} (> 2000)` },
                  ]}
                />
              </div>

              {/* Anonymous / Privacy Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border/50 bg-muted/30">
                <div>
                  <p className="text-xs font-bold text-foreground">{tSettings('anonymous_label')}</p>
                  <p className="text-[11px] text-muted-foreground">{tSettings('anonymous_desc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonimo(!isAnonimo)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    isAnonimo ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isAnonimo ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border/50 bg-muted/30">
                <div>
                  <p className="text-xs font-bold text-foreground">{tSettings('sound_label')}</p>
                  <p className="text-[11px] text-muted-foreground">{tSettings('sound_desc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    soundEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Save Preferences Button */}
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? tSettings('saving') : tSettings('save_btn')}
              </button>

              {saveSuccess && (
                <p className="text-xs text-green-500 font-medium text-center">{tSettings('saved_success')}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-3">
            {/* Auth Tabs: Login vs Register (hidden in forgot mode) */}
            {authMode !== 'forgot' && (
              <div className="flex bg-muted/60 p-1 rounded-2xl border border-border/50 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authMode === 'login'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tAuth('tab_login')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authMode === 'register'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tAuth('tab_register')}
                </button>
              </div>
            )}

            {/* Error & Success Messages */}
            {authError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Forgot Password Mode Form */}
            {authMode === 'forgot' ? (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {locale === 'en' 
                    ? 'Enter your email address and we will send you a link to reset your password.' 
                    : locale === 'es' 
                    ? 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.' 
                    : 'Digite seu e-mail e enviaremos um link de redefinição de senha.'}
                </p>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={tAuth('email_label')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : tAuth('btn_send_reset')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{tAuth('back_to_login')}</span>
                </button>
              </form>
            ) : (
              /* Login / Register Forms */
              <form onSubmit={authMode === 'login' ? handleEmailLogin : handleEmailRegister} className="space-y-3">
                {/* Username Input (Register Only) */}
                {authMode === 'register' && (
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      value={regUsernameInput}
                      onChange={(e) => setRegUsernameInput(e.target.value)}
                      placeholder={tSettings('username_placeholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}

                {/* Email Input */}
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={tAuth('email_label')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={tAuth('password_label')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Forgot Password Link (Login Only) */}
                {authMode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {tAuth('forgot_password')}
                    </button>
                  </div>
                )}

                {/* Submit Email Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs mt-1"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authMode === 'login' ? (
                    tAuth('btn_email_login')
                  ) : (
                    tAuth('btn_email_register')
                  )}
                </button>
              </form>
            )}

            {/* OAuth Section Divider */}
            {authMode !== 'forgot' && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                    <span className="bg-card px-2 text-muted-foreground">
                      {tAuth('or_continue_with')}
                    </span>
                  </div>
                </div>

                {/* OAuth Provider Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={signInWithGithub}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-[#24292e] text-white hover:bg-[#24292e]/90 transition-all font-medium shadow-xs text-xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    {tAuth('btn_github')}
                  </button>
                  
                  <button
                    onClick={signInWithGoogle}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 transition-all font-medium shadow-xs text-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {tAuth('btn_google')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow"
      >
        {user ? (
          <>
            {user.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full border border-primary-foreground/30" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-xs">{tNav('profile')}</span>
          </>
        ) : (
          <>
            <UserIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">{tNav('login')}</span>
          </>
        )}
      </button>

      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
