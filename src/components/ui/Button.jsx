import { motion } from 'framer-motion';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variants = {
        primary: `
      bg-gradient-to-r from-primary-500 to-primary-600 text-white
      hover:from-primary-600 hover:to-primary-700
      shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30
      active:shadow-md
    `,
        secondary: `
      bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200
      hover:bg-slate-200 dark:hover:bg-slate-600
      border border-slate-200 dark:border-slate-600
    `,
        outline: `
      bg-transparent text-primary-600 dark:text-primary-400
      border-2 border-primary-500 dark:border-primary-400
      hover:bg-primary-50 dark:hover:bg-primary-900/20
    `,
        danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white
      hover:from-red-600 hover:to-red-700
      shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30
    `,
        ghost: `
      bg-transparent text-slate-600 dark:text-slate-300
      hover:bg-slate-100 dark:hover:bg-slate-800
    `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.button>
    );
}
