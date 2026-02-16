import React, { useState, useRef, useEffect } from 'react';
import { MONTH_NAMES, DAYS_OF_WEEK, getDaysInMonth, getFirstDayOfMonth, isSameDate } from '@/types';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

export interface CalendarEvent {
    date: Date;
    title: string;
    color?: string;
    time?: string;
    startDateTime?: Date;
    timeZone?: string;
    location?: string;
    duration?: string;
    organizer?: string;
    link?: string;
}

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
    placeholder?: string;
    events?: CalendarEvent[];
}

type ViewMode = 'days' | 'months' | 'years';

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label = "Select Date",
    placeholder = "YYYY-MM-DD",
    events = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calendar State
    const [viewDate, setViewDate] = useState(value || new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('days');

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Sync view date when modal opens or value changes
    useEffect(() => {
        if (isOpen && value) {
            setViewDate(value);
            setViewMode('days');
        }
    }, [isOpen, value]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Calendar Navigation Logic ---

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMode === 'days') {
            setViewDate(new Date(year, month - 1, 1));
        } else if (viewMode === 'months') {
            setViewDate(new Date(year - 1, month, 1));
        } else if (viewMode === 'years') {
            setViewDate(new Date(year - 24, month, 1));
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMode === 'days') {
            setViewDate(new Date(year, month + 1, 1));
        } else if (viewMode === 'months') {
            setViewDate(new Date(year + 1, month, 1));
        } else if (viewMode === 'years') {
            setViewDate(new Date(year + 24, month, 1));
        }
    };

    const handleHeaderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMode === 'days') {
            setViewMode('years');
        } else if (viewMode === 'years') {
            setViewMode('days');
        } else if (viewMode === 'months') {
            setViewMode('years');
        }
    };

    const handleYearSelect = (selectedYear: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(selectedYear, month, 1));
        setViewMode('months');
    };

    const handleMonthSelect = (selectedMonth: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(year, selectedMonth, 1));
        setViewMode('days');
    };

    const handleDateClick = (day: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newDate = new Date(year, month, day);
        onChange(newDate);
        setIsOpen(false);
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(event => isSameDate(event.date, date));
    };

    // --- Render Helpers ---

    const renderDaysView = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells = [];

        const weekDays = DAYS_OF_WEEK.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-400">
                {day}
            </div>
        ));

        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-9 w-9" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateToCheck = new Date(year, month, day);
            const isSelected = isSameDate(dateToCheck, value);
            const isCurrentDay = isSameDate(dateToCheck, new Date());
            const dayEvents = getEventsForDate(dateToCheck);
            const hasEvents = dayEvents.length > 0;

            cells.push(
                <button
                    key={day}
                    onClick={(e) => handleDateClick(day, e)}
                    className={`
            h-9 w-9 rounded-full flex flex-col items-center justify-center relative transition-all duration-200
            ${isSelected
                            ? 'bg-[#1976d2] text-white shadow-md hover:bg-[#1565c0]'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
            ${!isSelected && isCurrentDay ? 'text-[#1976d2] font-bold' : ''}
          `}
                >
                    <span className="text-sm leading-none">{day}</span>
                    {hasEvents && !isSelected && (
                        <div className="flex gap-0.5 mt-1">
                            {dayEvents.slice(0, 3).map((evt, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1 h-1 rounded-full ${evt.color || 'bg-blue-500'}`}
                                />
                            ))}
                        </div>
                    )}
                    {hasEvents && isSelected && (
                        <div className="flex gap-0.5 mt-1">
                            <div className="w-1 h-1 rounded-full bg-white/70" />
                        </div>
                    )}
                </button>
            );
        }

        return (
            <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2">{weekDays}</div>
                <div className="grid grid-cols-7 gap-y-1 place-items-center">{cells}</div>
            </div>
        );
    };

    const renderMonthsView = () => {
        return (
            <div className="grid grid-cols-3 gap-3 py-2 animate-in fade-in duration-300">
                {MONTH_NAMES.map((m, idx) => (
                    <button
                        key={m}
                        onClick={(e) => handleMonthSelect(idx, e)}
                        className={`
              py-2 px-2 rounded-lg text-sm font-medium transition-colors
              ${idx === month
                                ? 'bg-[#1976d2] text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }
            `}
                    >
                        {m.slice(0, 3)}
                    </button>
                ))}
            </div>
        );
    };

    const renderYearsView = () => {
        const startYear = year - 10;
        const years = [];
        for (let i = 0; i < 24; i++) {
            years.push(startYear + i);
        }

        return (
            <div className="grid grid-cols-4 gap-2 py-2 animate-in fade-in duration-300">
                {years.map(y => (
                    <button
                        key={y}
                        onClick={(e) => handleYearSelect(y, e)}
                        className={`
              py-2 rounded-md text-sm font-medium transition-colors
              ${y === year
                                ? 'bg-[#1976d2] text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }
            `}
                    >
                        {y}
                    </button>
                ))}
            </div>
        );
    };

    const getHeaderText = () => {
        if (viewMode === 'days') return `${MONTH_NAMES[month]} ${year}`;
        if (viewMode === 'months') return `${year}`;
        if (viewMode === 'years') {
            const start = year - 10;
            const end = start + 23;
            return `${start} - ${end}`;
        }
        return '';
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-sm font-sans">

            {/* Input Field */}
            <div className="flex flex-col gap-1.5">
                {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                            flex items-center gap-3 px-4 py-3 bg-white border rounded-xl cursor-pointer transition-all duration-200 group
                            ${isOpen ? 'border-[#1976d2] ring-2 ring-[#1976d2]/20 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                        `}
                >
                    <CalendarIcon className={`w-5 h-5 ${isOpen ? 'text-[#1976d2]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className={`flex-grow text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {value ? value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1976d2]' : ''}`} />
                </div>
            </div>

            {/* Popover Calendar */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50">
                    <div className="w-[320px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Calendar Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                            <button
                                onClick={handleHeaderClick}
                                className="flex items-center gap-1.5 text-gray-800 font-bold hover:bg-white hover:shadow-sm px-2 py-1.5 rounded-md transition-all text-sm tracking-tight"
                            >
                                <span>{getHeaderText()}</span>
                                <ChevronDown
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-200 ${viewMode !== 'days' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <div className="flex gap-1">
                                <button
                                    onClick={handlePrev}
                                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-500 hover:text-gray-800 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-500 hover:text-gray-800 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {viewMode === 'days' && renderDaysView()}
                            {viewMode === 'months' && renderMonthsView()}
                            {viewMode === 'years' && renderYearsView()}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
