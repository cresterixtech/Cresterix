// React Router 7 consolidated the packages: StaticRouter comes from
// `react-router` itself, and `react-router-dom/server` no longer exists.
import { StaticRouter } from "react-router";
import { prerenderToNodeStream } from "react-dom/static";
import App from "./App.jsx";

/* ------------------------------------------------------------------
   Server entry, used only by scripts/prerender.mjs at build time.

   `prerenderToNodeStream` rather than `renderToString`: every inner
   page is React.lazy, and renderToString would emit the Suspense
   fallback — a loading bar — instead of the page. The prerender APIs
   wait for those boundaries to settle before producing HTML, which is
   the whole point of the exercise.

   The 3D canvas is gated behind a useEffect flag, so it resolves to
   its static fallback here and three.js is never imported.
   ------------------------------------------------------------------ */

export async function render(url) {
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  const chunks = [];
  for await (const chunk of prelude) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

