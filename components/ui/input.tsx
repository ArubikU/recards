export const Input = ({ placeholder, value, onChange, onKeyPress, disabled, className, ref }: {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}) => (
  <input
    ref={ref}
    className={`border border-mist bg-ivory rounded-xl px-4 py-2 w-full text-ink focus:outline-none focus:ring-2 focus:ring-iris ${className || ''}`}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyPress={onKeyPress}
    disabled={disabled}
  />
);