import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const AnswerDisplay = ({ answer, sources }) => {
  if (!answer) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>AI Answer</Typography>
      <Typography sx={{ mb: 2 }}>{answer}</Typography>
      {sources && sources.length > 0 && (
        <Box>
          <Typography variant="subtitle2">Source Documents:</Typography>
          {sources.map(src => (
            <Chip key={src.id} label={src.name} sx={{ mr: 1, mt: 1 }} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AnswerDisplay;