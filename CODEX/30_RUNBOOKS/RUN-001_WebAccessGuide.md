---
id: RUN-001
title: "Web Access Guide"
type: runbook
status: APPROVED
owner: "Architect"
agents: [all]
tags: [runbook, hosting, access, deployment, production]
related: [BLU-001, SPR-004]
created: "2026-03-04"
updated: "2026-03-04"
version: "1.0.0"
---

> **BLUF:** This guide details how to access the live PropManage Pro web application over the internet following a successful Firebase deployment. It provides the standard URL patterns, domain console management references, and verification steps.

## 1. Accessing the Live Application

By default, Firebase Hosting auto-provisions two secure web domains tied to your Google Cloud project ID. You can access the live PropManage Pro application immediately using any web browser on desktop or mobile.

* **Primary Address:** [https://mylab-481117.web.app](https://mylab-481117.web.app)
* **Fallback Address:** [https://mylab-481117.firebaseapp.com](https://mylab-481117.firebaseapp.com)

Simply click either of the links above to view the application in production.

---

## 2. Setting Up a Custom Domain (Optional)

If you wish to map a custom domain (e.g., `www.propmanagepro.com`) to this application, you can do so directly within the Firebase Console without touching the codebase.

### Steps to Attach Custom Domain:
1. Navigate to the **Firebase Console Hosting Panel**:
   [https://console.firebase.google.com/project/mylab-481117/hosting/sites](https://console.firebase.google.com/project/mylab-481117/hosting/sites)
2. Click **"Add custom domain"**.
3. Enter your purchased domain name (e.g., `app.yourdomain.com`).
4. Follow the on-screen prompts to copy the provided `TXT` and `A` records into your DNS provider (e.g., Cloudflare, Namecheap, Google Domains).
5. Wait up to 24 hours for DNS propagation and for Google to auto-provision your free SSL/TLS certificates.

---

## 3. Post-Deployment Verification

If you ever need to verify that a fresh deployment pushed cleanly to the web, follow these steps:

1. **Hard Refresh:** 
   Open [https://mylab-481117.web.app](https://mylab-481117.web.app) and press `Ctrl/Cmd + Shift + R` to force the browser to bypass local cache and retrieve the latest Cloud CDN assets.
2. **Access the Application Log:**
   Open the browser's Developer Tools (`F12`), switch to the "Network" tab, and ensure that scripts and CSS bundles return HTTP 200 (or HTTP 304 if cached), with no `404 Not Found` failing chunks.
3. **Database Rules Verification:**
   Attempt a login or navigation step in the live app that reads from Firestore. If the data renders properly (or returns a polite unauthorized rejection), the backend `firestore.rules` and `functions` layer are communicating safely.

---

## 4. Troubleshooting Access Issues

| Problem | Cause | Resolution |
| :--- | :--- | :--- |
| **"Site Not Found" Page** | Firebase CDN cache hasn't propagated or `public` directory was empty during build. | Wait 3 minutes and refresh, or trigger a re-deploy via the agent. |
| **Blank White Screen** | React/Next.js encountered a client-side crash upon loading. | Open `F12` Developer Console to read the stack trace and file a defect report. |
| **Custom Domain Insecure** | Google's automated SSL `Let's Encrypt` provision is still pending. | Ignore and wait; Google provisions certificates usually within 60 minutes after DNS updates. |
