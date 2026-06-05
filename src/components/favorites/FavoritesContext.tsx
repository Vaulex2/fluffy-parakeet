"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getFavoriteIds, toggleFavorite } from "@/lib/actions/customer/favorites";

interface FavoritesContextValue {
  /** Whether favorites are available (user is signed in). */
  enabled: boolean;
  isFavorite: (menuItemId: string) => boolean;
  /** Toggle a favorite; guests are nudged to sign in. */
  toggle: (menuItemId: string) => void;
  ids: Set<string>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [enabled, setEnabled] = useState(false);

  // Hydrate from the server for signed-in users.
  useEffect(() => {
    getFavoriteIds().then((list) => {
      if (list === null) {
        setEnabled(false);
        return;
      }
      setEnabled(true);
      setIds(new Set(list));
    });
  }, []);

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      if (!enabled) {
        // Guests can't persist favorites — send them to sign in.
        router.push("/auth/login?next=/menu");
        return;
      }
      // Optimistic update, then persist.
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      toggleFavorite(id).then((res) => {
        if ("error" in res) {
          // Lost session — revert and bounce to sign in.
          setIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
          router.push("/auth/login?next=/menu");
        }
      });
    },
    [enabled, router],
  );

  const value = useMemo(
    () => ({ enabled, isFavorite, toggle, ids }),
    [enabled, isFavorite, toggle, ids],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
