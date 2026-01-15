import { motion, AnimatePresence } from 'framer-motion';

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

export default function AnimatedStep({
    children,
    stepKey,
    direction = 1
}) {
    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={stepKey}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Fade in animation wrapper for content sections
export function FadeIn({ children, delay = 0, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: 'easeOut'
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger children animation wrapper
export function StaggerContainer({ children, className = '' }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = '' }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
