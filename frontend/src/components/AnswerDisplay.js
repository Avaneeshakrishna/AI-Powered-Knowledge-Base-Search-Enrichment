import React from 'react';
import { Box, Typography, Chip, Fade } from '@mui/material';
import Paper from '@mui/material/Paper';

const AnswerDisplay = ({ answer, sources }) => {
  return (
    <Fade in={!!answer} timeout={500} unmountOnExit>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>AI Answer</Typography>
        <Typography sx={{ mb: 2 }}>{answer}</Typography>
        {sources && sources.length > 0 && (
          <Box>
            <Typography variant="subtitle2">Source Documents:</Typography>
            {sources.map(src => (
              <Chip
                key={src.id}
                label={src.name}
                color="primary"
                sx={{
                  mr: 1,
                  mt: 1,
                  boxShadow: '0 0 2px 2px #1976d2',
                  fontWeight: 600,
                }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default AnswerDisplay;