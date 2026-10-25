// Professional, Accessible, Whitespace-First College HTML Email Templates

export interface EmailTemplateData {
  collegeName: string;
  portalUrl: string;
  recipientName?: string;
  referenceNumber: string;
  subject: string;
  submissionType?: string;
  category?: string;
  previousStatus?: string;
  newStatus?: string;
  remarks?: string;
  resolutionSummary?: string;
  messageContent?: string;
  updatedAt?: string;
}

const baseEmailWrapper = (title: string, contentHtml: string, portalUrl: string, collegeName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #172033;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 580px;
      margin: 40px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      padding: 32px 36px 20px 36px;
      border-bottom: 1px solid #f1f5f9;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1d4ed8;
      background: #eff6ff;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #172033;
      margin: 0;
    }
    .content {
      padding: 28px 36px;
      font-size: 14px;
      color: #334155;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 13px;
    }
    .meta-row:last-child {
      border-bottom: none;
    }
    .meta-label {
      color: #64748b;
      font-weight: 500;
    }
    .meta-val {
      color: #0f172a;
      font-weight: 600;
    }
    .button-container {
      margin: 28px 0 12px 0;
    }
    .button {
      display: inline-block;
      background-color: #1d4ed8;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 10px 22px;
      border-radius: 6px;
    }
    .footer {
      padding: 24px 36px;
      background-color: #fafbfc;
      border-top: 1px solid #f1f5f9;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer a {
      color: #64748b;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">${collegeName}</div>
      <h1 class="title">${title}</h1>
    </div>
    <div class="content">
      ${contentHtml}
      <div class="button-container">
        <a href="${portalUrl}" class="button">View in Student Portal &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">This is an automated notification from the ${collegeName} Grievance & Feedback Portal.</p>
      <p style="margin: 0;">If you have immediate questions, contact your college administration desk via <a href="${portalUrl}">${portalUrl}</a>.</p>
    </div>
  </div>
</body>
</html>
`;

export function getSubmissionAcknowledgementTemplate(data: EmailTemplateData) {
  const content = `
    <p>Dear ${data.recipientName || 'Student'},</p>
    <p>Thank you for submitting your feedback. Your grievance has been recorded in the college registry and assigned to the relevant department for administrative review.</p>
    
    <div class="meta-box">
      <div class="meta-row"><span class="meta-label">Reference Number</span><span class="meta-val">${data.referenceNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Submission Type</span><span class="meta-val">${data.submissionType || 'Complaint'}</span></div>
      <div class="meta-row"><span class="meta-label">Category</span><span class="meta-val">${data.category || 'General'}</span></div>
      <div class="meta-row"><span class="meta-label">Subject</span><span class="meta-val">${data.subject}</span></div>
    </div>

    <p style="margin-top: 16px;">You can track real-time status updates, view assigned representative remarks, and download confirmation receipts directly from your portal.</p>
  `;

  const plainText = `Dear ${data.recipientName || 'Student'},\n\n`
    + `Your feedback has been received with reference number: ${data.referenceNumber}.\n`
    + `Subject: ${data.subject}\n`
    + `Type: ${data.submissionType}\n`
    + `Category: ${data.category}\n\n`
    + `Please track your status on the portal: ${data.portalUrl}\n\n`
    + `${data.collegeName}`;

  return {
    subject: `[${data.collegeName}] Submission Received – ${data.referenceNumber}`,
    html: baseEmailWrapper("Feedback Received", content, data.portalUrl, data.collegeName),
    plainText,
  };
}

export function getStatusUpdateTemplate(data: EmailTemplateData) {
  const content = `
    <p>Dear ${data.recipientName || 'Student'},</p>
    <p>The status of your feedback (Ref: <strong>${data.referenceNumber}</strong>) has been updated by the department coordinator.</p>
    
    <div class="meta-box">
      <div class="meta-row"><span class="meta-label">Previous Status</span><span class="meta-val">${data.previousStatus || 'N/A'}</span></div>
      <div class="meta-row"><span class="meta-label">New Status</span><span class="meta-val" style="color: #1d4ed8;">${data.newStatus}</span></div>
      <div class="meta-row"><span class="meta-label">Subject</span><span class="meta-val">${data.subject}</span></div>
      ${data.remarks ? `<div class="meta-row"><span class="meta-label">Remarks</span><span class="meta-val">${data.remarks}</span></div>` : ''}
    </div>

    <p>Please log in to your student dashboard to review detailed timelines and any requested follow-up steps.</p>
  `;

  const plainText = `Dear ${data.recipientName || 'Student'},\n\n`
    + `The status of your submission ${data.referenceNumber} has been updated to: ${data.newStatus}.\n`
    + `Subject: ${data.subject}\n`
    + (data.remarks ? `Remarks: ${data.remarks}\n` : '')
    + `Track update: ${data.portalUrl}\n\n`
    + `${data.collegeName}`;

  return {
    subject: `[${data.collegeName}] Status Updated – ${data.referenceNumber}`,
    html: baseEmailWrapper("Status Update", content, data.portalUrl, data.collegeName),
    plainText,
  };
}

export function getIssueResolvedTemplate(data: EmailTemplateData) {
  const content = `
    <p>Dear ${data.recipientName || 'Student'},</p>
    <p>Your issue has been addressed and marked as <strong>Resolved</strong> by the designated department authority.</p>
    
    <div class="meta-box">
      <div class="meta-row"><span class="meta-label">Reference Number</span><span class="meta-val">${data.referenceNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Subject</span><span class="meta-val">${data.subject}</span></div>
      <div class="meta-row"><span class="meta-label">Resolution Summary</span><span class="meta-val">${data.resolutionSummary || 'The grievance has been investigated and remediated in accordance with college policy.'}</span></div>
      ${data.remarks ? `<div class="meta-row"><span class="meta-label">Additional Remarks</span><span class="meta-val">${data.remarks}</span></div>` : ''}
    </div>

    <p style="font-size: 13px; color: #64748b;">If you believe this issue has not been satisfactorily resolved, you have up to 14 days to request a reopening review through your student dashboard.</p>
  `;

  const plainText = `Dear ${data.recipientName || 'Student'},\n\n`
    + `Your issue ${data.referenceNumber} has been marked as Resolved.\n`
    + `Resolution Summary: ${data.resolutionSummary}\n`
    + `Review in portal: ${data.portalUrl}\n\n`
    + `${data.collegeName}`;

  return {
    subject: `[${data.collegeName}] Your Issue Has Been Resolved – ${data.referenceNumber}`,
    html: baseEmailWrapper("Issue Resolved", content, data.portalUrl, data.collegeName),
    plainText,
  };
}

export function getIssueReopenedTemplate(data: EmailTemplateData) {
  const content = `
    <p>Dear ${data.recipientName || 'Student'},</p>
    <p>Your submission <strong>${data.referenceNumber}</strong> has been reopened for further evaluation and action.</p>
    
    <div class="meta-box">
      <div class="meta-row"><span class="meta-label">Reference Number</span><span class="meta-val">${data.referenceNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Subject</span><span class="meta-val">${data.subject}</span></div>
      ${data.remarks ? `<div class="meta-row"><span class="meta-label">Reason / Remarks</span><span class="meta-val">${data.remarks}</span></div>` : ''}
    </div>

    <p>The assigned department representative has been notified and will prioritize your request.</p>
  `;

  const plainText = `Dear ${data.recipientName || 'Student'},\n\n`
    + `Your submission ${data.referenceNumber} has been reopened.\n`
    + `Subject: ${data.subject}\n`
    + `View in portal: ${data.portalUrl}\n\n`
    + `${data.collegeName}`;

  return {
    subject: `[${data.collegeName}] Issue Reopened – ${data.referenceNumber}`,
    html: baseEmailWrapper("Issue Reopened", content, data.portalUrl, data.collegeName),
    plainText,
  };
}

export function getAdminReplyTemplate(data: EmailTemplateData, isInfoRequest: boolean) {
  const title = isInfoRequest ? "Information Requested" : "Administrator Reply";
  const content = `
    <p>Dear ${data.recipientName || 'Student'},</p>
    <p>${isInfoRequest 
      ? `The college administration requires additional details regarding your submission (<strong>${data.referenceNumber}</strong>):`
      : `An administrator has replied to your submission (<strong>${data.referenceNumber}</strong>):`}</p>
    
    <div class="meta-box">
      <div class="meta-row"><span class="meta-label">Reference Number</span><span class="meta-val">${data.referenceNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Subject</span><span class="meta-val">${data.subject}</span></div>
      <div class="meta-row" style="margin-top: 6px;"><span class="meta-label">Message</span></div>
      <div style="padding: 8px 0; color: #1e293b; font-style: italic;">"${data.messageContent || ''}"</div>
    </div>

    <p>Please log in to your student portal to submit your clarification or response.</p>
  `;

  const plainText = `Dear ${data.recipientName || 'Student'},\n\n`
    + `${title} on submission ${data.referenceNumber}:\n`
    + `"${data.messageContent}"\n\n`
    + `Respond on portal: ${data.portalUrl}\n\n`
    + `${data.collegeName}`;

  return {
    subject: `[${data.collegeName}] ${title} – ${data.referenceNumber}`,
    html: baseEmailWrapper(title, content, data.portalUrl, data.collegeName),
    plainText,
  };
}
