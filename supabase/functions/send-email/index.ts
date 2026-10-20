// Supabase Edge Function: Automated Email Dispatcher via Resend
// Compatible with Deno / Edge Runtime and Node.js serverless functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  EmailTemplateData,
  getSubmissionAcknowledgementTemplate,
  getStatusUpdateTemplate,
  getIssueResolvedTemplate,
  getIssueReopenedTemplate,
  getAdminReplyTemplate,
} from "./templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestPayload {
  eventType:
  | "submission_acknowledgement"
  | "status_update"
  | "issue_resolved"
  | "issue_reopened"
  | "admin_reply"
  | "info_request";
  recipientEmail: string;
  data: EmailTemplateData;
  idempotencyKey?: string;
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderName = Deno.env.get("RESEND_SENDER_NAME") || "CET Grievance Redressal Cell";
    const senderEmail = Deno.env.get("RESEND_SENDER_EMAIL") || "notifications@cet.ac.in";
    const collegeName = Deno.env.get("COLLEGE_NAME") || "College of Engineering Trivandrum";
    const portalUrl = Deno.env.get("PORTAL_URL") || "https://feedback.cet.ac.in";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY is not configured in server environment secrets.",
          configured: false,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: RequestPayload = await req.json();
    const { eventType, recipientEmail, data, idempotencyKey } = payload;

    if (!recipientEmail || !eventType || !data?.referenceNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields in email dispatch payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare template based on event type
    const templateData: EmailTemplateData = {
      ...data,
      collegeName: data.collegeName || collegeName,
      portalUrl: data.portalUrl || portalUrl,
    };

    let emailContent: { subject: string; html: string; plainText: string };

    switch (eventType) {
      case "submission_acknowledgement":
        emailContent = getSubmissionAcknowledgementTemplate(templateData);
        break;
      case "status_update":
        emailContent = getStatusUpdateTemplate(templateData);
        break;
      case "issue_resolved":
        emailContent = getIssueResolvedTemplate(templateData);
        break;
      case "issue_reopened":
        emailContent = getIssueReopenedTemplate(templateData);
        break;
      case "admin_reply":
        emailContent = getAdminReplyTemplate(templateData, false);
        break;
      case "info_request":
        emailContent = getAdminReplyTemplate(templateData, true);
        break;
      default:
        throw new Error(`Unsupported email event type: ${eventType}`);
    }

    // Call Resend REST API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [recipientEmail],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.plainText,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[Resend Error]:", resendResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: resendResult?.message || "Failed to dispatch email through Resend API",
          statusCode: resendResponse.status,
        }),
        { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        providerMessageId: resendResult.id,
        status: "sent_to_provider",
        recipient: recipientEmail,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Email Handler Exception]:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error in email processor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
