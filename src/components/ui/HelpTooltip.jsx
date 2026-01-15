import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

export default function HelpTooltip({ title, content }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative inline-block">
            <motion.button
                ref={buttonRef}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="p-1 text-slate-400 hover:text-primary-500 dark:text-slate-500 dark:hover:text-primary-400 transition-colors"
                aria-label="Bantuan"
            >
                <HelpCircle className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
                        />

                        {/* Tooltip */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            className={`
                absolute z-50 
                w-72 p-4 
                bg-white dark:bg-slate-800 
                rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/20
                border border-slate-200 dark:border-slate-700
                left-0 top-full mt-2
                sm:left-1/2 sm:-translate-x-1/2
              `}
                        >
                            {/* Arrow */}
                            <div className="absolute -top-2 left-4 sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 rotate-45" />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                                        {title}
                                    </h4>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {content}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
