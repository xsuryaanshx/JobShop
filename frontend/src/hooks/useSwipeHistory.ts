import { useSyncExternalStore } from "react";
import type { Job } from "@/data/jobs";

export type SwipeAction = "apply" | "skip";
export type ApplicationStatus = "draft" | "sent";

export interface SwipeRecord {
  id: string;
  job: Job;
  action: SwipeAction;
  status?: ApplicationStatus;
  timestamp: number;
  /** Custom keywords the user edited into their CV/cover letter draft */
  customKeywords?: string[];
}

const KEY = "jobshop:history:v1";

function read(): SwipeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cache: SwipeRecord[] = read();
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota / private mode */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot() {
  return cache;
}

function getServerSnapshot() {
  return [] as SwipeRecord[];
}

export function useSwipeHistory(): SwipeRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const historyStore = {
  add(job: Job, action: SwipeAction, status?: ApplicationStatus) {
    const record: SwipeRecord = {
      id: `${job.id}-${Date.now()}`,
      job,
      action,
      status,
      timestamp: Date.now(),
    };
    cache = [record, ...cache].slice(0, 50);
    persist();
    return record;
  },
  markSent(jobId: string) {
    cache = cache.map((r) =>
      r.job.id === jobId && r.action === "apply" ? { ...r, status: "sent" as const } : r
    );
    persist();
  },
  updateDraft(jobId: string, patch: Partial<Pick<SwipeRecord, "customKeywords">>) {
    cache = cache.map((r) =>
      r.job.id === jobId && r.action === "apply" && r.status !== "sent"
        ? { ...r, ...patch }
        : r
    );
    persist();
  },
  findDraft(jobId: string): SwipeRecord | undefined {
    return cache.find((r) => r.job.id === jobId && r.action === "apply" && r.status !== "sent");
  },
  remove(id: string) {
    cache = cache.filter((r) => r.id !== id);
    persist();
  },
  clear() {
    cache = [];
    persist();
  },
  all() {
    return cache;
  },
};
