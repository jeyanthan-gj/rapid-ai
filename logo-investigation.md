# Logo deployment investigation

- `AppShell.tsx` and `client/index.html` reference `/manus-storage/rapid_ai_logo_dbf27309.png`.
- `vite.config.ts` defines `/manus-storage` only as a development-server proxy to the Manus storage presign endpoint; that route is not emitted as a static Netlify asset.
- The managed preview returns a temporary 307 CloudFront redirect for the logo path, which explains why the image can appear in the Manus preview but fail on Netlify.
- The local copies `rapid_ai_logo.png`, `rapid_ai_logo_original.png`, and the downloaded `rapid_ai_logo_dbf27309.png` are large 1920x1920 PNGs with a bright green background rather than a clean transparent mark. Do not use these raw files for the deployed sidebar logo without creating a suitable compact asset.
- The repository `ideas.md` refers to a separate generated icon path `rapid_ai_logo_2be631b2.png`, but no corresponding local file is present.

Planned remediation: use a small deployment-safe logo asset uploaded with the web project asset workflow, reference its returned stable URL in AppShell and index.html, remove reliance on `/manus-storage` for Netlify, then build and verify.
