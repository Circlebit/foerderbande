import {useState, useEffect} from 'react';

export interface FundingCall {
  id: number;
  title: string;
  description: string | null;
  url: string;
  source: string;
  extra_data: {
    deadline?: string;
    funding_body?: string;
    max_amount?: number;
    min_amount?: number;
    currency?: string;
    target_groups?: string[];
    application_type?: string;
    contact_email?: string;
    keywords?: string[];
  };
  created_at: string;
  updated_at: string;
}

export const useFundingCalls = () => {
  const [calls, setCalls] = useState<FundingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/funding-calls');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCalls(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Failed to fetch funding calls:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return {calls, loading, error, refetch: () => window.location.reload()};
};