import { createBrowserRouter } from "react-router";
import Noeme from "@/components/Noeme";
import Screenshot from "@/pages/screenshot";
import Index from "@/pages";
import Details from "@/pages/details";
import Spelling from "@/pages/spelling";

export default createBrowserRouter([
  {
    Component: Noeme,
    children: [
      {
        index: true,
        path: "/",
        Component: Index,
      },
      {
        path: "/details/:word",
        Component: Details,
      },
    ],
  },
  {
    path: "/screenshot",
    Component: Screenshot,
  },
  {
    path: "/spelling",
    Component: Spelling,
  },
]);
