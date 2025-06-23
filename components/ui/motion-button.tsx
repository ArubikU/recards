import { motion } from 'framer-motion';
import { Button } from './button';

interface MotionButtonProps {
  label: string;
  onClick?: () => void;
}

export const MotionButton = ({ label, onClick }: MotionButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button label={label} onClick={onClick} />
    </motion.div>
  );
};