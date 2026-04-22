import { BrowserRouter, Route, Routes } from "react-router-dom";
import TestCoverageSection from "./DiagramLab";
import FunTestPage from "./FunTestPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestCoverageSection />} />
        <Route path="/funtest" element={<FunTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}
