# Self-Hosting Jitsi on Google Cloud Run

For organizations that require 100% privacy and data control, hosting your own Jitsi instance on Google Cloud is the recommended solution.

## Step 1: Prepare the Container
Use the official Docker images from the Jitsi team. You will need to build and push them to Google Artifact Registry.

## Step 2: Configure Environment
Set up the following critical environment variables in Cloud Run:
- `PUBLIC_URL`: Your custom domain (e.g., `meet.brasilstartups.org`)
- `ENABLE_XMPP_WEBSOCKET`: Set to `1` (required for serverless environments)
- `ETHERPAD_URL_BASE`: If you need collaborative docs

## Step 3: Deploy to Cloud Run
Deploy the `web`, `prosody`, `jicofo`, and `jvb` components. 
> Note: JVB (Jitsi Videobridge) works best on GKE or Compute Engine due to UDP requirements, but Cloud Run can handle small teams (up to 10-15 people) using TCP as fallback.

## Step 4: Network & Security
- Enable **HTTP/2** on Cloud Run for better performance.
- Use **Cloud Load Balancing** to handle SSL and provide a static IP if needed.

## Step 5: Update the App
In `src/components/ProximityChat.ts`, update the `domain` constant:
```typescript
const domain = 'meet.seu-dominio.com.br';
```

---
*Powered by Brasil Startups Hub Open Source Project*
