import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
 