import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const TOTAL_STEPS = 7;

const steps = [
    { id: 1, label: 'Identitas', shortLabel: 'ID' },
    { id: 2, label: 'Peredaran', shortLabel: 'PU' },
    { id: 3, label: 'Laba Rugi', shortLabel: 'LR' },
    { id: 4, label: 'Neraca', shortLabel: 'NC' },
    { id: 5, label: 'Aset', shortLabel: 'AS' },
    { id: 6, label: 'Kredit Pajak', shortLabel: 'KP' },
    { id: 7, label: 'Download', shortLabel: 'DL' },
];

export default function ProgressBar({ currentStep }) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-6">
            {/* Mobile: Simple progress bar with step numbers */}
            <div className="sm:hidden">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Langkah {currentStep} dari {TOTAL_STEPS}
                    </span>
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
                        {Math.round((currentStep / TOTAL_STEPS) * 100)}%
                    </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                    />
                </div>
                <div className="flex justify-between mt-2">
                    {steps.map((step) => (
                        <span
                            key={step.id}
                            className={`text-xs font-medium ${step.id <= currentStep
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-slate-400 dark:text-slate-500'
                                }`}
                        >
                            {step.shortLabel}
                        </span>
                    ))}
                </div>
            </div>

            {/* Desktop: Full step indicator */}
            <div className="hidden sm:flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

                {/* Progress Line Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute top-4 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                />

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isCompleted || isCurrent ? '#10b981' : '#e2e8f0'
                                }}
                                transition={{ duration: 0.3 }}
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs
                                    ${isCompleted || isCurrent
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }
                                    ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}
                                `}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <Check className="w-4 h-4" />
                                    </motion.div>
                                ) : (
                                    <span className="text-xs font-bold">{step.id}</span>
                                )}
                            </motion.div>
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: step.id * 0.05 }}
                                className={`
                                    mt-2 text-[10px] font-medium whitespace-nowrap
                                    ${isCurrent
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : isCompleted
                                            ? 'text-slate-600 dark:text-slate-300'
                                            : 'text-slate-400 dark:text-slate-500'
                                    }
                                `}
                            >
                                {step.label}
                            </motion.span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
