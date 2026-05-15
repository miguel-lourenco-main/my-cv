"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SECTION_ID = "technical-skills";
const INTERVAL_MS = 6000;
const POINTER_LEAVE_DEBOUNCE_MS = 80;

/** Skill category cards that participate in the Tech Stack demo cycle. */
export const TECH_STACK_DEMO_CARD_IDS = [
  "frontend",
  "backend",
  "devops",
  "testing",
  "automation",
  "ai",
] as const;

export type TechStackDemoCardId = (typeof TECH_STACK_DEMO_CARD_IDS)[number];

/** Next programmatic loop restart after hover: first highlighted card comes from hover. */
type LoopWarmKickoff = {
  nonce: number;
  firstCardId: TechStackDemoCardId;
};

type TechStackDemoContextValue = {
  activeDemoCardId: TechStackDemoCardId | null;
  userHoveredCardId: TechStackDemoCardId | null;
  beginUserDemoHover: (id: TechStackDemoCardId) => void;
  scheduleUserDemoHoverEnd: () => void;
};

const defaultContext: TechStackDemoContextValue = {
  activeDemoCardId: null,
  userHoveredCardId: null,
  beginUserDemoHover: () => {},
  scheduleUserDemoHoverEnd: () => {},
};

const TechStackDemoContext = createContext<TechStackDemoContextValue>(defaultContext);

export function useTechStackDemo(): TechStackDemoContextValue {
  return useContext(TechStackDemoContext);
}

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j]!;
    next[j] = tmp!;
  }
  return next;
}

function TechStackDemoScheduler({
  userHoveredCardId,
  setActiveDemoCardId,
  loopWarmKickoff,
}: {
  userHoveredCardId: TechStackDemoCardId | null;
  setActiveDemoCardId: (id: TechStackDemoCardId | null) => void;
  loopWarmKickoff: LoopWarmKickoff | null;
}) {
  const [enabled, setEnabled] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setEnabled(!mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const el = document.getElementById(SECTION_ID);
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.12)) {
          setSectionVisible(true);
          io.disconnect();
        }
      },
      { threshold: [0, 0.12, 0.25] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !sectionVisible) return;

    if (userHoveredCardId !== null) {
      setActiveDemoCardId(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const seededFirst = loopWarmKickoff?.firstCardId ?? null;

    let order: TechStackDemoCardId[];

    if (seededFirst) {
      const rest = TECH_STACK_DEMO_CARD_IDS.filter((cid) => cid !== seededFirst);
      order = [seededFirst, ...shuffleArray([...rest])] as TechStackDemoCardId[];
    } else {
      order = shuffleArray([...TECH_STACK_DEMO_CARD_IDS]) as TechStackDemoCardId[];
    }

    let step = 0;

    const tick = () => {
      if (cancelled) return;
      if (step >= order.length) {
        order = shuffleArray([...TECH_STACK_DEMO_CARD_IDS]) as TechStackDemoCardId[];
        step = 0;
      }
      setActiveDemoCardId(order[step]!);
      step += 1;
    };

    tick();
    timer = setInterval(tick, INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [enabled, sectionVisible, userHoveredCardId, setActiveDemoCardId, loopWarmKickoff]);

  return null;
}

export function TechStackDemoProvider({ children }: { children: ReactNode }) {
  const [activeDemoCardId, setActiveDemoCardId] = useState<TechStackDemoCardId | null>(
    null
  );
  const [userHoveredCardId, setUserHoveredCardId] = useState<TechStackDemoCardId | null>(
    null
  );
  const [loopWarmKickoff, setLoopWarmKickoff] = useState<LoopWarmKickoff | null>(null);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHoveredDemoCardRef = useRef<TechStackDemoCardId | null>(null);

  const beginUserDemoHover = useCallback((id: TechStackDemoCardId) => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    lastHoveredDemoCardRef.current = id;
    setUserHoveredCardId(id);
  }, []);

  const scheduleUserDemoHoverEnd = useCallback(() => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
    }
    hoverLeaveTimerRef.current = setTimeout(() => {
      hoverLeaveTimerRef.current = null;
      const resumedFromCard = lastHoveredDemoCardRef.current;
      setLoopWarmKickoff((prev) => {
        if (!resumedFromCard) return prev;
        return {
          nonce: (prev?.nonce ?? 0) + 1,
          firstCardId: resumedFromCard,
        };
      });
      setUserHoveredCardId(null);
    }, POINTER_LEAVE_DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      if (hoverLeaveTimerRef.current) {
        clearTimeout(hoverLeaveTimerRef.current);
      }
    },
    []
  );

  return (
    <TechStackDemoContext.Provider
      value={{
        activeDemoCardId,
        userHoveredCardId,
        beginUserDemoHover,
        scheduleUserDemoHoverEnd,
      }}
    >
      <TechStackDemoScheduler
        userHoveredCardId={userHoveredCardId}
        setActiveDemoCardId={setActiveDemoCardId}
        loopWarmKickoff={loopWarmKickoff}
      />
      {children}
    </TechStackDemoContext.Provider>
  );
}
