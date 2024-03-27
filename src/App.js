import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import React, {useState, useEffect} from 'react'
import LandingPage from "./LandingPage";
import HomePage from "./HomePage";
import ResultsPage from "./ResultsPage";
function App() {
  return (
        <div>
            <title>Discrete Math Web Solver</title>
                <Routes>
                    <Route path="/" element={<LandingPage/>} />
                    <Route path="/Home" element={<HomePage/>} />
                    <Route path="/Results" element={<ResultsPage/>} />
                </Routes>
        </div>
  );
}

export default App;
