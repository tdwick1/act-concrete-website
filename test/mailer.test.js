import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCustomerMessage,
  buildLeadEmails,
  parseAmountCents,
  sendResendEmail,
  validEmail,
} from "../mailer.js";

test("owner alert and customer copy include the inquiry without executing customer HTML", () => {
  const lead = {
    name: "Ada <script>alert(1)</script>",
    phone: "304-415-4277",
    email: "ada@example.com",
    service: "Concrete Slab",
    details: "Garage <b>floor</b>",
    photo: "data:image/png;base64,abc",
  };
  const { owner, customer } = buildLeadEmails(lead, {
    from: "ACT Concrete <estimates@act.example>",
    leadFrom: "ACT Concrete Leads <leads@act.example>",
    quoteFrom: "ACT Concrete Quotes <quotes@act.example>",
    ownerEmail: "owner@act.example",
    siteUrl: "https://act.example",
  });
  assert.equal(owner.from, "ACT Concrete Leads <leads@act.example>");
  assert.equal(customer.from, "ACT Concrete Quotes <quotes@act.example>");
  assert.deepEqual(owner.to, ["owner@act.example"]);
  assert.deepEqual(customer.to, ["ada@example.com"]);
  assert.equal(owner.reply_to, "ada@example.com");
  assert.match(owner.html, /&lt;script&gt;/);
  assert.doesNotMatch(owner.html, /<script>/);
  assert.match(
    customer.text,
    /This is a copy of your request, not a price quote/,
  );
  assert.match(customer.text, /Garage <b>floor<\/b>/);
  assert.doesNotMatch(customer.text, /data:image/);
  assert.match(owner.html, /https:\/\/act.example\/admin/);
});

test("optional customer email and Resend idempotency", async () => {
  assert.equal(validEmail("person@example.com"), true);
  assert.equal(validEmail("bad\n@example.com"), false);
  const { customer } = buildLeadEmails(
    { name: "A", phone: "123", email: "", service: "Concrete Slab" },
    { from: "a@example.com", ownerEmail: "owner@example.com" },
  );
  assert.equal(customer, null);
  let request;
  await sendResendEmail(
    {
      from: "a@example.com",
      to: ["b@example.com"],
      subject: "Test",
      text: "Hello",
    },
    {
      apiKey: "test-key",
      idempotencyKey: "job-123",
      fetchImpl: async (url, options) => {
        request = { url, options };
        return { ok: true, json: async () => ({ id: "email-1" }) };
      },
    },
  );
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.options.headers["Idempotency-Key"], "job-123");
  assert.equal(request.options.headers.Authorization, "Bearer test-key");
});

test("admin quote amounts are parsed exactly and invalid prices are rejected", () => {
  assert.equal(parseAmountCents(""), null);
  assert.equal(parseAmountCents("1"), 100);
  assert.equal(parseAmountCents("1250.5"), 125050);
  assert.equal(parseAmountCents("999999.99"), 99999999);
  for (const value of ["0", "0.00", "-10", "1.999", "1,000", "1000000", "abc"])
    assert.throws(() => parseAmountCents(value));
});

test("admin quote and message emails include the price and escape customer content", () => {
  const lead = {
    name: "Ada <Owner>",
    email: "ada@example.com",
    service: "Concrete Slab",
  };
  const config = {
    from: "ACT Concrete <estimates@act.example>",
    quoteFrom: "ACT Concrete Quotes <quotes@act.example>",
    ownerEmail: "owner@act.example",
  };
  const quote = buildCustomerMessage(lead, config, {
    amountCents: 125050,
    message: "Garage floor <script>alert(1)</script>",
  });
  assert.deepEqual(quote.to, ["ada@example.com"]);
  assert.equal(quote.from, "ACT Concrete Quotes <quotes@act.example>");
  assert.equal(quote.reply_to, "owner@act.example");
  assert.match(quote.subject, /\$1,250\.50/);
  assert.match(quote.text, /Garage floor <script>/);
  assert.match(quote.html, /&lt;script&gt;/);
  assert.doesNotMatch(quote.html, /<script>/);
  const message = buildCustomerMessage(
    lead,
    { ...config, ownerEmail: "" },
    { amountCents: null, message: "We can visit Tuesday." },
  );
  assert.equal(message.from, "ACT Concrete Quotes <quotes@act.example>");
  assert.equal(message.subject, "A message from ACT Concrete");
  assert.equal(message.reply_to, undefined);
  assert.doesNotMatch(message.text, /quoted amount/);
});
