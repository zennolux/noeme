import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import Screenshot from "./pages/screenshot";
import { TooltipProvider } from "./components/ui/tooltip";

const router = createBrowserRouter([
  {
    index: true,
    Component: App,
  },
  {
    path: "/screenshot",
    Component: Screenshot,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  </React.StrictMode>
);
