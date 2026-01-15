import { motion } from 'framer-motion';
import HelpTooltip from './HelpTooltip';

export default function InputField({
    label,
    type = 'text',
    value,
    onChange,
    helpTitle,
    helpContent,
    placeholder,
    error,
    id,
    disabled = false,
    required = false,
    multiline = false,
    rows = 3,
    className = '',
    maxLength,
    ...props
}) {
    const inputProps = {
        id,
        type,
        value: value || '',
        onChange: (e) => onChange(e.target.value),
        disabled,
        required,
        placeholder,
        maxLength,
        className: `
      w-full px-4 py-3 
      bg-white dark:bg-slate-800 
      border rounded-xl
      transition-all duration-200
      disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:cursor-not-allowed
      ${error
                ? 'border-red-300 dark:border-red-500 focus:ring-red-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400'
            }
      text-slate-800 dark:text-white text-base
      placeholder:text-slate-400 dark:placeholder:text-slate-500
    `,
        ...props,
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
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {helpTitle && helpContent && (
                        <HelpTooltip title={helpTitle} content={helpContent} />
                    )}
                </div>
            )}

            {multiline ? (
                <textarea
                    {...inputProps}
                    rows={rows}
                    className={`${inputProps.className} resize-none`}
                />
            ) : (
                <input {...inputProps} />
            )}

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
