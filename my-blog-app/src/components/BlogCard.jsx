import React from 'react';
import { Link } from 'react-router-dom';
import './BlogCard.css';

function BlogCard({ blog, onDelete }) {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      onDelete(blog._id);
    }
  };

  const hasFiles = blog.imageUrls && blog.imageUrls.length > 0;
  const displayFileUrl = hasFiles ? `http://localhost:3000${blog.imageUrls[0]}` : null;

  // Check if the first file is a common image type to display directly as an <img>
  const isImageFile = displayFileUrl && /\.(jpe?g|png|gif|webp)$/i.test(displayFileUrl);

  return (
    <div className="blog-card">
      {hasFiles && isImageFile ? (
        <img
          src={displayFileUrl}
          alt={blog.title}
          className="blog-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/no-image-placeholder.png"; // Fallback for broken image URL
          }}
        />
      ) : (
        <div className="blog-card-no-image"> {/* New div for better control */}
          <img
            src="/no-image-placeholder.png" // Generic placeholder for no files or non-image files
            alt="No image available"
            className="blog-card-image-placeholder" // Different class for styling
          />
          <p className="no-image-text">No media available</p> {/* Optional text */}
        </div>
      )}
      <div className="blog-card-content">
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-description">
          {blog.description.substring(0, 100)}...
        </p>
        <p className="blog-card-meta">
          Created: {new Date(blog.createdAt).toLocaleDateString()}
        </p>
        <p className="blog-card-meta">
          Updated: {new Date(blog.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="blog-card-actions">
        <Link to={`/view-blog/${blog._id}`} className="view-button">View</Link>
        <Link to={`/edit-blog/${blog._id}`} className="edit-button">Edit</Link>
        <button onClick={handleDeleteClick} className="delete-button">Delete</button>
      </div>
    </div>
  );
}

export default BlogCard;