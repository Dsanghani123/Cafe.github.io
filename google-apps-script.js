/**
 * ============================================================================
 * KINETIC DUO STUDIO — GOOGLE APPS SCRIPT FORM & EMAIL WEBHOOK
 * ============================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open Google Sheets (create a new blank spreadsheet or use your existing one).
 * 2. Click on "Extensions" -> "Apps Script" in the top menu bar.
 * 3. Delete any code in Code.gs and PASTE ALL the code below.
 * 4. Replace RECIPIENT_EMAIL below with your desired email (e.g., hello@kineticduo.com).
 * 5. Click the "Save" icon (💾).
 * 6. Click the blue "Deploy" button (top right) -> "New deployment".
 * 7. Click the gear icon (⚙️) next to "Select type" -> select "Web app".
 * 8. Set the configuration EXACTLY as follows:
 *    - Description: "Kinetic Duo Studio Form Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone", NOT "Only myself")
 * 9. Click "Deploy" -> Click "Authorize Access" -> Choose your Google Account -> Click "Advanced" -> Click "Go to Kinetic Duo Form Webhook (unsafe)" -> Click "Allow".
 * 10. Copy the "Web app URL" (ends in /exec) and paste it into js/main.js as GOOGLE_SCRIPT_WEBAPP_URL.
 */

// Configure the email where form submission notifications should be sent
const RECIPIENT_EMAIL = "hello@kineticduo.com"; // <-- Change to your preferred email address

function doPost(e) {
  try {
    let data = {};

    // 1. Parse incoming data (JSON or URL-encoded)
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // 2. Open active spreadsheet and target tab
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Leads");
    if (!sheet) {
      sheet = ss.getActiveSheet();
      sheet.setName("Leads");
    }

    // 3. Auto-create headers if first row is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Timestamp",
        "Form Type",
        "Page Source",
        "Name",
        "Email",
        "Store / Website URL",
        "Service / Goal",
        "Message / Requirements",
        "Raw Data"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F3EFE6");
      sheet.setFrozenRows(1);
    }

    // 4. Extract standard fields
    const timestamp = data.timestamp || new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const formType = data.form_type || "General Contact";
    const pageSource = data.page_source || "Website";
    const name = data.name || "N/A";
    const email = data.email || "N/A";
    const storeUrl = data.store_url || data.url || "N/A";
    const service = data.service || data.interest || data.role || "N/A";
    const message = data.message || data.notes || "N/A";
    const rawJson = JSON.stringify(data);

    // 5. Append to Google Sheet
    sheet.appendRow([
      timestamp,
      formType,
      pageSource,
      name,
      email,
      storeUrl,
      service,
      message,
      rawJson
    ]);

    // 6. Send Email Notification
    if (RECIPIENT_EMAIL && RECIPIENT_EMAIL.indexOf("@") !== -1) {
      const subject = `🚀 New Lead: ${name} (${formType} - ${pageSource})`;

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2DFD6; border-radius: 12px; background: #FAF9F5;">
          <div style="background: #0B0B0B; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #F59E0B; margin: 0; font-size: 1.3rem;">Kinetic Duo Studio — New Lead Alert</h2>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; font-weight: bold; width: 35%; color: #555;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; color: #0B0B0B; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; font-weight: bold; color: #555;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6;"><a href="mailto:${email}" style="color: #F59E0B; font-weight: 700; text-decoration: underline;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; font-weight: bold; color: #555;">Store / Website:</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; color: #0B0B0B;">${storeUrl !== "N/A" ? `<a href="${storeUrl}" target="_blank" style="color: #0B0B0B;">${storeUrl}</a>` : "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; font-weight: bold; color: #555;">Service / Goal:</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; color: #0B0B0B; font-weight: 600;">${service}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; font-weight: bold; color: #555;">Form Type:</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; color: #0B0B0B;"><span style="background: rgba(245,158,11,0.15); color: #B45309; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 700;">${formType}</span></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; font-weight: bold; color: #555;">Page Source:</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; color: #0B0B0B;">${pageSource}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; font-weight: bold; color: #555;">Timestamp:</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2DFD6; color: #7E7E7E;">${timestamp}</td>
            </tr>
          </table>

          <div style="background: #FFFFFF; border: 1px solid #E2DFD6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px; color: #0B0B0B;">Project Requirements / Message:</h4>
            <p style="margin: 0; color: #444; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="mailto:${email}?subject=Re: Your inquiry with Kinetic Duo Studio" style="display: inline-block; background: #F59E0B; color: #0B0B0B; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 0.95rem;">Reply to ${name} →</a>
          </div>
        </div>
      `;

      try {
        MailApp.sendEmail({
          to: RECIPIENT_EMAIL,
          subject: subject,
          htmlBody: htmlBody,
          replyTo: email !== "N/A" ? email : undefined
        });
      } catch (mailErr) {
        console.error("MailApp error:", mailErr);
      }
    }

    // 7. Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Lead successfully recorded and emailed." })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "active", message: "Kinetic Duo Studio Lead Webhook is active and listening for POST requests." })
  ).setMimeType(ContentService.MimeType.JSON);
}
