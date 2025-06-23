import { motion } from 'framer-motion';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export const DatePicker = ({ selected, onChange, placeholder }: DatePickerProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholder}
        className="border border-mist bg-ivory rounded-xl px-4 py-2 w-full text-ink focus:outline-none focus:ring-2 focus:ring-iris"
        dateFormat="MMMM d, yyyy"
      />
    </motion.div>
  );
};