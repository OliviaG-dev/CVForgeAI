import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import CVForm from './pages/cv-form/CVForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CVForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
