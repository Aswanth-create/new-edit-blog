import React, { useState } from 'react';
import './NewBlogPage.css'; // Make sure this CSS file is in the same 'pages' folder
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function NewBlogPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // State to hold File objects

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  // Handler for file input change
  const handleFileChange = (e) => {
    // Add newly selected files to the existing array
    // Filter out duplicates if a file with the same name already exists in selectedFiles
    const newAddedFiles = Array.from(e.target.files).filter(
      (newFile) => !selectedFiles.some((existingFile) => existingFile.name === newFile.name)
    );
    setSelectedFiles((prevFiles) => [...prevFiles, ...newAddedFiles]);
    e.target.value = null; // Clear the input so same file can be selected again if needed
  };

  // Handler to remove a file from the selectedFiles array
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  // Handler for submitting the new blog post
  const handleSubmit = async () => {
    if (!title || !description) {
      alert('Please enter both title and description.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    // Append all selected files to the FormData object
    selectedFiles.forEach((file) => {
      formData.append('files', file); // 'files' must match the field name in multer.array('files', ...)
    });

    try {
      const response = await fetch('http://localhost:3000/api/blogs', {
        method: 'POST',
        // IMPORTANT: DO NOT set Content-Type for FormData. The browser handles it automatically.
        body: formData,
      });

      if (response.ok) {
        const newBlog = await response.json();
        console.log('Blog created successfully:', newBlog);
        alert('Blog created successfully!');
        navigate('/'); // Navigate back to the home page after successful creation
      } else {
        const errorData = await response.json();
        alert(`Failed to create blog: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('An error occurred while creating the blog. Please ensure the backend is running and accessible.');
    }
  };

  return (
    <div className="new-blog-container">
      <div className="blog-header-banner">
        <h1 className="blog-title">CREATE NEW BLOG</h1>
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
        <div className="input-group">
          <label className="upload-button">
            Upload Files (Pictures, Docs, etc.)
            <input
              type="file"
              multiple // Allow selecting multiple files
              style={{ display: 'none' }} // Hide the default file input
              onChange={handleFileChange}
            />
          </label>
          {selectedFiles.length > 0 && (
            <div className="selected-files-preview">
              <p>Selected Files:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name}
                    <button type="button" onClick={() => handleRemoveFile(file.name)} className="remove-file-button">
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
        <button className="submit-button-bottom" onClick={handleSubmit}>
          Submit Blog
        </button>
      </div>
    </div>
  );
}

export default NewBlogPage;