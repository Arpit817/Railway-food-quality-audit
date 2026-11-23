import { useState, useCallback } from 'react';

/**
 * Custom hook to manage boolean toggle states (modals, anonymous checkboxes, dropdowns)
 *
 * @param {boolean} initialValue 
 * @returns {[boolean, Function, Function, Function]} [value, toggle, setTrue, setFalse]
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
}

export default useToggle;
