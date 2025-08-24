import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/chatbot" element={<Chatbot />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
