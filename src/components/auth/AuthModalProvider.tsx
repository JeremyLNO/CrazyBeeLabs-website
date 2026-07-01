"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthFlow } from "@/components/auth/AuthFlow";

interface RequireOpts {
  /** Runs once the user is authenticated (immediately if already logged in). */
  afterAuth?: () => void;
  /** Lead text shown on the modal's first step. */
  intro?: string;
}

interface AuthModalValue {
  /** Ensure the user is signed in, then run afterAuth. */
  requireAuth: (opts?: RequireOpts) => void;
  /** Open the modal explicitly (e.g. header "Log in"). */
  openAuth: (opts?: RequireOpts) => void;
}

const Ctx = createContext<AuthModalValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [intro, setIntro] = useState<string | undefined>(undefined);
  const afterRef = useRef<(() => void) | undefined>(undefined);

  const openAuth = useCallback((opts?: RequireOpts) => {
    afterRef.current = opts?.afterAuth;
    setIntro(opts?.intro);
    setOpen(true);
  }, []);

  const requireAuth = useCallback(
    (opts?: RequireOpts) => {
      if (status === "authenticated") {
        opts?.afterAuth?.();
        return;
      }
      openAuth(opts);
    },
    [status, openAuth],
  );

  const close = useCallback(() => {
    setOpen(false);
    afterRef.current = undefined;
    setIntro(undefined);
  }, []);

  const onSuccess = useCallback(() => {
    const fn = afterRef.current;
    setOpen(false);
    setIntro(undefined);
    afterRef.current = undefined;
    // Give the session a tick to propagate before the follow-up action.
    setTimeout(() => fn?.(), 60);
  }, []);

  return (
    <Ctx.Provider value={{ requireAuth, openAuth }}>
      {children}
      {open && (
        <div className="modal-overlay" onClick={close} role="presentation">
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={close} aria-label="Close">
              ✕
            </button>
            <AuthFlow intro={intro} onSuccess={onSuccess} />
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useAuthModal(): AuthModalValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
