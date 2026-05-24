import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const course_id = body?.course_id as string | undefined;
  if (!course_id) {
    return NextResponse.json({ error: "course_id required" }, { status: 400 });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, price, slug")
    .eq("id", course_id)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true });
  }

  // Free course — enroll directly
  if (!course.price || course.price === 0) {
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: user.id, course_id })
      .select()
      .single();

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  // Paid course — create Stripe checkout session
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "uah",
          unit_amount: Math.round(Number(course.price) * 100),
          product_data: { name: course.title },
        },
        quantity: 1,
      },
    ],
    metadata: { course_id: course.id, user_id: user.id },
    success_url: `${appUrl}/courses/${course.slug}?enrolled=true`,
    cancel_url: `${appUrl}/courses/${course.slug}`,
  });

  return NextResponse.json({ url: session.url });
}
