import React from 'react';
import { Typography, Fade } from '@mui/material';
import Paper from '@mui/material/Paper';

const EnrichmentSuggestions = ({ suggestions }) => {
  return (
    <Fade in={!!suggestions && suggestions.length > 0} timeout={500} unmountOnExit>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'left' }}>
          Enrichment Suggestions
        </Typography>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {suggestions.map((s, i) => (
            <li key={i} style={{ marginBottom: 8, fontSize: 15, color: '#222' }}>{s}</li>
          ))}
        </ul>
      </Paper>
    </Fade>
  );
};

export default EnrichmentSuggestions;