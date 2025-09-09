import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Button, Box, Typography, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
        border: '2px dashed #d0d5dd',
        borderRadius: 4,
        p: 4,
        textAlign: 'center',
        mb: 2,
        bgcolor: '#fff',
        minHeight: 260,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 16px #f3f3f3',
      }}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <CloudUploadIcon sx={{ fontSize: 48, color: '#888', mb: 2, bgcolor: '#f7f7fa', borderRadius: '50%', p: 1 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Upload Documents</Typography>
      <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
        Drag and drop your files here, or click to browse
      </Typography>
      <Button
        variant="contained"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
        sx={{
          borderRadius: 6,
          px: 4,
          py: 1.5,
          fontWeight: 600,
          fontSize: 16,
          bgcolor: '#f7f7fa',
          color: '#222',
          boxShadow: '0 2px 8px #e3e3e3',
          textTransform: 'none',
          mb: 2,
          '&:hover': { bgcolor: '#e3e3e3' }
        }}
      >
        Browse Files
      </Button>
      <input
        type="file"
        multiple
        accept=".txt"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleInputChange}
      />
      {uploading && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, width: '100%' }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
};

export default DocumentUpload;