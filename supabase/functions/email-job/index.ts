import { createClient } from "npm:@supabase/supabase-js@2.112.3";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.3/cors";
import { escapeHtml, normalizeEmail, normalizeJobSlug } from "./validation.ts";

type JobEmailRequest = { email?: unknown; jobSlug?: unknown; website?: unknown };

const responseHeaders = { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" };
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: responseHeaders });

function readNamedKey(currentName: string, legacyName: string): string | null {
  const current = Deno.env.get(currentName);
  if (current) {
    try {
      const keys = JSON.parse(current) as Record<string, string>;
      if (keys.default) return keys.default;
    } catch {
      // Fall through to the legacy key during migration.
    }
  }
  return Deno.env.get(legacyName) ?? null;
}

async function digest(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return json({ error: "Invalid request." }, 413);

  let body: JobEmailRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Enter a valid email address." }, 400);
  }

  // A filled hidden field is treated as an automated submission without revealing the trap.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });

  const email = normalizeEmail(body.email);
  const jobSlug = normalizeJobSlug(body.jobSlug);
  if (!email || !jobSlug) return json({ error: "Enter a valid email address." }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseSecret = readNamedKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
  const senderToken = Deno.env.get("SENDER_API_TOKEN");
  const senderFromEmail = Deno.env.get("SENDER_FROM_EMAIL");
  const senderFromName = Deno.env.get("SENDER_FROM_NAME") ?? "Hustle & Rise";
  const hashSecret = Deno.env.get("EMAIL_HASH_SECRET");
  const siteUrl = (Deno.env.get("SITE_URL") ?? "https://hustleandrise.com").replace(/\/$/, "");
  if (!supabaseUrl || !supabaseSecret || !senderToken || !senderFromEmail || !hashSecret) {
    return json({ error: "Email delivery is temporarily unavailable." }, 503);
  }

  const supabase = createClient(supabaseUrl, supabaseSecret, { auth: { persistSession: false } });
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id,title,company,location,apply_url,expires_at,is_active")
    .eq("slug", jobSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (jobError) return json({ error: "Email delivery is temporarily unavailable." }, 503);
  if (!job || (job.expires_at && new Date(job.expires_at) <= new Date())) return json({ error: "This job is no longer available." }, 404);

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const [emailHash, ipHash] = await Promise.all([
    digest(`email:${email}`, hashSecret),
    digest(`ip:${forwardedFor}`, hashSecret),
  ]);
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  await supabase.from("email_job_requests").delete().lt("requested_at", thirtyDaysAgo);
  const [emailRate, ipRate] = await Promise.all([
    supabase.from("email_job_requests").select("id", { count: "exact", head: true }).eq("email_hash", emailHash).gte("requested_at", hourAgo),
    supabase.from("email_job_requests").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("requested_at", hourAgo),
  ]);
  if (emailRate.error || ipRate.error) return json({ error: "Email delivery is temporarily unavailable." }, 503);
  const emailCount = emailRate.count;
  const ipCount = ipRate.count;
  if ((emailCount ?? 0) >= 3 || (ipCount ?? 0) >= 10) {
    return json({ error: "Too many requests. Please try again later." }, 429);
  }

  const { data: audit, error: auditError } = await supabase
    .from("email_job_requests")
    .insert({ job_id: job.id, email_hash: emailHash, ip_hash: ipHash })
    .select("id")
    .single();
  if (auditError || !audit) return json({ error: "Email delivery is temporarily unavailable." }, 503);

  const jobUrl = `${siteUrl}/jobs/${jobSlug}/`;
  const title = escapeHtml(job.title);
  const company = job.company ? escapeHtml(job.company) : "Employer not supplied";
  const location = job.location ? escapeHtml(job.location) : "See original listing";
  const senderResponse = await fetch("https://api.sender.net/v2/message/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${senderToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: senderFromEmail, name: senderFromName },
      to: { email },
      subject: `Saved job: ${job.title.replace(/[\r\n]+/g, " ")}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><p style="color:#ff6b35;font-weight:700">HUSTLE &amp; RISE</p><h1 style="font-size:24px">${title}</h1><p><strong>${company}</strong><br>${location}</p><p>You asked us to send you this job. Review the current details before applying.</p><p><a href="${jobUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#5b5ce2;color:#fff;text-decoration:none;font-weight:700">View saved job</a></p><p style="font-size:12px;color:#687182">This one-time email does not subscribe you to marketing messages.</p></div>`,
      text: `${job.title}\n${job.company ?? "Employer not supplied"}\n${job.location ?? "See original listing"}\n\nView saved job: ${jobUrl}\n\nThis one-time email does not subscribe you to marketing messages.`,
    }),
  });

  let providerMessageId: string | null = null;
  try {
    const providerBody = await senderResponse.json() as { id?: string; message_id?: string };
    providerMessageId = providerBody.message_id ?? providerBody.id ?? null;
  } catch {
    // The delivery status is authoritative even when Sender returns no JSON body.
  }

  if (!senderResponse.ok) {
    await supabase.from("email_job_requests").update({ status: "failed", error_code: `sender_${senderResponse.status}` }).eq("id", audit.id);
    return json({ error: "We could not send that email. Please try again shortly." }, 502);
  }

  await supabase.from("email_job_requests").update({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: providerMessageId }).eq("id", audit.id);
  return json({ ok: true });
});
