import { motion } from 'framer-motion';

interface SpeechWaveProps {
  isActive: boolean;
  color?: string;
}

const SpeechWave = ({ isActive, color = 'text-primary-500' }: SpeechWaveProps) => {
  return (
    <div className={`wave-group ${color} ${isActive ? 'opacity-100' : 'opacity-40'}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="wave-bar"
          initial={{ scaleY: 0.3 }}
          animate={{ scaleY: isActive ? [0.3, 1, 0.3] : 0.3 }}
          transition={{
            duration: 0.6,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default SpeechWave;