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

## Deploy on Railway from GitHub

1. Create one Railway service from this repository. Railpack reads the Node 24 requirement in `package.json` and runs `npm start`.
2. Attach a persistent volume to the service at `/data`. Keep the service at **one replica** because SQLite and uploaded project photos live on that volume.
3. In Railway Variables, set `ACT_DATA_DIR=/data`, `HOST=0.0.0.0`, and a strong `ACT_ADMIN_PASSWORD`. Railway supplies `PORT` automatically. Set `SITE_URL` to the Railway HTTPS URL initially, then to the custom domain when it is connected.
4. Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ACT_LEAD_EMAIL` when the sending domain is verified in Resend. Store these in Railway Variables, not in Git.
5. Enable scheduled volume backups, generate a public Railway domain, and test a lead submission and admin login before pointing a custom domain at the service.

The GitHub repository intentionally excludes `.env` and the entire `data/` directory. Deploying it creates a fresh database with the two supplied gallery examples. Existing local leads and any gallery photos uploaded through the admin dashboard require a separate transfer of `data/act.db` and `data/project-media/` to the Railway volume. Do this before accepting real inquiries on the new deployment.

## Add before-and-after projects

1. Sign in at `/admin` and open **Project Gallery**.
2. Enter a title, choose a category, optionally add a description, and select the **Before** and **After** photos.
3. Click **Publish Project**. The new pair appears immediately in the public gallery and may appear in the homepage showcase.

The dashboard also lets you edit a project's text, replace either photo, or delete the project. Photos are resized in the browser for faster display, then saved under `data/project-media/`. The supplied projects are already in the dashboard and can be managed the same way. Back up both `data/act.db` and `data/project-media/` together.

## Email alerts and customer copies

Create a Resend account, verify a domain you control in Resend, and set these values in `.env` or the deployment environment:

You do **not** need to run a mail server or buy a separate mailbox to send these messages. First register a domain for the business. In Resend, add that domain and copy the DNS records Resend gives you into the domain's DNS settings. After Resend marks the domain verified, replace `your-domain.com` below with the real domain. The `RESEND_FROM_EMAIL` address is the sender identity; it does not have to be an inbox. `ACT_LEAD_EMAIL` can be an email account you already use, such as Gmail, and the customer email's Reply-To points there. If you also want people to reach `estimates@your-domain.com` by typing that address directly, set up email forwarding to your existing inbox with your DNS provider or an email host.

```text
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="ACT Concrete <estimates@your-domain.com>"
ACT_LEAD_EMAIL=owner@your-domain.com
SITE_URL=https://your-domain.com
```

Restart the server after changing the settings. Each new inquiry is saved first. Then the server queues an owner alert and, when the customer provides an email address, a copy of their inquiry for the customer. The customer message explicitly says that it is **not a price quote**. Uploaded photos stay in the private dashboard and are not attached to emails. Sending errors do not discard leads; pending emails are retried automatically, and errors are logged by the server. Email jobs are stored in `data/act.db` alongside the leads. If these variables are unset, the form still saves leads but sends no email. Do not put the Resend API key in browser code or commit `.env`.

## Business content

- The phone number and free-estimate message come from the supplied ACT Concrete logo.
- The walkway and slab services are supported by the supplied project photos.
- The provided Facebook page could not be reliably read without a login, so location, email, broader services, and reviews are intentionally omitted.
- Gallery photos are organized in `public/images/`. Optimized WebP files are used on the site; the supplied PNG originals are preserved alongside them. The project records and service copy are centralized near the top of `public/app.js`.

## Before public deployment

Set `SITE_URL` to the public HTTPS origin and `ACT_ADMIN_PASSWORD` to a long, unique secret. Deploy to a Node host with persistent storage for the entire `data/` directory and HTTPS. Set `HOST=0.0.0.0` only when the server needs to accept connections from a trusted reverse proxy. Confirm the business service area, service list, and any future review text with ACT Concrete before adding them.

The server provides a sitemap at `/sitemap.xml`, blocks `/admin` in `robots.txt`, and keeps lead and photo data behind admin authentication. An authorized admin can view, search, filter, sort, update, annotate, export, and delete leads.
