export type Person = "Karthik" | "Likhita";

export type EntryType = "income" | "expense";

export type Category =
  | "Salary"
  | "Freelance"
  | "Rent"
  | "Groceries"
  | "Utilities"
  | "Transport"
  | "Dining"
  | "Shopping"
  | "Health"
  | "Entertainment"
  | "Travel"
  | "Investment"
  | "Gift"
  | "Other";

export interface Entry {
  id: string;
  created_at: string;
  date: string; // ISO date
  type: EntryType;
  amount: number;
  category: Category;
  person: Person;
  note: string | null;
}

export interface Holding {
  id: string;
  created_at: string;
  name: string;
  person: Person;
  invested: number;
  current_value: number;
  updated_at: string;
}

export interface Plan {
  id: string;
  created_at: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  person: Person | "Both";
}

export const CATEGORIES: Category[] = [
  "Salary",
  "Freelance",
  "Rent",
  "Groceries",
  "Utilities",
  "Transport",
  "Dining",
  "Shopping",
  "Health",
  "Entertainment",
  "Travel",
  "Investment",
  "Gift",
  "Other",
];

export const PEOPLE: Person[] = ["Karthik", "Likhita"];
