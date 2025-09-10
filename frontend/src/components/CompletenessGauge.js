import React from 'react';
import { Box, Typography, LinearProgress, Fade } from '@mui/material';
import Paper from '@mui/material/Paper';

const getColor = (confidence) => {
  if (confidence >= 0.7) return 'success';
  if (confidence >= 0.4) return 'warning';
  return 'error';
};

const CompletenessGauge = ({ confidence }) => {
  return (
    <Fade in={confidence !== null && confidence !== undefined} timeout={500} unmountOnExit>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, boxShadow: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Completeness Check
        </Typography>
        <Typography variant="h6" sx={{ color: confidence < 0.7 ? 'error.main' : 'success.main', fontWeight: 700 }}>
          {Math.round(confidence * 100)}%
        </Typography>
        <Typography sx={{ mt: 1, color: getColor(confidence), fontWeight: 500 }}>
          {confidence >= 0.7 ? 'High confidence' : 'Low confidence'}
        </Typography>
      </Paper>
    </Fade>
  );
};

export default CompletenessGauge;