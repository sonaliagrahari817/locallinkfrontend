import { useState, useEffect, useCallback } from 'react';

/**
 * Custom data fetching hook with loading, error states, and fallback data support.
 * @param {Function} apiFunc - Axios API function e.g. workerAPI.getAll
 * @param {Object} params - Query parameters or dependencies object
 * @param {Array|Object} fallbackData - Static fallback data (e.g. from dummyData.js)
 * @param {Array} deps - Extra useEffect dependencies
 */
export function useFetch(apiFunc, params = null, fallbackData = null, deps = []) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFunc(params);
      setData(res.data);
    } catch (err) {
      console.warn('API call failed, using fallback data if available:', err.message);
      setError(err.response?.data?.message || err.message);
      if (fallbackData !== null) {
        setData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunc, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return { data, setData, loading, error, refetch: fetchData };
}

export default useFetch;
