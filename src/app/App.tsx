import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "../lib/theme";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
