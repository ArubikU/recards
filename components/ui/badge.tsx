
interface BadgeProps {
  label: string;
  variant?: 'default' | 'outline' | 'secondary' | 'defaultrounded' | 'outlinerounded' | 'secondaryrounded';
}

export const Badge = ({ label, variant = 'default' }: BadgeProps) => {
  const variants = {
    default: 'bg-iris text-white',
    outline: 'border border-iris text-iris',
    secondary: 'bg-mist text-ink',
    defaultrounded: 'bg-iris text-white rounded-xl',
    outlinerounded: 'border border-iris text-iris rounded-xl',
    secondaryrounded: 'bg-mist text-ink rounded-xl',
  };

  return (
    <span className={`${variants[variant]} px-2 py-1 rounded-lg text-xs font-medium`}>
      {label}
    </span>
  );
};