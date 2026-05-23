import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe sends raw body — disable Next.js body parsing
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { course_id, user_id } = session.metadata ?? {};

    if (!course_id || !user_id) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id, course_id })
      .select()
      .single();

    if (error && error.code !== "23505") {
      console.error("Enrollment insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
