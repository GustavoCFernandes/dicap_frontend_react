import { useEffect, useRef } from 'react';

function useCalendarPolling(callback, interval = 3000, dependencies = []) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (typeof callback !== 'function') return;
    callback();

    intervalRef.current = setInterval(() => {
      callback();
    }, interval);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [callback, interval, ...dependencies]);
}

export default useCalendarPolling
