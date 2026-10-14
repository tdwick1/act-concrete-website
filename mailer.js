const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

export function validEmail(value) {
  return (
    typeof value === "string" &&
    value.length <= 180 &&
    /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)
  );
}

export function buildLeadEmails(
  lead,
  { from, leadFrom, quoteFrom, ownerEmail, siteUrl },
) {
  const fields = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Property address", lead.address],
    ["City", lead.city],
    ["Service", lead.service],
    ["Approximate size", lead.size],
    ["Preferred timeline", lead.timeline],
    ["Project budget", lead.budget],
    ["Project details", lead.details],
    [
      "Project photo",
      lead.photo ? "Attached to the private lead record" : "None provided",
    ],
  ];
  const rows = fields
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 12px 8px 0;vertical-align:top;color:#445047">${escapeHtml(label)}</th><td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const plain = fields
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  const base = siteUrl?.replace(/\/$/, "");
  const adminLink = base
    ? `<p><a href="${escapeHtml(base)}/admin" style="color:#216b18">Open the lead dashboard</a></p>`
    : "";
  const owner = {
    from: leadFrom || from,
    to: [ownerEmail],
    subject: `New ACT Concrete inquiry: ${lead.service}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#101810"><h1 style="color:#258b19">New project inquiry</h1><p>A new lead was saved in the ACT Concrete dashboard.</p><table style="border-collapse:collapse">${rows}</table>${adminLink}</div>`,
    text: `New project inquiry\n\n${plain}${base ? `\n\nOpen the lead dashboard: ${base}/admin` : ""}`,
  };
  if (lead.email) owner.reply_to = lead.email;
  const customer = lead.email
    ? {
        from: quoteFrom || from,
        to: [lead.email],
        subject: "ACT Concrete received your project inquiry",
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#101810"><h1 style="color:#258b19">Thanks for reaching out.</h1><p>We received your project inquiry. Here is a copy of the information you sent:</p><table style="border-collapse:collapse">${rows}</table><p>This is a copy of your request, not a price quote. ACT Concrete will review it and contact you about the next steps.</p><p>Need to talk sooner? Call <a href="tel:+13044154277">304-415-4277</a>.</p></div>`,
        text: `Thanks for reaching out to ACT Concrete. We received your project inquiry.\n\n${plain}\n\nThis is a copy of your request, not a price quote. ACT Concrete will review it and contact you about the next steps.\nNeed to talk sooner? Call 304-415-4277.`,
      }
    : null;
  if (customer) customer.reply_to = ownerEmail;
  return { owner, customer };
}

export function parseAmountCents(value) {
  const amount = String(value ?? "").trim();
  if (!amount) return null;
  if (!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(amount))
    throw new Error(
      "Enter a dollar amount up to $999,999.99 with no more than two decimal places.",
    );
  const [dollars, cents = ""] = amount.split(".");
  const total = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  if (total < 1) throw new Error("The quote amount must be greater than zero.");
  return total;
}

export function buildCustomerMessage(
  lead,
  { from, quoteFrom, ownerEmail },
  { amountCents, message },
) {
  const amount =
    amountCents === null
      ? null
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amountCents / 100);
  const heading = amount
    ? "Your ACT Concrete quote"
    : "A message from ACT Concrete";
  const intro = amount
    ? `For your ${lead.service} inquiry, the quoted amount is ${amount}.`
    : `Regarding your ${lead.service} inquiry:`;
  const email = {
    from: quoteFrom || from,
    to: [lead.email],
    subject: amount ? `Your ACT Concrete quote: ${amount}` : heading,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#101810"><h1 style="color:#258b19">${heading}</h1><p>Hello ${escapeHtml(lead.name)},</p><p>${escapeHtml(intro)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p><p>Questions? Reply to this email or call <a href="tel:+13044154277">304-415-4277</a>.</p><p>ACT Concrete</p></div>`,
    text: `${heading}\n\nHello ${lead.name},\n\n${intro}\n\n${message}\n\nQuestions? Reply to this email or call 304-415-4277.\n\nACT Concrete`,
  };
  if (validEmail(ownerEmail)) email.reply_to = ownerEmail;
  return email;
}

export async function sendResendEmail(
  message,
  { apiKey, idempotencyKey, fetchImpl = fetch },
) {
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(
      `Resend HTTP ${response.status}: ${body.slice(0, 500)}`,
    );
    error.permanent =
      response.status >= 400 &&
      response.status < 500 &&
      response.status !== 429;
    throw error;
  }
  return response.json();
}
