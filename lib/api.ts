import { Entry, Holding, Plan } from "./types";

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

// Entries API
export const entriesAPI = {
  async getAll(params?: { startDate?: string; endDate?: string; person?: string }): Promise<Entry[]> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.person) query.set("person", params.person);

    const url = `/api/entries${query.toString() ? `?${query.toString()}` : ""}`;
    return fetchAPI(url);
  },

  async getSummary(period: "today" | "yesterday" | "week", person?: string): Promise<{
    period: string;
    startDate: string;
    endDate: string;
    income: number;
    expense: number;
    balance: number;
    count: number;
  }> {
    const query = new URLSearchParams({ period });
    if (person) query.set("person", person);
    return fetchAPI(`/api/entries/summary?${query.toString()}`);
  },

  async exportCSV(person?: string): Promise<void> {
    const query = person ? `?person=${person}` : "";
    window.open(`/api/entries/export${query}`, "_blank");
  },

  async archive(cutoffDate: string, person?: string): Promise<{ success: boolean; deletedCount: number }> {
    return fetchAPI("/api/entries/archive", {
      method: "POST",
      body: JSON.stringify({ cutoffDate, person }),
    });
  },

  async create(entry: Omit<Entry, "id" | "created_at">): Promise<Entry> {
    return fetchAPI("/api/entries", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },

  async update(id: string, entry: Partial<Omit<Entry, "id" | "created_at">>): Promise<Entry> {
    return fetchAPI("/api/entries", {
      method: "PUT",
      body: JSON.stringify({ id, ...entry }),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchAPI(`/api/entries?id=${id}`, {
      method: "DELETE",
    });
  },
};

// Holdings API
export const holdingsAPI = {
  async getAll(): Promise<Holding[]> {
    return fetchAPI("/api/holdings");
  },

  async create(holding: Omit<Holding, "id" | "created_at" | "updated_at">): Promise<Holding> {
    return fetchAPI("/api/holdings", {
      method: "POST",
      body: JSON.stringify(holding),
    });
  },

  async update(id: string, holding: Partial<Omit<Holding, "id" | "created_at">>): Promise<Holding> {
    return fetchAPI("/api/holdings", {
      method: "PUT",
      body: JSON.stringify({ id, ...holding }),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchAPI(`/api/holdings?id=${id}`, {
      method: "DELETE",
    });
  },
};

// Plans API
export const plansAPI = {
  async getAll(): Promise<Plan[]> {
    return fetchAPI("/api/plans");
  },

  async create(plan: Omit<Plan, "id" | "created_at">): Promise<Plan> {
    return fetchAPI("/api/plans", {
      method: "POST",
      body: JSON.stringify(plan),
    });
  },

  async update(id: string, plan: Partial<Omit<Plan, "id" | "created_at">>): Promise<Plan> {
    return fetchAPI("/api/plans", {
      method: "PUT",
      body: JSON.stringify({ id, ...plan }),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchAPI(`/api/plans?id=${id}`, {
      method: "DELETE",
    });
  },
};
