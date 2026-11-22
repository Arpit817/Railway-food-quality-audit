/**
 * Utility function to merge conditional class names cleanly
 * Replaces bulky clsx/tailwind-merge dependencies for this stage.
 *
 * Usage:
 * cn('px-4 py-2', isPrimary && 'bg-blue-600', hasError ? 'border-red-500' : 'border-slate-300')
 */
export function cn(...inputs) {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === 'string') return input.split(' ');
      if (Array.isArray(input)) return input;
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(' ');
}

export default cn;
