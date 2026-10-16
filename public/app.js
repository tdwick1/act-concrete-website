const PHONE = "304-514-4277",
  TEL = "tel:+13045144277",
  FB = "https://www.facebook.com/p/ACT-Concrete-61594546767402/";
const img = {
  logo: "/images/act-logo.webp",
  walk: "/images/walkway-finished.webp",
  walkPrep: "/images/walkway-prep.webp",
  slab: "/images/slab-finished.webp",
  slabPrep: "/images/slab-prep.webp",
};
const services = [
  {
    title: "Sidewalks & Walkways",
    slug: "/services/walkways",
    image: img.walk,
    kicker: "01 / WALKWAYS",
    copy: "Thoughtful layout, clean lines, and carefully finished paths that connect your property.",
  },
  {
    title: "Concrete Slabs",
    slug: "/services/slabs",
    image: img.slab,
    kicker: "02 / SLABS",
    copy: "Prepared and finished concrete surfaces for spaces such as garages and outbuildings.",
  },
];
let projects = [
  {
    id: "walkway-original",
    title: "A path with purpose",
    type: "Walkways",
    image: img.walk,
    prep: img.walkPrep,
    caption:
      "A concrete walkway project shown during layout and after the pour.",
  },
  {
    id: "slab-original",
    title: "A clean foundation for the space",
    type: "Slabs",
    image: img.slab,
    prep: img.slabPrep,
    caption:
      "A garage slab project shown during reinforcement and after finishing.",
  },
];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const a = (href, text, cls = "") =>
  `<a class="${cls}" href="${href}">${text}</a>`;
