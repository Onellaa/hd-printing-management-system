import { useCallback, useEffect, useState } from "react";

// Small reusable hook for loading API data on a page.
export const useFetch = (requestFn, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await requestFn();
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

