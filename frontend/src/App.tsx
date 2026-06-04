import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import Simulation from "./pages/Simulation";
import Explainability from "./pages/Explainability";
import Comparison from "./pages/Comparison";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/forecast" element={<Forecast />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/explain" element={<Explainability />} />
                <Route path="/comparison" element={<Comparison />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
