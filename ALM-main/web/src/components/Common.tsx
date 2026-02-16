
import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../libs/utils';
import ProfileAvatar from '@/src/assets/avatar.png'
import { desc } from 'framer-motion/client';

// --- Icons ---
interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
}

export const Icon: React.FC<IconProps> = ({ name, className = "", fill = false }) => (
  <span className={`material-symbols-outlined ${fill ? 'fill' : ''} ${className}`}>
    {name}
  </span>
);



interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, width }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-lg p-4 relative animate-fadeIn`}
        style={{ width: width || "280px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export function StatsCard({ title, value, description, className }: { title: string; value: string, description?: string, className?: string }) {
  return (
    <div className={cn("bg-emerald-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden ", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{value}</span>
        </div>
        {
          description && (
            <div className="mt-2 pt-2 border-t border-emerald-500/50 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-100">{description}</span>
            </div>
          )
        }
      </div>
    </div>)
}
interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', variant = 'spinner', className = '', text }) => {
  const sizeClasses = {
    sm: 'size-4 border-2',
    md: 'size-8 border-2',
    lg: 'size-12 border-4',
    xl: 'size-16 border-4'
  };

  const dotSizeClasses = {
    sm: 'size-1',
    md: 'size-2',
    lg: 'size-3',
    xl: 'size-4'
  };

  const renderContent = () => {
    if (variant === 'dots') {
      return (
        <div className={`flex gap-1.5 justify-center items-center ${className}`}>
          <div className={`${dotSizeClasses[size]} bg-primary rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
          <div className={`${dotSizeClasses[size]} bg-primary rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
          <div className={`${dotSizeClasses[size]} bg-primary rounded-full animate-bounce`}></div>
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className={`${size === 'xl' ? 'size-20' : 'size-12'} bg-primary/20 rounded-full animate-ping absolute`}></div>
          <div className={`${size === 'xl' ? 'size-16' : 'size-8'} bg-primary rounded-full shadow-lg flex items-center justify-center text-white z-10`}>
            <Icon name="bolt" className={size === 'xl' ? 'text-3xl' : 'text-xl'} fill />
          </div>
        </div>
      );
    }

    // Default Spinner
    return (
      <div className={`relative ${className} flex justify-center items-center`}>
        <div className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 rounded-full absolute inset-0`}></div>
        <div className={`${sizeClasses[size]} border-primary  border-t-transparent rounded-full animate-spin relative z-10`}></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      {renderContent()}
      {text && <p className="text-sm font-medium text-text-secondary dark:text-text-muted animate-pulse">{text}</p>}
    </div>
  );
};
// --- Hooks ---
function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}



