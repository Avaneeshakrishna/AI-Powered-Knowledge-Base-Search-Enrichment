import React from 'react';
import { Box, Typography, Chip, Fade } from '@mui/material';
import Paper from '@mui/material/Paper';

const EnrichmentSuggestions = ({ suggestions }) => {
  return (
    <Fade in={!!suggestions && suggestions.length > 0} timeout={500} unmountOnExit>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Enrichment Suggestions
        </Typography>
        {suggestions.map((s, i) => (
          <Chip key={i} label={s} sx={{ mr: 1, mt: 1 }} />
        ))}
      </Paper>
    </Fade>
  );
};

export default EnrichmentSuggestions;