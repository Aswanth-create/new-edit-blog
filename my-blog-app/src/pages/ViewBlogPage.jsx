import React, { useState, useEffect } from 'react';
import './ViewBlogPage.css';
import { useParams } from 'react-router-dom';

function ViewBlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/blogs/${id}`);

        if (response.ok) {
          const data = await response.json();
          setBlog(data);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch blog: ${errorData.message || response.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('An error occurred while connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="view-blog-container">
        <div className="blog-header-banner"><h1 className="blog-title">VIEW BLOG</h1></div>
        <div className="blog-content-area"><p>Loading blog post...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-blog-container">
        <div className="blog-header-banner"><h1 className="blog-title">VIEW BLOG</h1></div>
        <div className="blog-content-area"><p className="error-message">{error}</p></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="view-blog-container">
        <div className="blog-header-banner"><h1 className="blog-title">VIEW BLOG</h1></div>
        <div className="blog-content-area"><p className="not-found-message">Blog post not found.</p></div>
      </div>
    );
  }

  return (
    <div className="view-blog-container">
      <div className="blog-header-banner">
        <h1 className="blog-title">{blog.title}</h1>
      </div>
      <div className="blog-content-area">
        {/* Display all files if imageUrls array exists and has content */}
        {blog.imageUrls && blog.imageUrls.length > 0 && (
          <div className="blog-files-gallery"> {/* Changed to gallery for multiple files */}
            {blog.imageUrls.map((fileUrl, index) => {
              const fileName = fileUrl.split('/').pop(); // Extract filename
              const fileExtension = fileName.split('.').pop().toLowerCase();
              const fullFileUrl = `http://localhost:3000${fileUrl}`;

              // Basic handling for different file types:
              let mediaElement = null;
              if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
                mediaElement = (
                  <img
                    src={fullFileUrl}
                    alt={`${blog.title} file ${index + 1}`}
                    className="full-blog-media"
                    onError={(e) => { e.target.onerror = null; e.target.src="/placeholder-image.png"}}
                  />
                );
              } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                mediaElement = (
                  <video controls className="full-blog-media">
                    <source src={fullFileUrl} type={`video/${fileExtension}`} />
                    Your browser does not support the video tag.
                  </video>
                );
              } else if (['mp3', 'wav', 'aac'].includes(fileExtension)) {
                mediaElement = (
                  <audio controls className="full-blog-media">
                    <source src={fullFileUrl} type={`audio/${fileExtension}`} />
                    Your browser does not support the audio element.
                  </audio>
                );
              } else if (['pdf'].includes(fileExtension)) {
                mediaElement = (
                  <iframe src={fullFileUrl} title={`${blog.title} document ${index + 1}`} className="full-blog-media pdf-viewer">
                    This browser does not support PDFs. Please <a href={fullFileUrl} target="_blank" rel="noopener noreferrer">download the PDF</a>.
                  </iframe>
                );
              } else {
                // Default for other file types (documents, etc.) - display as a link
                mediaElement = (
                  <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" className="document-link">
                    <img src="/file-icon.png" alt="document" className="file-icon" /> {/* Add a generic file icon */}
                    <span>Download {fileName}</span>
                  </a>
                );
              }

              return (
                <div key={index} className="blog-media-wrapper">
                  {mediaElement}
                  <p className="file-name-display">{fileName}</p> {/* Display filename below */}
                </div>
              );
            })}
          </div>
        )}
        {!blog.imageUrls || blog.imageUrls.length === 0 && (
          <p className="no-files-message">No files uploaded for this blog post.</p>
        )}
        <p className="blog-description" style={{ whiteSpace: 'pre-wrap' }}>{blog.description}</p>
        <p className="blog-meta">
          Created: {new Date(blog.createdAt).toLocaleDateString()} at {new Date(blog.createdAt).toLocaleTimeString()}
        </p>
        <p className="blog-meta">
          Last Updated: {new Date(blog.updatedAt).toLocaleDateString()} at {new Date(blog.updatedAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default ViewBlogPage;