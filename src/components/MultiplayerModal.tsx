'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Users, X, PlusCircle, LogIn, ArrowRight } from 'lucide-react';

interface Props {
  triggerClassName?: string;
  triggerLabel?: string;
}

export function MultiplayerModal({ triggerClassName, triggerLabel }: Props) {
  const tMulti = useTranslations('multiplayer_modal');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateRoom = () => {
    // Generate random room code like YG-4829
    const randomCode = `YG-${Math.floor(1000 + Math.random() * 9000)}`;
    setIsOpen(false);
    router.push(`/room/${randomCode}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg(tMulti('invalid_code'));
      return;
    }
    setErrorMsg('');
    setIsOpen(false);
    router.push(`/room/${cleanCode}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ||
          'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-all cursor-pointer active:scale-95 shadow-xs font-mono'
        }
      >
        <Users className="w-4 h-4 shrink-0" />
        <span>{triggerLabel || tMulti('button')}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card/95 border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground uppercase">
                {tMulti('title')}
              </h2>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-xs mx-auto">
                {tMulti('subtitle')}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/40 border border-border/60">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('create');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'create'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{tMulti('tab_create')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('join');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'join'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{tMulti('tab_join')}</span>
              </button>
            </div>

            {/* Tab 1: Create Room */}
            {activeTab === 'create' ? (
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{tMulti('create_button')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Tab 2: Join Room */
              <form onSubmit={handleJoinRoom} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    placeholder={tMulti('join_placeholder')}
                    className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-foreground placeholder:text-muted-foreground/60 text-xs font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {errorMsg && (
                    <p className="text-[11px] text-rose-500 font-mono font-bold px-1 pt-1">
                      {errorMsg}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{tMulti('join_button')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
