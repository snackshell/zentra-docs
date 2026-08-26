# zentra-docs

The public site for **Zentra Digital Shop** — the landing page at
`zentradigital.shop`, and the Reseller API reference at
`zentradigital.shop/api/docs`.

Next.js, deployed on Vercel. No database, no secrets, no API calls at
runtime: everything is static.

## The OpenAPI document

`src/lib/openapi.json` is a **copy** of `docs/zentra-openapi.json` in the
[ZentraShopBot](https://github.com/snackshell/ZentraShopBot) repository, which
is the source of truth. That repository has a test comparing the document
against the API's live router on every run, so the spec cannot drift from the
thing it describes.

The reference page is generated from it — endpoints, parameters, schemas and
response examples are all read out of the document rather than written by
hand. Adding an endpoint to the API and copying the file across is all it
takes to document it.

**To update:**

```bash
cp ../ZentraShopBot/docs/zentra-openapi.json src/lib/openapi.json
npm run build   # fails loudly if the shape changed in a way the page cannot render
```

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

## Design

The violet-to-magenta identity, IBM Plex Sans/Mono and Instrument Serif are
the same ones the Telegram Mini App carries — copied deliberately rather than
reinvented, so a developer who has seen the shop recognises the docs as the
same company. Dark first, because API documentation is read beside a
terminal; light is fully supported.

## Deploying

Vercel, from `main`. No environment variables are required.

Point `zentradigital.shop` at the Vercel project. The API itself lives
elsewhere — `api.zentradigital.shop`, served by Nginx on the VPS in front of
the bot process.
