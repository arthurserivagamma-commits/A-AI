import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Chat } from "./components/Chat";
import { SnippetPage } from "./components/SnippetPage";

export default function App() {
  return (
    <Router>
      <div className="h-screen w-full overflow-hidden">
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/p/:id" element={<SnippetPage />} />
        </Routes>
      </div>
    </Router>
  );
}
