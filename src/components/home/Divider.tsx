interface DividerProps {
  variant?: 'rose' | 'pink';
}

const Divider = ({ variant = 'rose' }: DividerProps) => {
  const colorClass =
    variant === 'rose'
      ? 'from-transparent via-rose-300/40 dark:via-rose-600/40 to-transparent'
      : 'from-transparent via-pink-300/40 dark:via-pink-600/40 to-transparent';

  return <div className={`h-8 bg-gradient-to-r ${colorClass} my-16`}></div>;
};

export default Divider;