const arrow = '<span aria-hidden="true">↗</span>';
function header() {
  return `<header class="site-header"><div class="nav-shell"><a class="brand" href="/" aria-label="ACT Concrete home"><span class="brand-mark">ACT<span class="brand-stripe"></span></span><span class="brand-sub">CONCRETE</span></a><nav id="nav" class="nav" aria-label="Main navigation">${[
    ["/", "Home"],
    ["/services", "Services"],
    ["/projects", "Our Work"],
    ["/about", "About"],
    ["/reviews", "Reviews"],
    ["/contact", "Contact"],
  ]
    .map(([h, t]) => a(h, t, location.pathname === h ? "active" : ""))
    .join(
      "",
    )}</nav><div class="nav-actions"><a class="nav-phone" href="${TEL}">${PHONE}</a>${a("/contact", "Free Estimate " + arrow, "btn btn-green nav-cta")}<button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div></div></header>`;
}
function footer() {
  return `<footer class="footer"><div class="container footer-main"><div class="footer-intro"><a class="brand footer-brand" href="/"><span class="brand-mark">ACT<span class="brand-stripe"></span></span><span class="brand-sub">CONCRETE</span></a><p>Strong foundations.<br>Brighter tomorrows.</p><a href="${FB}" target="_blank" rel="noopener">Facebook ${arrow}</a></div><div><h3>Explore</h3>${[
    ["/", "Home"],
    ["/services", "Services"],
    ["/projects", "Projects"],
    ["/about", "About"],
    ["/reviews", "Reviews"],
    ["/contact", "Contact"],
  ]
    .map(([h, t]) => a(h, t))
    .join(
      "",
    )}</div><div><h3>Concrete work</h3>${services.map((s) => a(s.slug, s.title)).join("")}<a href="/contact">Discuss your project</a></div><div class="footer-contact"><h3>Let's build something</h3><a class="footer-phone" href="${TEL}">${PHONE}</a><p>Call or send a project inquiry for a free estimate.</p>${a("/contact", "Request an Estimate " + arrow, "btn btn-outline")}</div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ACT Concrete. All rights reserved.</span><span>Built with care, from the ground up.</span></div></footer><div class="mobile-cta"><a href="${TEL}">Call Now</a><a href="/contact">Free Estimate ${arrow}</a></div>`;
}
function sectionHead(eyebrow, title, copy = "") {
  return `<div class="section-head"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>${copy ? `<p>${copy}</p>` : ""}</div>`;
}
function serviceCards() {
  return `<div class="service-grid">${services.map((s) => `<a class="service-card" href="${s.slug}"><img src="${s.image}" alt="${s.title} project by ACT Concrete" loading="lazy"><div class="service-shade"></div><div class="service-content"><span>${s.kicker}</span><h3>${s.title}</h3><p>${s.copy}</p><span class="service-link">Explore Service ${arrow}</span></div></a>`).join("")}</div>`;
}
function galleryCards(filter = "All", limit = 2) {
  const visible = projects
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => filter === "All" || p.type === filter)
    .slice(0, limit);
  return visible.length
    ? `<div class="project-grid">${visible.map(({ p, i }) => `<button class="project-card" data-gallery="${i}" aria-label="View ${esc(p.type)} before and after photos"><img src="${esc(p.image)}" alt="After photo of ${esc(p.title)}" loading="lazy"><span class="project-overlay"><span class="project-type">${esc(p.type)}</span><strong>${esc(p.title)}</strong><span class="project-open">View Before & After ${arrow}</span></span></button>`).join("")}</div>`
    : '<div class="gallery-empty">Project photos coming soon.</div>';
}
function cta() {
  return `<section class="cta-section"><div class="container cta-inner"><div><span class="eyebrow">LET'S GET TO WORK</span><h2>Have a project<br>in mind?</h2><p>Tell us what you're planning. We'll help you take the next step.</p></div><div class="cta-actions">${a("/contact", "Get a Free Estimate " + arrow, "btn btn-green btn-large")}${a(TEL, "Call " + PHONE, "btn btn-line-light")}</div></div></section>`;
}
function home() {
  return `<section class="hero"><img src="${img.walk}" alt="Freshly finished ACT Concrete walkway" class="hero-img"><div class="hero-scrim"></div><div class="container hero-content"><div class="hero-rule"><span class="pulse"></span> CONCRETE WORK THAT MAKES AN IMPACT</div><h1>BUILT RIGHT.<br><em>BUILT TO LAST.</em></h1><p>From the first layout line to the final finish, ACT Concrete brings care and precision to the work beneath your feet.</p><div class="hero-actions">${a("/contact", "Get a Free Estimate " + arrow, "btn btn-green btn-large")}${a("/projects", "Explore Our Work", "btn btn-glass")}</div><div class="hero-caption"><span>01 / 02</span><span>REAL PROJECTS. REAL CRAFT.</span></div></div><div class="hero-side">ACT CONCRETE / BUILT WITH PURPOSE</div></section>
<section class="trust-bar"><div class="container trust-inner"><span>QUALITY CRAFTSMANSHIP</span><i></i><span>ATTENTION TO DETAIL</span><i></i><span>FROM PREP TO FINISH</span></div></section>
<section class="section services-section" id="services"><div class="container">${sectionHead("WHAT WE DO", "CONCRETE THAT<br><em>WORKS HARD.</em>", "Concrete is more than a surface. It shapes the way you move through and use your space. Explore the work shown in our project portfolio.")}${serviceCards()}<div class="services-bottom"><span>Have another concrete project in mind?</span>${a("/contact", "Tell Us About It " + arrow, "text-link")}</div></div></section>
<section class="section work-section"><div class="container">${sectionHead("SELECTED WORK", "THE WORK<br><em>SPEAKS FOR ITSELF.</em>", "See actual ACT Concrete projects, from the early preparation to the finished surface.")}${galleryCards()}<div class="align-right">${a("/projects", "View All Project Photos " + arrow, "text-link")}</div></div></section>
<section class="approach-section"><div class="approach-photo"><img src="${img.slabPrep}" alt="Concrete slab reinforcement before the pour" loading="lazy"><span class="image-note">PREPARATION IS PART OF THE FINISH.</span></div><div class="approach-copy"><span class="eyebrow">THE ACT APPROACH</span><h2>GOOD WORK<br>STARTS <em>BELOW<br>THE SURFACE.</em></h2><p>A strong result is built through the details you see and the preparation you don't. We focus on clear plans, careful installation, and a finish that serves the space.</p><div class="approach-points"><div><b>01</b><span>Plan the work</span></div><div><b>02</b><span>Prepare the site</span></div><div><b>03</b><span>Finish with care</span></div></div>${a("/about", "More About ACT " + arrow, "btn btn-green")}</div></section>
<section class="section process-section"><div class="container">${sectionHead("OUR PROCESS", "START SIMPLE.<br><em>BUILD CONFIDENTLY.</em>")}<div class="steps">${[
    [
      "01",
      "Tell us about it",
      "Share the type of project, site details, and what you want to achieve.",
    ],
    [
      "02",
      "Talk through the plan",
      "We discuss your needs and the details that matter for the work.",
    ],
    [
      "03",
      "Get your estimate",
      "Review the scope and next steps before any work begins.",
    ],
    [
      "04",
      "See it take shape",
      "Once scheduled, the agreed-upon concrete work gets underway.",
    ],
  ]
    .map(
      ([n, t, d]) =>
        `<div class="step"><b>${n}</b><h3>${t}</h3><p>${d}</p></div>`,
    )
    .join("")}</div></div></section>
<section class="reviews-teaser"><div class="container reviews-teaser-inner"><div><span class="eyebrow">COMMUNITY & CONNECTION</span><h2>STAY IN THE LOOP.</h2><p>Visit ACT Concrete on Facebook for updates and to connect with the team.</p></div>${a(FB, "Visit Our Facebook Page " + arrow, "btn btn-outline-dark")}</div></section>${cta()}`;
}
function intro(eyebrow, title, copy, photo) {
  return `<section class="page-intro ${photo ? "page-intro-photo" : ""}">${photo ? `<img src="${photo}" alt="ACT Concrete project" class="page-intro-bg">` : ""}<div class="container"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${copy}</p></div></section>`;
}
function servicesPage() {
  return `${intro("OUR SERVICES", "WORK THAT<br><em>HOLDS UP.</em>", "Explore the types of concrete work shown in ACT Concrete’s project portfolio.", img.slabPrep)}<section class="section"><div class="container">${serviceCards()}<div class="info-band"><strong>Different project?</strong><p>Tell us what you need. We can discuss whether it fits our scope.</p>${a("/contact", "Ask ACT Concrete " + arrow, "btn btn-green")}</div></div></section>${cta()}`;
}
function servicePage(kind) {
  const walkway = kind === "walkways",
    s = services[walkway ? 0 : 1],
    photo = walkway ? img.walk : img.slab,
    prep = walkway ? img.walkPrep : img.slabPrep;
  return `${intro("CONCRETE SERVICES", walkway ? "WALKWAYS<br><em>WITH PURPOSE.</em>" : "SOLID WORK<br><em>FROM THE GROUND UP.</em>", walkway ? "Clean, practical paths shaped with attention to layout and finish." : "Concrete slab work with attention to the preparation and finished surface.", photo)}<section class="section"><div class="container service-detail"><div><span class="eyebrow">${s.title.toUpperCase()}</span><h2>THE DETAILS MAKE<br><em>THE DIFFERENCE.</em></h2><p>${s.copy}</p><p>Every site brings its own conditions and goals. Start with a conversation so the project can be reviewed on its own terms.</p>${a("/contact", "Discuss This Project " + arrow, "btn btn-green")}</div><div class="detail-image"><img src="${prep}" alt="${s.title} preparation by ACT Concrete" loading="lazy"><span>PROJECT PREPARATION</span></div></div></section><section class="section dark-panel"><div class="container">${sectionHead("SEE THE WORK", "FROM PREP<br><em>TO FINISH.</em>")}${galleryCards()}</div></section>${cta()}`;
}
function projectsPage() {
  const categories = [...new Set(projects.map((p) => p.type))];
  return `${intro("PROJECT GALLERY", "REAL WORK.<br><em>REAL RESULTS.</em>", "See ACT Concrete projects from before the work begins to the finished surface.", img.walk)}<section class="section"><div class="container"><div class="gallery-tabs" role="group" aria-label="Filter projects"><button class="chip active" data-filter="All">All Projects</button>${categories.map((c) => `<button class="chip" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div><div id="gallery-list">${galleryCards("All", Infinity)}</div><p class="gallery-note">Project photos supplied by ACT Concrete. General locations appear only when provided.</p></div></section>${cta()}`;
}
function aboutPage() {
  return `${intro("ABOUT ACT CONCRETE", "BUILT ON QUALITY.<br><em>FOCUSED ON DETAIL.</em>", "Concrete work is an investment in the way your property looks, feels, and functions.", img.slab)}<section class="section"><div class="container about-grid"><div class="about-logo"><img src="${img.logo}" alt="ACT Concrete logo with green awareness ribbon" loading="lazy"></div><div class="about-text"><span class="eyebrow">WHO WE ARE</span><h2>PRIDE IN<br><em>THE PROCESS.</em></h2><p>At ACT Concrete, we understand that each concrete project starts with a real need: a path that connects, a slab that supports, or a space that works better. The supplied project photos show the work at multiple stages, from groundwork to the finished surface.</p><p>Tell us what you're planning. We'll talk through the scope and the next steps with you.</p>${a("/contact", "Start a Conversation " + arrow, "btn btn-green")}</div></div></section><section class="section values"><div class="container">${sectionHead("OUR FOCUS", "WHAT GOES INTO<br><em>EVERY PROJECT.</em>")}<div class="value-grid"><div><span>01</span><h3>Thoughtful prep</h3><p>Good concrete work begins before the pour.</p></div><div><span>02</span><h3>Practical purpose</h3><p>Surfaces should serve the people who use them.</p></div><div><span>03</span><h3>Careful finish</h3><p>Attention to the visible details brings the work together.</p></div></div></div></section>${cta()}`;
}
function reviewsPage() {
  return `${intro("CUSTOMER REVIEWS", "YOUR WORDS<br><em>MATTER.</em>", "We’ll share customer feedback here when verified reviews are available.", img.walkPrep)}<section class="section"><div class="container empty-reviews"><div class="quote-mark">“</div><h2>CUSTOMER TESTIMONIALS<br><em>COMING SOON.</em></h2><p>For current updates or to connect with the team, visit ACT Concrete’s Facebook page.</p>${a(FB, "Visit Our Facebook Page " + arrow, "btn btn-green")}</div></section>${cta()}`;
}
function field(name, label, type = "text", required = false, extra = "") {
  return `<label class="field"><span>${label}${required ? " <b>*</b>" : ""}</span><input name="${name}" type="${type}" ${required ? "required" : ""} ${extra}></label>`;
}
function select(name, label, options, required = false) {
  return `<label class="field"><span>${label}${required ? " <b>*</b>" : ""}</span><select name="${name}" ${required ? "required" : ""}><option value="">Select an option</option>${options.map((o) => `<option>${o}</option>`).join("")}</select></label>`;
}
function contactPage() {
  return `${intro("FREE ESTIMATES", "LET’S GET YOUR<br><em>PROJECT STARTED.</em>", "Tell us a little about your concrete project and we’ll be in touch to discuss the details.", img.slab)}<section class="section contact-section"><div class="container contact-layout"><aside class="contact-aside"><span class="eyebrow">GET IN TOUCH</span><h2>GOOD PROJECTS<br>START WITH A<br><em>CONVERSATION.</em></h2><p>Ready to talk through an idea? Call or use the form and tell us what you have in mind.</p><a class="contact-phone" href="${TEL}">${PHONE} ${arrow}</a><div class="contact-mini"><b>What to expect</b><p>Share your project type and location. ACT Concrete will review your inquiry and discuss next steps.</p></div><a href="${FB}" target="_blank" rel="noopener" class="text-link">Find us on Facebook ${arrow}</a></aside><div class="form-card"><div class="form-top"><span>PROJECT INQUIRY</span><strong>01 / 01</strong></div><h3>Tell us about your project.</h3><p>Fields marked * are required.</p><form id="estimate-form"><label class="form-trap" aria-hidden="true">Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label><div class="form-grid">${field("name", "Full Name", "text", true, 'autocomplete="name"')}${field("phone", "Phone Number", "tel", true, 'autocomplete="tel"')}${field("email", "Email Address", "email", false, 'autocomplete="email"')}${field("address", "Property Address", "text", false, 'autocomplete="street-address"')}${field("city", "City", "text", false, 'autocomplete="address-level2"')}${select("service", "Service Needed", ["Sidewalk / Walkway", "Concrete Slab", "Other Concrete Work"], true)}${select("size", "Approximate Project Size", ["Small Project", "Medium Project", "Large Project", "Not Sure"])}${select("timeline", "Preferred Timeline", ["As Soon As Possible", "Within 1 Month", "Within 1–3 Months", "Just Planning"])}${field("budget", "Project Budget (optional)")}</div><label class="field"><span>Project Details</span><textarea name="details" rows="5" placeholder="Tell us about the space, your goals, and anything else we should know."></textarea></label><label class="field upload-field"><span>Project Photo (optional)</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG, or WebP, up to 3 MB.</small></label><button class="btn btn-green btn-large form-submit" type="submit">Request My Free Estimate ${arrow}</button><p id="form-status" role="status" aria-live="polite"></p></form></div></div></section>`;
}
function adminPage() {
  return `<div class="admin-shell"><aside class="admin-side"><a class="brand" href="/"><span class="brand-mark">ACT<span class="brand-stripe"></span></span><span class="brand-sub">CONCRETE</span></a><div class="admin-side-label">ADMIN WORKSPACE</div><a class="admin-side-link" href="/admin">▦ &nbsp; Dashboard</a><a class="admin-side-link" href="/projects">↗ &nbsp; View Gallery</a><button id="logout" class="admin-logout" hidden>Sign out</button></aside><main class="admin-main"><div class="admin-top"><div><span class="eyebrow">ACT CONCRETE / DASHBOARD</span><h1 id="admin-title">LEAD INBOX</h1></div><button id="export" class="btn btn-outline-dark" hidden>Export CSV ↓</button></div><div class="admin-tabs"><button id="admin-leads" class="active" type="button">Leads</button><button id="admin-projects" type="button">Project Gallery</button></div><div id="admin-content"><div class="admin-loading">Loading dashboard…</div></div></main></div>`;
}
async function api(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: "Server response could not be read." };
  }
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}
async function photoData(file) {
  if (!file || !file.size) return "";
  if (file.size > 3_000_000) throw new Error("Photo must be under 3 MB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Use a JPG, PNG, or WebP photo.");
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the photo."));
    reader.readAsDataURL(file);
  });
}
function bindContact() {
  const form = document.querySelector("#estimate-form");
  if (!form) return;
  api("/api/config")
    .then((config) => {
      if (config.emailConfigured) {
        const note = document.createElement("small");
        note.textContent =
          "Include your email to receive a copy of your inquiry.";
        form.querySelector('input[name="email"]').after(note);
      }
    })
    .catch(() => {});
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.querySelector("#form-status"),
      button = form.querySelector("button[type=submit]");
    status.className = "";
    status.textContent = "";
    button.disabled = true;
    button.textContent = "Sending…";
    try {
      const fd = new FormData(form),
        b = Object.fromEntries(fd.entries());
      b.photo = await photoData(fd.get("photo"));
      await api("/api/leads", "POST", b);
      form.reset();
      status.className = "success";
      status.textContent =
        "Thank you for contacting ACT Concrete! We've received your project inquiry and will be in touch soon.";
    } catch (err) {
      status.className = "error";
      status.textContent =
        err.message || "Unable to send. Please call us instead.";
    } finally {
      button.disabled = false;
      button.innerHTML = "Request My Free Estimate " + arrow;
    }
  });
}
function bindGallery() {
  document.querySelectorAll("[data-filter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("[data-filter]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelector("#gallery-list").innerHTML = galleryCards(
        btn.dataset.filter,
        Infinity,
      );
    }),
  );
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-gallery]");
    if (!card) return;
    const p = projects[Number(card.dataset.gallery)];
    if (!p) return;
    const dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.innerHTML = `<button class="lightbox-close" aria-label="Close gallery">×</button><div class="lightbox-inner"><div class="lightbox-title"><span class="eyebrow">ACT PROJECT / ${esc(p.type.toUpperCase())}</span><h2>${esc(p.title)}</h2><p>${esc(p.caption)}</p></div><div class="lightbox-pictures"><figure><img src="${esc(p.prep)}" alt="Before photo of ${esc(p.title)}"><figcaption>Before</figcaption></figure><figure><img src="${esc(p.image)}" alt="After photo of ${esc(p.title)}"><figcaption>After</figcaption></figure></div></div>`;
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("button").onclick = () => dialog.close();
    dialog.addEventListener("click", (ev) => {
      if (ev.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => dialog.remove());
  });
}
let leadRows = [];
function adminLogin(message = "") {
  const configured = window.adminConfigured;
  document.querySelector("#admin-content").innerHTML =
    `<div class="admin-login"><span class="eyebrow">SECURE ACCESS</span><h2>${configured ? "Sign in to manage your site" : "Admin setup needed"}</h2><p>${configured ? "Enter the server admin password to manage leads and project photos." : "Set ACT_ADMIN_PASSWORD on the server and restart it to enable this dashboard. Lead submissions are still saved to the server database."}</p>${configured ? `<form id="login-form"><label class="field"><span>Admin password</span><input name="password" type="password" required autocomplete="current-password"></label><button class="btn btn-green" type="submit">Sign In ${arrow}</button><p class="error" role="status">${esc(message)}</p></form>` : ""}</div>`;
  document
    .querySelector("#login-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api("/api/admin/login", "POST", {
          password: e.target.password.value,
        });
        await (location.hash === "#projects"
          ? loadAdminProjects()
          : loadAdmin());
      } catch (err) {
        adminLogin(err.message);
      }
    });
}
function statusSelect(row) {
  return `<select class="status-select" data-status="${row.id}" aria-label="Status for ${esc(row.name)}">${["New", "Contacted", "Estimate Scheduled", "Estimate Sent", "Won", "Lost"].map((s) => `<option ${s === row.status ? "selected" : ""}>${s}</option>`).join("")}</select>`;
}
function drawAdmin() {
  const q = (document.querySelector("#lead-search")?.value || "").toLowerCase(),
    service = document.querySelector("#service-filter")?.value || "",
    status = document.querySelector("#status-filter")?.value || "",
    sort = document.querySelector("#sort-filter")?.value || "new";
  const rows = leadRows
    .filter(
      (r) =>
        (!service || r.service === service) &&
        (!status || r.status === status) &&
        `${r.name} ${r.phone} ${r.email} ${r.city} ${r.details}`
          .toLowerCase()
          .includes(q),
    )
    .sort((a, b) =>
      sort === "old"
        ? a.created_at.localeCompare(b.created_at)
        : b.created_at.localeCompare(a.created_at),
    );
  document.querySelector("#lead-table").innerHTML = rows.length
    ? `<div class="table-scroll"><table><thead><tr><th>Date</th><th>Customer</th><th>Phone</th><th>Service</th><th>Location</th><th>Status</th><th></th></tr></thead><tbody>${rows.map((r) => `<tr><td>${new Date(r.created_at).toLocaleDateString()}</td><td><strong>${esc(r.name)}</strong><small>${esc(r.email)}</small></td><td><a href="tel:${esc(r.phone)}">${esc(r.phone)}</a></td><td>${esc(r.service)}</td><td>${esc(r.city || r.address || "—")}</td><td>${statusSelect(r)}</td><td><button class="row-action" data-view="${r.id}">View ${arrow}</button></td></tr>`).join("")}</tbody></table></div>`
    : '<div class="empty-table">No leads match these filters.</div>';
  document.querySelectorAll("[data-status]").forEach(
    (s) =>
      (s.onchange = async () => {
        try {
          await api(`/api/admin/leads/${s.dataset.status}`, "PATCH", {
            status: s.value,
          });
          await loadAdmin();
        } catch (err) {
          alert(err.message);
        }
      }),
  );
  document
    .querySelectorAll("[data-view]")
    .forEach((b) => (b.onclick = () => viewLead(b.dataset.view)));
}
async function loadAdmin() {
  try {
    const d = await api("/api/admin/leads");
    leadRows = d.leads;
    document.querySelector("#logout").hidden = false;
    document.querySelector("#export").hidden = false;
    const count = (s) => leadRows.filter((r) => r.status === s).length;
    document.querySelector("#admin-content").innerHTML = `<div class="stats">${[
      ["Total Leads", leadRows.length],
      ["New Leads", count("New")],
      ["Contacted", count("Contacted")],
      ["Estimates Scheduled", count("Estimate Scheduled")],
      ["Closed / Won", count("Won")],
    ]
      .map(
        ([l, n]) =>
          `<div class="stat"><span>${l}</span><strong>${n}</strong></div>`,
      )
      .join(
        "",
      )}</div><div class="leads-panel"><div class="panel-heading"><div><h2>All inquiries</h2><p>Manage project requests from one place.</p></div></div><div class="filters"><input id="lead-search" type="search" placeholder="Search name, phone, city, details…" aria-label="Search leads"><select id="service-filter" aria-label="Filter by service"><option value="">All services</option><option>Sidewalk / Walkway</option><option>Concrete Slab</option><option>Other Concrete Work</option></select><select id="status-filter" aria-label="Filter by status"><option value="">All statuses</option>${["New", "Contacted", "Estimate Scheduled", "Estimate Sent", "Won", "Lost"].map((s) => `<option>${s}</option>`).join("")}</select><select id="sort-filter" aria-label="Sort by date"><option value="new">Newest first</option><option value="old">Oldest first</option></select></div><div id="lead-table"></div></div>`;
    document
      .querySelectorAll(".filters input,.filters select")
      .forEach((el) => el.addEventListener("input", drawAdmin));
    drawAdmin();
    document.querySelector("#export").onclick = () =>
      (location.href = "/api/admin/export");
    document.querySelector("#logout").onclick = async () => {
      await api("/api/admin/logout", "POST");
      adminLogin();
    };
  } catch {
    adminLogin();
  }
}
function setAdminTab(tab) {
  document.querySelector("#admin-title").textContent =
    tab === "projects" ? "PROJECT GALLERY" : "LEAD INBOX";
  document
    .querySelector("#admin-leads")
    .classList.toggle("active", tab === "leads");
  document
    .querySelector("#admin-projects")
    .classList.toggle("active", tab === "projects");
  document.querySelector("#export").hidden = tab === "projects";
}
async function projectImageData(file) {
  if (!file) return "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose JPG, PNG, or WebP photos.");
  if (file.size > 20_000_000) throw new Error("Choose a photo under 20 MB.");
  const bitmap = await createImageBitmap(file),
    scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const result = canvas.toDataURL("image/webp", 0.84);
  if (result.length > 7_000_000)
    throw new Error("This photo is too large after optimization.");
  return result;
}
let adminProjects = [];
async function loadAdminProjects() {
  try {
    const d = await api("/api/admin/projects");
    adminProjects = d.projects;
    setAdminTab("projects");
    document.querySelector("#logout").hidden = false;
    document.querySelector("#admin-content").innerHTML =
      `<div class="gallery-admin-layout"><section class="gallery-editor"><div class="panel-heading"><h2 id="project-form-title">Add a before & after</h2><p>Upload two photos of the same project. New entries appear in the public gallery as soon as you save.</p></div><form id="project-form"><label class="field"><span>Project title *</span><input name="title" maxlength="120" required placeholder="e.g. New concrete walkway"></label><label class="field"><span>Category *</span><select name="category" required><option value="">Select category</option>${["Walkways", "Slabs", "Driveways", "Patios", "Other Concrete Work"].map((c) => `<option>${c}</option>`).join("")}</select></label><label class="field"><span>Short description</span><textarea name="description" rows="3" maxlength="1000" placeholder="Describe the work shown in these photos."></textarea></label><div id="current-pair"></div><div class="upload-pair"><label class="field"><span>Before photo *</span><input name="before" type="file" accept="image/jpeg,image/png,image/webp" required><small>Site preparation or original condition.</small></label><label class="field"><span>After photo *</span><input name="after" type="file" accept="image/jpeg,image/png,image/webp" required><small>The finished concrete surface.</small></label></div><p class="upload-hint">JPG, PNG, or WebP. Photos are resized automatically for the website.</p><div class="editor-actions"><button class="btn btn-green" type="submit">Publish Project ${arrow}</button><button class="btn btn-outline-dark" id="cancel-project-edit" type="button" hidden>Cancel Edit</button></div><p id="project-form-status" role="status" aria-live="polite"></p></form></section><section class="gallery-manager"><div class="panel-heading"><h2>Published projects</h2><p>${adminProjects.length} project${adminProjects.length === 1 ? "" : "s"} in the gallery.</p></div><div class="managed-projects">${adminProjects.length ? adminProjects.map((p) => `<article class="managed-project"><div class="managed-photos"><figure><img src="${esc(p.before_image)}" alt="Before photo of ${esc(p.title)}"><figcaption>Before</figcaption></figure><figure><img src="${esc(p.after_image)}" alt="After photo of ${esc(p.title)}"><figcaption>After</figcaption></figure></div><div class="managed-copy"><span>${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div><button data-edit-project="${esc(p.id)}">Edit</button><button data-delete-project="${esc(p.id)}">Delete</button></div></div></article>`).join("") : '<p class="empty-table">No projects published yet.</p>'}</div></section></div>`;
    const form = document.querySelector("#project-form"),
      status = document.querySelector("#project-form-status");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const button = form.querySelector("[type=submit]");
      button.disabled = true;
      button.textContent = "Saving…";
      status.textContent = "";
      try {
        const fields = form.elements,
          id = form.dataset.editId || "",
          body = {
            title: fields.namedItem("title").value,
            category: fields.namedItem("category").value,
            description: fields.namedItem("description").value,
            beforeImage: await projectImageData(
              fields.namedItem("before").files[0],
            ),
            afterImage: await projectImageData(
              fields.namedItem("after").files[0],
            ),
          };
        await api(
          id ? `/api/admin/projects/${id}` : "/api/admin/projects",
          id ? "PATCH" : "POST",
          body,
        );
        await loadAdminProjects();
        document.querySelector("#project-form-status").className = "success";
        document.querySelector("#project-form-status").textContent =
          "Project saved and published in the gallery.";
      } catch (err) {
        status.className = "error";
        status.textContent = err.message || "Unable to save project.";
      } finally {
        button.disabled = false;
        button.innerHTML = form.dataset.editId
          ? "Save Changes " + arrow
          : "Publish Project " + arrow;
      }
    };
    const resetForm = () => {
      form.reset();
      delete form.dataset.editId;
      form.elements.namedItem("before").required = true;
      form.elements.namedItem("after").required = true;
      document.querySelector("#project-form-title").textContent =
        "Add a before & after";
      document.querySelector("#current-pair").innerHTML = "";
      document.querySelector("#cancel-project-edit").hidden = true;
      form.querySelector("[type=submit]").innerHTML =
        "Publish Project " + arrow;
      status.textContent = "";
    };
    document.querySelector("#cancel-project-edit").onclick = resetForm;
    document.querySelectorAll("[data-edit-project]").forEach(
      (button) =>
        (button.onclick = () => {
          const p = adminProjects.find(
            (item) => item.id === button.dataset.editProject,
          );
          if (!p) return;
          form.dataset.editId = p.id;
          form.elements.namedItem("title").value = p.title;
          form.elements.namedItem("category").value = p.category;
          form.elements.namedItem("description").value = p.description;
          form.elements.namedItem("before").required = false;
          form.elements.namedItem("after").required = false;
          form.elements.namedItem("before").value = "";
          form.elements.namedItem("after").value = "";
          document.querySelector("#project-form-title").textContent =
            "Edit project";
          document.querySelector("#current-pair").innerHTML =
            `<div class="current-pair"><div><img src="${esc(p.before_image)}" alt="Current before photo"><span>Current before</span></div><div><img src="${esc(p.after_image)}" alt="Current after photo"><span>Current after</span></div></div>`;
          document.querySelector("#cancel-project-edit").hidden = false;
          form.querySelector("[type=submit]").innerHTML =
            "Save Changes " + arrow;
          status.textContent =
            "Leave a photo field empty to keep its current image.";
          form.scrollIntoView({ behavior: "smooth", block: "start" });
          form.elements.namedItem("title").focus();
        }),
    );
    document.querySelectorAll("[data-delete-project]").forEach(
      (button) =>
        (button.onclick = async () => {
          const p = adminProjects.find(
            (item) => item.id === button.dataset.deleteProject,
          );
          if (p && confirm(`Delete “${p.title}” and its gallery photos?`)) {
            try {
              await api(`/api/admin/projects/${p.id}`, "DELETE");
              await loadAdminProjects();
            } catch (err) {
              alert(err.message);
            }
          }
        }),
    );
    document.querySelector("#logout").onclick = async () => {
      await api("/api/admin/logout", "POST");
      adminLogin();
    };
  } catch (err) {
    if (err.message === "Admin sign-in required.") adminLogin();
    else
      document.querySelector("#admin-content").innerHTML =
        `<div class="admin-login"><h2>Gallery unavailable</h2><p>${esc(err.message)}</p></div>`;
  }
}
async function bindAdmin() {
  document.querySelector("#admin-leads").onclick = () => {
    location.hash = "leads";
    setAdminTab("leads");
    loadAdmin();
  };
  document.querySelector("#admin-projects").onclick = () => {
    location.hash = "projects";
    loadAdminProjects();
  };
  try {
    const c = await api("/api/config");
    window.adminConfigured = c.adminConfigured;
    if (c.adminAuthenticated)
      await (location.hash === "#projects" ? loadAdminProjects() : loadAdmin());
    else adminLogin();
  } catch {
    document.querySelector("#admin-content").innerHTML =
      '<div class="admin-login"><h2>Dashboard unavailable</h2><p>Start the ACT Concrete server to access leads and projects.</p></div>';
  }
}
function render() {
  const path = location.pathname;
  const pages = {
    "/": home,
    "/services": servicesPage,
    "/services/walkways": () => servicePage("walkways"),
    "/services/slabs": () => servicePage("slabs"),
    "/projects": projectsPage,
    "/about": aboutPage,
    "/reviews": reviewsPage,
    "/contact": contactPage,
    "/admin": adminPage,
  };
  const title = {
    "/": "Quality Concrete Work. Built to Last.",
    "/services": "Concrete Services",
    "/services/walkways": "Concrete Walkways",
    "/services/slabs": "Concrete Slabs",
    "/projects": "Real Project Gallery",
    "/about": "About ACT Concrete",
    "/reviews": "Customer Reviews",
    "/contact": "Get a Free Estimate",
    "/admin": "Admin Dashboard",
  };
  document.title = `${title[path] || "Page Not Found"} | ACT Concrete`;
  document.querySelector('link[rel="canonical"]').href = location.origin + path;
  document.querySelector('meta[name="description"]').content =
    path === "/contact"
      ? "Request a free concrete estimate from ACT Concrete. Share your project details online or call 304-514-4277."
      : path === "/projects"
        ? "Explore authentic ACT Concrete walkway and slab project photographs."
        : "ACT Concrete provides concrete walkway and slab work. Explore real projects and request a free estimate.";
  document.querySelector("#app").innerHTML =
    path === "/admin"
      ? adminPage()
      : `${header()}<main>${pages[path] ? pages[path]() : `${intro("404", "PAGE NOT FOUND.", "The page you requested does not exist.")}${cta()}`}</main>${footer()}`;
  document.querySelector(".menu-toggle")?.addEventListener("click", (e) => {
    const nav = document.querySelector("#nav");
    nav.classList.toggle("open");
    e.currentTarget.setAttribute(
      "aria-expanded",
      nav.classList.contains("open"),
    );
  });
  if (path === "/contact") bindContact();
  if (path === "/admin") bindAdmin();
}
function installThemeControls() {
  const makeToggle = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.addEventListener("click", () => {
      const next =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      document.cookie = `act_theme=${next}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      syncThemeControls();
    });
    return button;
  };
  const navActions = document.querySelector(".nav-actions");
  if (navActions)
    navActions.insertBefore(makeToggle(), navActions.querySelector(".nav-cta"));
  const adminTop = document.querySelector(".admin-top");
  if (adminTop)
    adminTop.insertBefore(makeToggle(), adminTop.querySelector("#export"));
  syncThemeControls();
}
function syncThemeControls() {
  const dark = document.documentElement.dataset.theme === "dark";
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
    button.setAttribute("aria-pressed", String(dark));
    button.title = dark ? "Switch to light mode" : "Switch to dark mode";
    button.innerHTML = `<span class="theme-icon" aria-hidden="true">${dark ? "☀" : "☾"}</span><span class="theme-label">${dark ? "Light" : "Dark"}</span>`;
  });
}
async function loadPublicProjects() {
  try {
    const d = await api("/api/projects");
    projects = d.projects.map((p) => ({
      id: p.id,
      title: p.title,
      type: p.category,
      caption: p.description,
      image: p.after_image,
      prep: p.before_image,
    }));
  } catch (err) {
    console.warn("Gallery could not be refreshed:", err);
  }
}
await loadPublicProjects();
render();
installThemeControls();
bindGallery();

