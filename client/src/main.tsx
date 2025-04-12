import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Update document title
document.title = "Portfolio Management System";

createRoot(document.getElementById("root")!).render(<App />);
