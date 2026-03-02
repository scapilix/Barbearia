import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDatePicker = ({ value, onChange, placeholder = "Selecionar data" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day) => {
    // Format to YYYY-MM-DD local string to match native input behavior
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${date}`);
    setIsOpen(false);
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        let isSelected = false;
        if (value) {
            const [y, m, d] = value.split('-');
            const valDate = new Date(y, m - 1, d);
            isSelected = isSameDay(day, valDate);
        }

        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day}
            onClick={() => onDateClick(cloneDay)}
            className={`
              p-2 text-center text-sm cursor-pointer rounded-lg transition-all
              ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100'}
              ${isSelected ? 'bg-primary text-white hover:bg-primary/90 font-medium shadow-md shadow-primary/20' : ''}
              ${isToday && !isSelected ? 'border border-primary/30 text-primary font-medium' : ''}
            `}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const displayValue = value ? format(new Date(value.split('-')[0], value.split('-')[1] - 1, value.split('-')[2]), "d 'de' MMMM, yyyy", { locale: pt }) : placeholder;

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm"
      >
        <CalendarIcon size={16} className={value ? "text-primary" : "text-slate-400"} />
        <span className={`text-sm select-none ${value ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
          {displayValue}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 w-[300px]"
            // Prevent overflowing off-screen
            style={{ 
               right: 'auto',
               left: 0
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-bold text-slate-800 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: pt })}
              </div>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
                <div key={i} className="text-center text-xs font-semibold text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div>{renderCells()}</div>
            
            {value && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-center">
                    <button 
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                        Limpar data
                    </button>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
