import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const DocumentList = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/documents');
      setDocuments(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch documents.');
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Uploaded Documents</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <List>
        {documents.map(doc => (
          <ListItem
            key={doc.id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(doc.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={doc.name} secondary={`Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}`} />
          </ListItem>
        ))}
        {documents.length === 0 && (
          <Typography sx={{ color: '#888', mt: 2 }}>No documents uploaded yet.</Typography>
        )}
      </List>
    </Box>
  );
};

export default DocumentList;