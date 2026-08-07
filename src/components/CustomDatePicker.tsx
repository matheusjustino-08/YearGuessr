'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

export function CustomDatePicker({ value, onChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to today
  const selectedDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Quick preset shortcuts
  const selectToday = () => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onChange(formatted);
    setIsOpen(false);
  };

  const selectTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formatted = tomorrow.toISOString().split('T')[0];
    setCurrentMonth(tomorrow.getMonth());
    setCurrentYear(tomorrow.getFullYear());
    onChange(formatted);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Selecionar Data';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all shadow-xs text-sm font-semibold text-foreground group active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span className="font-mono tracking-tight font-bold">{formatDisplayDate(value)}</span>
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-primary font-medium transition-colors">
          {isOpen ? 'Fechar' : 'Alterar'}
        </span>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-80 p-4 rounded-3xl bg-card/95 border border-border/80 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200">
          
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm tracking-tight font-serif text-foreground">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Shortcuts */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={selectToday}
              className="flex-1 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={selectTomorrow}
              className="flex-1 py-1.5 rounded-lg bg-muted border border-border/50 text-foreground text-xs font-bold hover:bg-muted/80 transition-all active:scale-95"
            >
              Amanhã
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center mb-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[11px] font-bold text-muted-foreground font-mono">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-9" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const monthStr = String(currentMonth + 1).padStart(2, '0');
              const dayStr = String(day).padStart(2, '0');
              const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
              const isSelected = value === dateKey;
              const isToday = new Date().toISOString().split('T')[0] === dateKey;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md font-black scale-105'
                      : isToday
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
