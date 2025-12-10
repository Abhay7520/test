import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingScreen = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Logo size={60} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 text-xl font-heading font-semibold text-primary"
        >
          Swasth Voice Care
        </motion.div>
        <div className="mt-8 flex space-x-1">
          <LoadingDot delay={0} />
          <LoadingDot delay={0.2} />
          <LoadingDot delay={0.4} />
          <LoadingDot delay={0.6} />
        </div>
      </div>
    </div>
  );
};

interface LoadingDotProps {
  delay: number;
}

const LoadingDot = ({ delay }: LoadingDotProps) => (
  <motion.div
    className="h-3 w-3 rounded-full bg-primary"
    initial={{ scale: 0 }}
    animate={{ scale: [0, 1, 0] }}
    transition={{
      duration: 1,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

export default LoadingScreen;