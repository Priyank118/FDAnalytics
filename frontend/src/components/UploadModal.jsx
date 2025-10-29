import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './AddMatchModal.css'; // We reuse the same modal styles
import { FaTimes, FaFileUpload } from 'react-icons/fa';

Modal.setAppElement('#root');

function UploadModal({ isOpen, onRequestClose, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading and analyzing...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/upload-match-result', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      onUploadComplete(); // Refresh the match list
      setTimeout(() => {
        onRequestClose(); // Close modal after a delay
        // Reset state for the next time it opens
        setMessage('');
        setSelectedFile(null);
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle closing and resetting state
  const handleClose = () => {
      setSelectedFile(null);
      setMessage('');
      setIsUploading(false);
      onRequestClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>Upload Match Result Screenshot</h2>
        <button onClick={handleClose} className="close-btn"><FaTimes /></button>
      </div>
      <div className="upload-area">
        <label htmlFor="file-upload" className="file-upload-label">
          {selectedFile ? (
            <span>{selectedFile.name}</span>
          ) : (
            <>
              <FaFileUpload />
              <span>Click to select a screenshot</span>
            </>
          )}
        </label>
        <input id="file-upload" type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
        <p className="upload-instructions">
          Please upload the final "Match Results" screen showing the full team stats.
        </p>
      </div>
      
      {message && <p className="message-area">{message}</p>}

      <div className="form-actions">
        <button onClick={handleClose} className="btn-secondary">Cancel</button>
        <button onClick={handleUpload} className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Analyzing...' : 'Upload & Save'}
        </button>
      </div>
    </Modal>
  );
}

export default UploadModal;