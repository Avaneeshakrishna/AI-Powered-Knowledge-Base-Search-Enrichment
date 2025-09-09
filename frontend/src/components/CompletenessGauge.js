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
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Confidence / Completeness
        </Typography>
        <LinearProgress
          variant="determinate"
          value={confidence * 100}
          color={getColor(confidence)}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography sx={{ mt: 1, color: getColor(confidence) }}>
          {confidence >= 0.7
            ? 'High confidence'
            : confidence >= 0.4
            ? 'Medium confidence'
            : 'Low confidence'}
        </Typography>
      </Paper>
    </Fade>
  );
};

export default CompletenessGauge;