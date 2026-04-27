import clsx from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
        {
          'w-4 h-4': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-10 h-10': size === 'lg',
        },
        className
      )}
    />
  );
}
