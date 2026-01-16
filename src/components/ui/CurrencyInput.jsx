import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HelpTooltip from './HelpTooltip';
import { formatRupiah, parseRupiah, formatNumber, parseNumber } from '../../utils/currency';

export default function CurrencyInput({
    label,
    value,
    onChange,
    helpTitle,
    helpContent,
    placeholder = 'Rp 0',
    error,
    id,
    disabled = false,
    negative = false, // Allow negative values (e.g., for depreciation)
    className = '',
}) {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Update display value when value prop changes (and not focused)
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(value ? formatNumber(Math.abs(value)) : '');
        }
    }, [value, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        // Show raw number for editing
        setDisplayValue(value ? Math.abs(value).toString() : '');
    };

    const handleBlur = () => {
        setIsFocused(false);
        const parsed = parseNumber(displayValue);
        const finalValue = negative ? -Math.abs(parsed) : parsed;
        onChange(finalValue);
        setDisplayValue(parsed ? formatNumber(parsed) : '');
    };

    const handleChange = (e) => {
        // Allow only numbers
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        setDisplayValue(rawValue);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`space-y-1.5 ${className}`}
        >
            {label && (
                <div className="flex items-center gap-1.5">
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                        {label}
                    </label>
                    {helpTitle && helpContent && (
                        <HelpTooltip title={helpTitle} content={helpContent} />
                    )}
                </div>
            )}

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                    {negative ? '- Rp' : 'Rp'}
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    id={id}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="0"
                    className={`
            w-full min-h-[48px] pl-12 pr-4 py-3 
            text-right text-base font-medium
            bg-white dark:bg-slate-800 
            border rounded-xl
            transition-all duration-200
            disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:cursor-not-allowed
            ${error
                            ? 'border-red-300 dark:border-red-500 focus:ring-red-500'
                            : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400'
                        }
            text-slate-800 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
          `}
                />
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-sm text-red-500 dark:text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </motion.div>
    );
}
