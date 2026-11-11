# Motion Studio — AI Video Generator

A responsive starter interface for a text-to-video creative workspace.

## Current status

- Responsive English-first UI in `index.html`
- Prompt, visual style, aspect ratio, duration, and quality controls
- Prompt brief preview/validation
- **Not yet connected to a video-generation API** — the current button prepares a brief only

## Run locally

Open `index.html` in a browser.

## Publish free with GitHub Pages

1. Open the repository **Settings**.
2. Open **Pages** under **Code and automation**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`, then Save.
5. Wait for GitHub Pages to publish the site; the Pages screen will show the live URL.

## Video generation and the zero-budget constraint

A public website cannot safely call a paid video API directly from browser code: provider credentials would be exposed. A production integration needs a server-side endpoint (for example, a Cloudflare Worker) and a provider API key stored as a server secret.

Do not commit API keys to this repository.

As checked on 11 November 2026, Google's Veo 3.1 API pricing lists no free tier; Hugging Face's current pricing documentation lists no monthly Inference Provider credits for free accounts. Therefore, a genuinely unlimited, reliable, hosted text-to-video API cannot be promised at $0. We can keep the website and deployment free, test any available provider trial within its limits, and only enable paid rendering after you explicitly approve a budget.

References:
- https://ai.google.dev/gemini-api/docs/pricing
- https://huggingface.co/docs/inference-providers/pricing

## Next development step

Add a server-side provider adapter with strict usage limits, then connect a video provider only after the provider and spending limit are agreed.
