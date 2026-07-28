import { supabase } from "./supabaseClient";
import type { Subscription } from "../types";
import { TESTING_BYPASS_PAYWALL } from "../data/constants";

export const FREE_SUBSCRIPTION: Subscription = { status: "free", plan: null, currentPeriodEnd: null };

export function isPaidStatus(status: Subscription["status"]): boolean {
  // See TESTING_BYPASS_PAYWALL's comment in data/constants.ts — temporary, pre-launch only.
  if (TESTING_BYPASS_PAYWALL) return true;
  return status === "active" || status === "trialing";
}

// No row exists until the teacher's first checkout attempt or promo redemption — that's a normal
// free-tier state, not an error, so this returns the free default rather than throwing.
export async function getSubscription(): Promise<Subscription> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return FREE_SUBSCRIPTION;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status,plan,current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return FREE_SUBSCRIPTION;

  return {
    status: data.status as Subscription["status"],
    plan: data.plan as Subscription["plan"],
    currentPeriodEnd: data.current_period_end,
  };
}

// supabase-js sets `data: null` on a non-2xx response and puts the raw Response on
// `error.context` instead of surfacing our function's own {error: "..."} body — this unwraps
// that so callers get the actual message ("That code isn't valid.", "Stripe is not configured
// yet.") rather than the SDK's generic "Edge Function returned a non-2xx status code".
async function invokeAndUnwrap<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const parsed = await context.json();
        if (parsed?.error) throw new Error(parsed.error);
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") throw parseErr;
      }
    }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function startCheckout(plan: "monthly" | "annual"): Promise<void> {
  const { url } = await invokeAndUnwrap<{ url: string }>("create-checkout-session", { plan, origin: window.location.origin });
  window.location.href = url;
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await invokeAndUnwrap<{ url: string }>("create-portal-session", { origin: window.location.origin });
  window.location.href = url;
}

export async function redeemPromoCode(code: string): Promise<void> {
  await invokeAndUnwrap("redeem-promo-code", { code });
}
