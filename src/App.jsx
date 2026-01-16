import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ReportGenerator from './ReportGenerator';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/generator" element={<ReportGenerator />} />
            </Routes>
        </Router>
    );
}