async function viewLead(id) {
  try {
    const {
      lead,
      notes,
      messages = [],
      quoteEmailConfigured,
    } = await api(`/api/admin/leads/${id}`);
    const money = (cents) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(cents / 100);
    const history = messages.length
      ? messages
          .map((item) => {
            const state =
              item.status === "sent"
                ? "Sent"
                : item.status === "failed"
                  ? "Delivery failed"
                  : "Queued for delivery";
            return `<article class="outbound-message"><div class="outbound-message-head"><strong>${item.amount_cents != null ? `Quote ${money(item.amount_cents)}` : "Message"}</strong><span class="delivery-status status-${esc(item.status)}">${state}</span></div><small>${new Date(item.created_at).toLocaleString()} · ${esc(item.recipient)}</small><p>${esc(item.body)}</p>${item.status === "failed" && item.last_error ? `<small class="error">${esc(item.last_error)}</small>` : ""}</article>`;
          })
          .join("")
      : '<p class="customer-message-empty">No messages sent yet.</p>';
    const sendSection = lead.email
      ? `<section class="customer-message-section"><h3>Email customer</h3><p class="customer-message-hint">To ${esc(lead.email)}. Add a dollar amount to send a quote, or leave it blank to send a message.</p>${quoteEmailConfigured ? `<form id="customer-message-form"><label class="field"><span>Quote amount (optional)</span><input name="amount" type="text" inputmode="decimal" pattern="[0-9]+(\\.[0-9]{1,2})?" placeholder="e.g. 1250.00" autocomplete="off"></label><label class="field"><span>Message *</span><textarea name="message" rows="5" maxlength="4000" required placeholder="Explain the scope, price, and next steps in your own words."></textarea></label><button class="btn btn-green" type="submit">Send Email ${arrow}</button><p class="customer-message-status" role="status" aria-live="polite"></p></form>` : '<p class="customer-message-unavailable">Email sending needs a Resend API key and verified sender address configured on the server.</p>'}<div class="outbound-history-heading"><h4>Email history</h4><button type="button" class="refresh-messages">Refresh status</button></div><div class="outbound-history">${history}</div></section>`
      : `<section class="customer-message-section"><h3>Email customer</h3><p class="customer-message-unavailable">This customer did not provide an email address.</p></section>`;
    const photoUrl = `/api/admin/leads/${id}/photo`;
    const photoMarkup = `<section class="lead-photo-section"><h3>Project photo</h3>${lead.has_photo ? `<a class="lead-photo-preview" href="${photoUrl}" target="_blank" rel="noopener" aria-label="Open uploaded project photo full size"><img src="${photoUrl}" alt="Project photo submitted by ${esc(lead.name)}" loading="lazy"><span>Open full-size photo ${arrow}</span></a>` : "<p>No photo was attached to this inquiry.</p>"}</section>`;
    const dialog = document.createElement("dialog");
    dialog.className = "lead-dialog";
    dialog.innerHTML = `<button class="dialog-close" aria-label="Close details">×</button><span class="eyebrow">PROJECT INQUIRY</span><h2>${esc(lead.name)}</h2><p class="lead-date">Submitted ${new Date(lead.created_at).toLocaleString()}</p><div class="lead-details">${[
      ["Phone", lead.phone],
      ["Email", lead.email],
      ["Service", lead.service],
      ["Address", lead.address],
      ["City", lead.city],
      ["Size", lead.size],
      ["Timeline", lead.timeline],
      ["Budget", lead.budget],
      ["Details", lead.details],
    ]
      .map(([k, v]) => `<div><b>${k}</b><span>${esc(v || "—")}</span></div>`)
      .join(
        "",
      )}</div>${photoMarkup}${sendSection}<h3>Internal notes</h3><div class="notes">${notes.length ? notes.map((n) => `<p><small>${new Date(n.created_at).toLocaleString()}</small><br>${esc(n.body)}</p>`).join("") : "<p>No notes yet.</p>"}</div><form id="note-form"><textarea name="body" placeholder="Add a private note…" required></textarea><button class="btn btn-green">Save Note</button></form><button class="delete-lead">Delete lead</button>`;
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector(".dialog-close").onclick = () => dialog.close();
    dialog.addEventListener("close", () => dialog.remove());
    const refresh = () => {
      dialog.close();
      viewLead(id);
    };
    dialog
      .querySelector(".refresh-messages")
      ?.addEventListener("click", refresh);
    dialog
      .querySelector("#customer-message-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.currentTarget,
          amount = form.elements.namedItem("amount").value.trim(),
          message = form.elements.namedItem("message").value.trim(),
          button = form.querySelector("button[type=submit]"),
          status = form.querySelector("[role=status]");
        if (!message) {
          status.className = "customer-message-status error";
          status.textContent = "Write a message first.";
          return;
        }
        if (
          !confirm(
            `Send ${amount ? `a $${amount} quote` : "a message"} to ${lead.email}?`,
          )
        )
          return;
        button.disabled = true;
        button.textContent = "Queuing email…";
        status.textContent = "";
        try {
          await api(`/api/admin/leads/${id}/messages`, "POST", {
            amount,
            message,
          });
          refresh();
        } catch (err) {
          status.className = "customer-message-status error";
          status.textContent = err.message;
          button.disabled = false;
          button.innerHTML = "Send Email " + arrow;
        }
      });
    dialog.querySelector("#note-form").onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api(`/api/admin/leads/${id}/notes`, "POST", {
          body: e.target.body.value,
        });
        refresh();
      } catch (err) {
        alert(err.message);
      }
    };
    dialog.querySelector(".delete-lead").onclick = async () => {
      if (
        confirm(`Delete the lead from ${lead.name}? This cannot be undone.`)
      ) {
        await api(`/api/admin/leads/${id}`, "DELETE");
        dialog.close();
        loadAdmin();
      }
    };
  } catch (err) {
    alert(err.message);
  }
}
