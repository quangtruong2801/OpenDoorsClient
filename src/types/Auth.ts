export type User = { id: string; name: string; role: string };

export type AuthContextType = {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};
