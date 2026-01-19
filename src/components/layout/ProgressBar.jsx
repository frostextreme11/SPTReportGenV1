import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const TOTAL_STEPS = 8;

const steps = [
    { id: 1, label: 'Identitas', shortLabel: 'ID' },
    { id: 2, label: 'Peredaran', shortLabel: 'PU' },
    { id: 3, label: 'Laba Rugi', shortLabel: 'LR' },
    { id: 4, label: 'Neraca', shortLabel: 'NC' },
    { id: 5, label: 'Aset', shortLabel: 'AS' },
    { id: 6, label: 'Kredit Pajak', shortLabel: 'KP' },
    { id: 7, label: 'SSP', shortLabel: 'SP' },
    { id: 8, label: 'Download', shortLabel: 'DL' },
];

export default function ProgressBar({ currentStep, onStepClick }) {
    const handleStepClick = (stepId) => {
        if (onStepClick) {
            onStepClick(stepId);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-6">
            {/* Mobile: Simple progress bar with clickable step numbers */}
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
                {/* Mobile clickable step indicators */}
                <div className="flex justify-between mt-3">
                    {steps.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;

                        return (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                className={`
                                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                                    transition-all duration-200 
                                    ${isCompleted || isCurrent
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                                    }
                                    ${isCurrent ? 'ring-2 ring-primary-500/30 scale-110' : 'hover:scale-105'}
                                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    step.id
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Desktop: Full step indicator with clickable circles */}
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
                            <motion.button
                                onClick={() => handleStepClick(step.id)}
                                initial={{ scale: 0.8 }}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isCompleted || isCurrent ? '#10b981' : '#e2e8f0'
                                }}
                                whileHover={{ scale: isCurrent ? 1.15 : 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer
                                    transition-shadow duration-200
                                    ${isCompleted || isCurrent
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
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
                            </motion.button>
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: step.id * 0.05 }}
                                onClick={() => handleStepClick(step.id)}
                                className={`
                                    mt-2 text-[10px] font-medium whitespace-nowrap cursor-pointer
                                    hover:text-primary-600 dark:hover:text-primary-400 transition-colors
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
