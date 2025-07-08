import React, { useState, useEffect } from 'react';
import './EditBlogPage.css';
import { useParams, useNavigate } from 'react-router-dom';

function EditBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newFiles, setNewFiles] = useState([]); // State for newly selected files (File objects)
  const [existingImageUrls, setExistingImageUrls] = useState([]); // State for image URLs from the DB (strings)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep track of which existing images are marked for deletion
  const [imageUrlsMarkedForDeletion, setImageUrlsMarkedForDeletion] = useState([]);

  // Fetch blog data when component mounts or ID changes
  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/blogs/${id}`);

        if (response.ok) {
          const blogData = await response.json();
          setTitle(blogData.title);
          setDescription(blogData.description);
          setExistingImageUrls(blogData.imageUrls || []); // Set existingImageUrls from fetched data
          setImageUrlsMarkedForDeletion([]); // Reset deletions on fresh fetch
          setNewFiles([]); // Clear any new files from previous session
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch blog for editing: ${errorData.message || response.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching blog for edit:', err);
        setError('An error occurred while connecting to the server to fetch blog details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogData();
    }
  }, [id]);

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  // Add newly selected files to the newFiles array
  const handleNewFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    // Filter out duplicates based on file name to prevent adding the exact same file twice
    const uniqueNewFiles = filesArray.filter(
      (newFile) => !newFiles.some((existingFile) => existingFile.name === newFile.name)
    );
    setNewFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
    e.target.value = null; // Clear the input so same file can be selected again if needed
  };

  // Remove a newly selected file from the newFiles array (before upload)
  const handleRemoveNewFile = (fileName) => {
    setNewFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  // Mark/unmark an existing image URL for deletion
  const handleToggleDeleteExistingImage = (imageUrl) => {
    setImageUrlsMarkedForDeletion((prevMarked) =>
      prevMarked.includes(imageUrl)
        ? prevMarked.filter((url) => url !== imageUrl) // Unmark: remove from deletion list
        : [...prevMarked, imageUrl] // Mark: add to deletion list
    );
  };

  const handleUpdate = async () => {
    if (!title || !description) {
      alert('Please enter both title and description.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    // Append new files to the FormData (these will be uploaded)
    newFiles.forEach((file) => {
      formData.append('files', file); // 'files' must match the backend's multer field name
    });

    // Determine which existing images to keep (not marked for deletion)
    const imageUrlsToKeep = existingImageUrls.filter(
      (url) => !imageUrlsMarkedForDeletion.includes(url)
    );

    // Append these arrays as JSON strings to FormData, so backend can parse them
    formData.append('imageUrlsToKeep', JSON.stringify(imageUrlsToKeep));
    formData.append('imageUrlsToDelete', JSON.stringify(imageUrlsMarkedForDeletion));

    try {
      const response = await fetch(`http://localhost:3000/api/blogs/${id}`, {
        method: 'PUT',
        body: formData, // FormData automatically sets the correct 'Content-Type' header
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        console.log('Blog updated successfully:', updatedBlog);
        alert('Blog updated successfully!');
        navigate('/'); // Navigate back to the home page after successful update
      } else {
        const errorData = await response.json();
        alert(`Failed to update blog: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('An error occurred while updating the blog. Please ensure the backend is running and accessible.');
    }
  };

  if (loading) {
    return (
      <div className="edit-blog-container">
        <div className="blog-header-banner"><h1 className="blog-title">EDIT BLOG</h1></div>
        <div className="blog-content-area"><p>Loading blog details...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-blog-container">
        <div className="blog-header-banner"><h1 className="blog-title">EDIT BLOG</h1></div>
        <div className="blog-content-area"><p className="error-message">{error}</p></div>
      </div>
    );
  }

  return (
    <div className="edit-blog-container">
      <div className="blog-header-banner">
        <h1 className="blog-title">EDIT BLOG</h1>
      </div>
      <div className="blog-content-area">
        <div className="input-group">
          <input
            type="text"
            placeholder="Title of Blog"
            className="input-field"
            value={title}
            onChange={handleTitleChange}
          />
        </div>

        {/* Display Existing Files */}
        {existingImageUrls.length > 0 && (
          <div className="input-group existing-files-preview">
            <p>Current Files:</p>
            <div className="file-list">
              {existingImageUrls.map((imageUrl, index) => {
                const fileName = imageUrl.split('/').pop(); // Extracts filename from URL
                const isMarked = imageUrlsMarkedForDeletion.includes(imageUrl);
                return (
                  <div
                    key={index} // Using index as key is okay if list order is stable and items are not reordered
                    className={`file-item ${isMarked ? 'marked-for-deletion' : ''}`}
                  >
                    <a href={`http://localhost:3000${imageUrl}`} target="_blank" rel="noopener noreferrer">
                      {fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleToggleDeleteExistingImage(imageUrl)}
                      className="remove-file-button"
                    >
                      {isMarked ? 'Undo X' : 'X'}
                    </button>
                  </div>
                );
              })}
            </div>
            {imageUrlsMarkedForDeletion.length > 0 && (
                <p className="deletion-info">Files marked with 'X' will be deleted upon update.</p>
            )}
          </div>
        )}

        {/* Upload New Files */}
        <div className="input-group">
          <label className="upload-button">
            Upload new files (Pictures, Docs, etc.)
            <input
              type="file"
              multiple // Allow selecting multiple files
              style={{ display: 'none' }} // Hide the default file input
              onChange={handleNewFileChange}
            />
          </label>
          {newFiles.length > 0 && (
            <div className="selected-files-preview">
              <p>New Files to Upload:</p>
              <ul>
                {newFiles.map((file, index) => (
                  <li key={index}> {/* Using index as key is okay for temporary file selection */}
                    {file.name}
                    <button type="button" onClick={() => handleRemoveNewFile(file.name)} className="remove-file-button">
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="input-group">
          <textarea
            placeholder="Enter Description of blog"
            className="textarea-field"
            value={description}
            onChange={handleDescriptionChange}
          ></textarea>
        </div>
        <button className="update-button-bottom" onClick={handleUpdate}>
          Update
        </button>
      </div>
    </div>
  );
}

export default EditBlogPage;