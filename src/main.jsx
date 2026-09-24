import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "@phosphor-icons/react";
import "@fontsource-variable/geist-mono/wght.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IconContext.Provider value={{ weight: "light", color: "currentColor" }}>
      <App />
    </IconContext.Provider>
  </React.StrictMode>
);
