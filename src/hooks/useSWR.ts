import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface QuoteData {
  id: string;
  content: string;
  author: string;
  category?: string;
}

export function useQuote() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: QuoteData }>(
    "/api/quote",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 86400000,
      fallbackData: undefined,
    }
  );

  return {
    quote: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export interface PoemData {
  content: string;
  author: string;
  title: string;
  dynasty?: string;
}

export function usePoem() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: PoemData }>(
    "/api/poem",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  );

  return {
    poem: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export interface AIRecommendResponse {
  success: boolean;
  data: {
    recommendation: {
      category: string;
      confidence: number;
      reason: string;
    };
  };
}

export function useAIRecommend(query: string, categories: string[]) {
  const { data, error, isLoading, mutate } = useSWR<AIRecommendResponse>(
    query ? ["/api/recommend", query, categories] : null,
    () =>
      fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, categories }),
      }).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    recommendation: data?.data?.recommendation,
    isLoading,
    isError: error,
    mutate,
  };
}

export interface AISearchResult {
  id: string;
  title: string;
  url: string;
  category?: string;
  score: number;
  reason: string;
}

export function useAISearch(query: string, bookmarks: Array<{ id: string; title: string; url: string; category?: string }>) {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: { results: AISearchResult[] } }>(
    query ? ["/api/search", query] : null,
    () =>
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, bookmarks }),
      }).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    results: data?.data?.results || [],
    isLoading,
    isError: error,
    mutate,
  };
}
