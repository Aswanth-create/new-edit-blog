import React, { useState, useEffect, useCallback } from 'react'; // Import hooks
import './HomePage.css';
import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard'; // Import our new BlogCard component

function HomePage() {
  const [blogPosts, setBlogPosts] = useState([]); // State to store fetched blog posts
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages

  // Function to fetch blog posts from the backend
  // useCallback is used to memoize the function, useful for useEffect dependencies
  const fetchBlogPosts = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    setError(null); // Clear any previous errors
    try {
      const response = await fetch('http://localhost:3000/api/blogs'); // GET request to your backend
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data); // Update state with fetched data
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch blogs: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('An error occurred while connecting to the server. Please check the backend.');
    } finally {
      setLoading(false); // Set loading to false after fetching (success or failure)
    }
  }, []); // Empty dependency array means this function is created once

  // useEffect hook to run fetchBlogPosts when the component mounts
  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]); // Re-run if fetchBlogPosts changes (due to useCallback, it won't often)

  // Function to handle deleting a blog post
  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/blogs/${id}`, {
          method: 'DELETE', // DELETE request
        });

        if (response.ok) {
          alert('Blog post deleted successfully!');
          fetchBlogPosts(); // Re-fetch blogs to update the list
        } else {
          const errorData = await response.json();
          alert(`Failed to delete blog: ${errorData.message || response.statusText}`);
        }
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert('An error occurred while deleting the blog.');
      }
    }
  };

  return (
    <div className="home-container">
      <div className="blog-header-banner">
        <h1 className="blog-title">THE BLOG</h1>
        <Link to="/new-blog" className="new-blog-button">New Blog</Link>
      </div>
      <div className="blog-posts-list">
        {loading && <p>Loading blog posts...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && blogPosts.length === 0 && (
          <p>No blog posts found. Create one!</p>
        )}
        {/* Map through the blogPosts array and render a BlogCard for each */}
        {blogPosts.map((blog) => (
          <BlogCard key={blog._id} blog={blog} onDelete={handleDeleteBlog} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;