# ACT Concrete website

A responsive ACT Concrete website with authentic supplied project photography, a server-backed estimate form, and a password-protected lead dashboard.

## Run locally

Requires Node.js 24 or later. There are no third-party package dependencies.

```powershell
Copy-Item .env.example .env
# Edit .env and set ACT_ADMIN_PASSWORD to a long, unique password.
npm start
```

Open `http://localhost:3000`. The admin dashboard is at `http://localhost:3000/admin`. The estimate form stores inquiries in `data/act.db`. It works even when the admin password has not been set; the dashboard then displays setup instructions. The database is excluded from Git.

Admin login stays active for 14 days in a signed, HTTP-only cookie, including across page reloads, browser restarts, and server deployments when `ACT_ADMIN_PASSWORD` remains the same. Signing out removes the browser cookie. Changing the admin password invalidates existing sessions.

## Deploy on Railway from GitHub

1. Create one Railway service from this repository. Railpack reads the Node 24 requirement in `package.json` and runs `npm start`.
2. Attach a persistent volume to the service at `/data`. Keep the service at **one replica** because SQLite and uploaded project photos live on that volume.
3. In Railway Variables, set `ACT_DATA_DIR=/data` and a strong `ACT_ADMIN_PASSWORD`. The app binds to `0.0.0.0` automatically on Railway, and Railway supplies `PORT`. Set `SITE_URL` to the Railway HTTPS URL initially, then to the custom domain when it is connected. Open the public URL without an `:8080` suffix.
4. Add `RESEND_API_KEY`, `RESEND_LEADS_FROM_EMAIL`, `RESEND_QUOTES_FROM_EMAIL`, and `ACT_LEAD_EMAIL` when the sending domain is verified in Resend. Store these in Railway Variables, not in Git.
5. Enable scheduled volume backups, generate a public Railway domain, and test a lead submission and admin login before pointing a custom domain at the service.

The GitHub repository intentionally excludes `.env` and the entire `data/` directory. Deploying it creates a fresh database with the two supplied gallery examples. Existing local leads and any gallery photos uploaded through the admin dashboard require a separate transfer of `data/act.db` and `data/project-media/` to the Railway volume. Do this before accepting real inquiries on the new deployment.

## Add before-and-after projects

1. Sign in at `/admin` and open **Project Gallery**.
2. Enter a title, choose a category, optionally add a description, and select the **Before** and **After** photos.
3. Click **Publish Project**. The new pair appears immediately in the public gallery and may appear in the homepage showcase.

The dashboard also lets you edit a project's text, replace either photo, or delete the project. Photos are resized in the browser for faster display, then saved under `data/project-media/`. The supplied projects are already in the dashboard and can be managed the same way. Back up both `data/act.db` and `data/project-media/` together.

## Email alerts and customer copies

Create a Resend account, verify a domain you control in Resend, and set these values in `.env` or the deployment environment:

You do **not** need to run a mail server or buy a separate mailbox to send these messages. Verify `actconcretewv.com` in Resend by adding the DNS records Resend provides. The two addresses below are sender identities; they do not automatically become inboxes. `ACT_LEAD_EMAIL` is the existing inbox where new lead alerts arrive and where customer replies are directed. If you also want mail sent directly to `leads@actconcretewv.com` or `quotes@actconcretewv.com` to arrive, set up email forwarding or hosted mailboxes for those addresses.

```text
RESEND_API_KEY=re_...
RESEND_LEADS_FROM_EMAIL="ACT Concrete Leads <leads@actconcretewv.com>"
RESEND_QUOTES_FROM_EMAIL="ACT Concrete Quotes <quotes@actconcretewv.com>"
ACT_LEAD_EMAIL=your-existing-inbox@example.com
SITE_URL=https://actconcretewv.com
```

Restart the server after changing the settings. Each new inquiry is saved first. Then the server queues an owner alert from the leads sender and, when the customer provides an email address, a confirmation copy from the quotes sender. The customer message explicitly says that it is **not a price quote**. Uploaded photos stay in the private dashboard and are not attached to emails. Sending errors do not discard leads; pending emails are retried automatically, and errors are logged by the server. Email jobs are stored in `data/act.db` alongside the leads. If these variables are unset, the form still saves leads but sends no email. Do not put the Resend API key in browser code or commit `.env`.

## Send a customer message or quote

In `/admin`, open a lead that includes an email address. Under **Email customer**, enter a message and, for a quote, an optional dollar amount. Review the recipient and amount in the confirmation prompt, then send. The email is queued through Resend. The lead detail shows the message, amount, and delivery status; use **Refresh status** to check for delivery. A successful quote moves an open lead to **Estimate Sent**. A message without an amount moves a new lead to **Contacted**. The history is saved in `data/act.db`.

Messages and quotes from this dashboard use `RESEND_QUOTES_FROM_EMAIL`; they require `RESEND_API_KEY` and a verified sender domain. Set `ACT_LEAD_EMAIL` as well so customer replies go to an inbox you monitor and new lead alerts continue to work. `RESEND_FROM_EMAIL` remains a fallback for older installations that have not set the two dedicated senders. Customers who did not provide an email cannot be emailed from the dashboard.

## Business content

- The phone number and free-estimate message come from the supplied ACT Concrete logo.
- The walkway and slab services are supported by the supplied project photos.
- The provided Facebook page could not be reliably read without a login, so location, email, broader services, and reviews are intentionally omitted.
- Gallery photos are organized in `public/images/`. Optimized WebP files are used on the site; the supplied PNG originals are preserved alongside them. The project records and service copy are centralized near the top of `public/app.js`.

## Before public deployment

Set `SITE_URL` to the public HTTPS origin and `ACT_ADMIN_PASSWORD` to a long, unique secret. Deploy to a Node host with persistent storage for the entire `data/` directory and HTTPS. Set `HOST=0.0.0.0` only when the server needs to accept connections from a trusted reverse proxy. Confirm the business service area, service list, and any future review text with ACT Concrete before adding them.

The server provides a sitemap at `/sitemap.xml`, blocks `/admin` in `robots.txt`, and keeps lead and photo data behind admin authentication. An authorized admin can view, search, filter, sort, update, annotate, export, and delete leads.
