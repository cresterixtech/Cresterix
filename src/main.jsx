import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

/* Base layer first, on purpose. Component stylesheets are injected in
   module-execution order, so importing App before this would put the
   shared .btn/.card rules *after* component rules of equal specificity
   and let them win. */
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
