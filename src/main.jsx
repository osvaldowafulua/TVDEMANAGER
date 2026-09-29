import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { IconContext } from "@phosphor-icons/react";
import "@fontsource-variable/geist-mono/wght.css";
import "./style.css";
import "./mono.css";
import "./user.css";
import { AppRoutes } from "./routes/AppRoutes.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IconContext.Provider value={{ weight: "light", color: "currentColor" }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </IconContext.Provider>
  </React.StrictMode>
);
