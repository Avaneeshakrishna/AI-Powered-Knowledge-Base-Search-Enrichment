import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Button, Box, Typography, LinearProgress } from '@mui/material';

const DocumentUpload = ({ onUploadSuccess }) => {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFiles = async (files) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    try {
      await axios.post('http://localhost:4000/api/upload', formData, {
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      setProgress(100);
      onUploadSuccess();
    } catch (err) {
      setError('Upload failed. Only .txt files are supported.');
    }
    setUploading(false);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Box
      sx={{
        border: '2px dashed #1976d2',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        mb: 2,
        bgcolor: '#f5f5f5'
      }}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <Typography variant="h6">Upload .txt Documents</Typography>
      <Button
        variant="contained"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
        sx={{ mt: 2 }}
      >
        Select Files
      </Button>
      <input
        type="file"
        multiple
        accept=".txt"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleInputChange}
      />
      {uploading && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      <Typography sx={{ mt: 2, color: '#888' }}>Or drag and drop files here</Typography>
    </Box>
  );
};

export default DocumentUpload;