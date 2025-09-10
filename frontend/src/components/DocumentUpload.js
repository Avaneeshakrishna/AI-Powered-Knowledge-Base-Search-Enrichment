import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Typography, LinearProgress } from '@mui/material';
import UploadFileIcon   from '@mui/icons-material/UploadFile';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [documents, setDocuments] = useState([]);
  const [parentId, setParentId] = useState('');
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch documents for dropdown
    axios.get('http://localhost:4000/api/documents').then(res => setDocuments(res.data));
  }, []);

  const handleFiles = async (files) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    if (parentId) formData.append('parentId', parentId);
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
      {/* Select main document for supporting upload */}
      <Box sx={{ mb: 2, width: '100%' }}>
        <Typography variant="body2" sx={{ mb: 1 }}>Link as supporting document (optional):</Typography>
        <select
          value={parentId}
          onChange={e => setParentId(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
        >
          <option value="">None (standalone)</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>
      </Box>
      <Box onClick={() => fileInputRef.current.click()} sx={{ cursor: 'pointer', mb: 2 }}>
        <UploadFileIcon sx={{ fontSize: 48, color: '#888', bgcolor: '#f7f7fa', borderRadius: '50%', p: 1 }} />
      </Box>
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
          '&:hover': { bgcolor: '#e3e3e3' },
          '&.Mui-focusVisible': { bgcolor: '#f7f7fa' },
          '&.Mui-active': { bgcolor: '#f7f7fa' },
          '&.MuiButton-contained:active': { bgcolor: '#f7f7fa' }
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