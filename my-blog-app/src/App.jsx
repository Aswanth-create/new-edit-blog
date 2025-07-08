import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import the new Home Page
import NewBlogPage from './pages/NewBlogPage';
import EditBlogPage from './pages/EditBlogPage';
import ViewBlogPage from './pages/ViewBlogPage'; // Add this line
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* The root path now points to HomePage */}
        <Route path="/" element={<HomePage />} />
        {/* New blog page will be at /new-blog */}
        <Route path="/new-blog" element={<NewBlogPage />} />
        {/* Edit blog page remains at /edit-blog */}
        <Route path="/edit-blog/:id" element={<EditBlogPage />} />
        <Route path="/view-blog/:id" element={<ViewBlogPage />} />
      </Routes>
    </Router>
  );
}

export default App;