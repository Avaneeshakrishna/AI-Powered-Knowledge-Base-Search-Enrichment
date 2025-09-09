import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const EnrichmentSuggestions = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Enrichment Suggestions
      </Typography>
      {suggestions.map((s, i) => (
        <Chip key={i} label={s} sx={{ mr: 1, mt: 1 }} />
      ))}
    </Box>
  );
};

export default EnrichmentSuggestions;