interface MemberAvatarProps {
  member: { avatar?: string };
  onUpload?: (file: File) => void; // callback to handle file upload
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, onUpload }) => {
  const [preview, setPreview] = useState(member.avatar ?? ProfileAvatar);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview the selected file
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Call upload handler if provided
    if (onUpload) onUpload(file);
  };

  return (
    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
      {/* Avatar Display */}
      <div
        className="size-32 rounded-full border-4 border-white dark:border-gray-800 bg-cover bg-center shadow-md"
        style={{ backgroundImage: `url(${preview})` }}
      ></div>

      {/* Upload Button */}
      <label className="mt-2 cursor-pointer text-sm text-blue-500 hover:underline">
        Upload Photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary hover:bg-primary-hover ring-offset-0  outline-none focus:ring-0 text-white focus:ring-primary",
    secondary: "bg-background-light dark:bg-card-dark ring-offset-0  outline-none focus:ring-0 text-text-primary dark:text-text-light hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: "border border-gray-300 dark:border-gray-600 ring-offset-0  outline-none focus:ring-0 text-text-primary dark:text-text-light hover:bg-gray-50 dark:hover:bg-gray-800",
    danger: "bg-accent/10 text-accent hover:bg-accent/20 ring-offset-0  outline-none focus:ring-0 dark:bg-accent/20 dark:hover:bg-accent/30 focus:ring-accent focus:border-accent outline-none",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 ring-offset-0 outline-none focus:ring-0  text-text-secondary dark:text-gray-400 "
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button className={cn(`${baseStyles} ${variants[variant]} ${sizes[size]}`, className)} {...props}>
      {icon && <Icon name={icon} className={`text-lg ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={icon} className="text-gray-400 text-lg" />
          </div>
        )}

        <input
          className={cn(
            "w-full rounded-lg border focus-within:outline-none focus:ring-2 focus:ring-[#1976d2]/20 border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-primary dark:text-text-light",
            "focus:ring-2 focus:ring-[#1976d2]/20 focus:border-[#1976d2]",
            icon ? "pl-10" : "pl-3",
            "py-2",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("w-full relative", className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-lg border focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/20 border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-primary dark:text-text-light",
          "py-2 px-3 text-left flex items-center justify-between transition-colors"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {icon && <Icon name={icon} className="text-gray-400 text-sm" />}
          <span className={cn("block truncate", !selectedOption && "text-gray-400")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <Icon
          name="expand_more"
          className={cn(
            "text-gray-400 text-base transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 rounded-xl bg-white dark:bg-card-dark shadow-xl border
             border-gray-100 dark:border-gray-700 max-h-60 overflow-auto focus:outline-none"
          >
            <ul className="py-1">
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors",
                        isSelected
                          ? "text-primary font-semibold bg-primary/5 dark:bg-white/5"
                          : "text-text-primary dark:text-text-light",
                        "hover:bg-primary/5 dark:hover:bg-white/5"
                      )}
                    >
                      {option.label}
                      {isSelected && <Icon name="check" className="text-primary text-sm" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- Custom DatePicker ---
interface CustomDatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  min?: string;
  max?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  className = "",
  min,
  max
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  // Initialize display logic
  const dateValue = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(dateValue.getMonth());
  const [currentYear, setCurrentYear] = useState(dateValue.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

  const handleDateClick = (day: number) => {
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const newDate = `${currentYear}-${month}-${dayStr}`;
    onChange(newDate);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return y === currentYear && m === currentMonth + 1 && d === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
  };

  return (
    <div className={`w-full relative ${className}`} ref={ref}>
      {label && <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">{label}</label>}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="calendar_today" className="text-gray-400 text-base" />
        </div>
        <input
          type="text"
          readOnly
          value={value}
          placeholder="YYYY-MM-DD"
          className="w-full rounded-lg border  focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/20 border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-primary dark:text-text-light outline-none focus:ring-primary pl-10 py-2 cursor-pointer"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 p-4 rounded-xl bg-white dark:bg-card-dark shadow-2xl border border-gray-100 dark:border-gray-700 w-72"
          >
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                <Icon name="chevron_left" />
              </button>
              <span className="font-bold text-gray-800 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                <Icon name="chevron_right" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-xs font-medium text-gray-400">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const selected = isSelected(day);
                const today = isToday(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`
                      w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors
                      ${selected ? 'bg-primary text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}
                      ${today && !selected ? 'border border-primary text-primary' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Custom TimePicker ---
interface CustomTimePickerProps {
  label?: string;
  value: string; // HH:mm
  onChange: (value: string) => void;
  className?: string;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  label,
  value,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  // Parse value or default to 12:00
  const [hour, minute] = value && value.includes(':') ? value.split(':') : ['12', '00'];

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const allMinutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleHourClick = (h: string) => {
    onChange(`${h}:${minute}`);
  };

  const handleMinuteClick = (m: string) => {
    onChange(`${hour}:${m}`);
  };

  return (
    <div className={`w-full relative ${className}`} ref={ref}>
      {label && <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">{label}</label>}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="schedule" className="text-gray-400 text-lg" />
        </div>
        <input
          type="text"
          readOnly
          value={value}
          placeholder="HH:mm"
          className="w-full rounded-lg border outline-none focus:ring-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-primary dark:text-text-light focus:ring-primary focus:border-primary pl-10 py-2 cursor-pointer"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 p-2 rounded-xl bg-white dark:bg-card-dark shadow-2xl border border-gray-100 dark:border-gray-700 w-48 flex h-60 overflow-hidden"
          >
            {/* Hours Column */}
            <div className="flex-1 overflow-y-auto no-scrollbar border-r border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-center p-2 text-gray-400 sticky top-0 bg-white dark:bg-card-dark">Hr</div>
              {hours.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourClick(h)}
                  className={`w-full text-center py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 ${hour === h ? 'bg-primary text-white font-bold' : 'text-text-primary dark:text-text-light'}`}
                >
                  {h}
                </button>
              ))}
            </div>
            {/* Minutes Column */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="text-xs font-bold text-center p-2 text-gray-400 sticky top-0 bg-white dark:bg-card-dark">Min</div>
              {allMinutes.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteClick(m)}
                  className={`w-full text-center py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 ${minute === m ? 'bg-primary text-white font-bold' : 'text-text-primary dark:text-text-light'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: string; // Optional icon inside textarea (left side)
  error?: string; // Optional error message
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  icon,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-2 pointer-events-none">
            <Icon name={icon} className="text-gray-400 text-lg" />
          </div>
        )}

        <textarea
          className={cn(
            "w-full rounded-lg focus:ring-2 focus:ring-[#1976d2]/20 focus:border-[#1976d2] border outline-none border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-primary dark:text-text-light  py-2 px-3 transition-colors resize-none",
            icon && "pl-10",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
// --- Cards ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-card-light dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}>
    {children}
  </div>
);

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'green' }) => {
  const colors = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    red: "bg-accent/10 text-accent dark:bg-accent/20",
    blue: "bg-primary/10 text-primary dark:bg-primary/30 dark:text-blue-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Empty State ---
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = "search_off", action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800 border-dashed w-full h-full min-h-[300px]">
    <div className="size-16 rounded-full bg-gray-200 dark:bg-gray-700/50 flex items-center justify-center mb-4 text-gray-500 dark:text-gray-400">
      <Icon name={icon} className="text-3xl" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">{description}</p>
    {action}
  </div>
);
