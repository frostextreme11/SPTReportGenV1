import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, RotateCcw } from 'lucide-react';

import Header from './components/layout/Header';
import ProgressBar from './components/layout/ProgressBar';
import Button from './components/ui/Button';

import Step1Identity from './components/steps/Step1Identity';
import Step2Revenue from './components/steps/Step2Revenue';
import Step3ProfitLoss from './components/steps/Step3ProfitLoss';
import Step4Balance from './components/steps/Step4Balance';
import PDFPreview from './components/pdf/PDFPreview';

import { useFormData } from './context/FormContext';

const steps = [
    { id: 1, component: Step1Identity },
    { id: 2, component: Step2Revenue },
    { id: 3, component: Step3ProfitLoss },
    { id: 4, component: Step4Balance },
];

export default function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    const { resetForm } = useFormData();

    const CurrentStepComponent = steps.find(s => s.id === currentStep)?.component;

    const goToNextStep = () => {
        if (currentStep < 4) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    };

    const goToPrevStep = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleReset = () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
            resetForm();
            setCurrentStep(1);
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Header />

            <main className="max-w-4xl mx-auto pb-32">
                {/* Progress Bar */}
                <ProgressBar currentStep={currentStep} />

                {/* Step Content */}
                <div className="px-4 overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-6 sm:p-8"
                        >
                            {CurrentStepComponent && <CurrentStepComponent />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Fixed Bottom Navigation */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 p-4 z-40"
            >
                <div className="max-w-4xl mx-auto">
                    {/* Mobile: Stack buttons, Desktop: Inline */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Reset Button - Desktop Only */}
                        <div className="hidden sm:block">
                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </Button>
                        </div>

                        <div className="flex-1" />

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            {currentStep > 1 && (
                                <Button
                                    variant="secondary"
                                    onClick={goToPrevStep}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                    <span className="sm:hidden">Kembali</span>
                                </Button>
                            )}

                            {currentStep < 4 ? (
                                <Button
                                    variant="primary"
                                    onClick={goToNextStep}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <span className="hidden sm:inline">Selanjutnya</span>
                                    <span className="sm:hidden">Lanjut</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={() => setShowPreview(true)}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden sm:inline">Lihat Pratinjau & Download</span>
                                    <span className="sm:hidden">Pratinjau</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Reset Button */}
                    <div className="sm:hidden mt-3">
                        <button
                            onClick={handleReset}
                            className="w-full text-center text-sm text-red-500 hover:text-red-600 py-2"
                        >
                            <RotateCcw className="w-4 h-4 inline mr-1" />
                            Reset Semua Data
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* PDF Preview Modal */}
            <PDFPreview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
            />
        </div>
    );
}
