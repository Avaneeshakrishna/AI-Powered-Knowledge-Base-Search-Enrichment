import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, CircularProgress, Typography } from '@mui/material';

const SearchBox = ({ onSearchResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:4000/api/search', { query });
      onSearchResult(res.data);
    } catch (err) {
      setError('Search failed. Make sure documents are uploaded.');
      onSearchResult(null);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        label="Ask a question"
        variant="outlined"
        fullWidth
        value={query}
        onChange={e => setQuery(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSearch} disabled={loading || !query.trim()}>
        Search
      </Button>
      {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
};

export default SearchBox;