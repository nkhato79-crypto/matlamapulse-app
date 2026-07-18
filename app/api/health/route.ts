import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const status: Record<string, unknown> = {
    status: "ok",
    app: "EventPulse",
    timestamp: new Date().toISOString(),
    uptime_s: Math.floor(process.uptime()),
  };

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [events, vendors, tasks] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("vendors").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }),
    ]);

    const hasError = events.error || vendors.error || tasks.error;
    status.supabase = hasError ? "error" : "connected";
    status.events_count = events.count ?? 0;
    status.vendors_count = vendors.count ?? 0;
    status.tasks_count = tasks.count ?? 0;

    if (hasError) {
      status.status = "degraded";
    }
  } catch {
    status.supabase = "disconnected";
    status.status = "degraded";
  }

  status.response_ms = Date.now() - start;
  return NextResponse.json(status);
}
