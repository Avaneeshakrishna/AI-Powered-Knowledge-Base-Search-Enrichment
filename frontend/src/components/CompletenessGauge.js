import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const getColor = (confidence) => {
  if (confidence >= 0.7) return 'success';
  if (confidence >= 0.4) return 'warning';
  return 'error';
};

const CompletenessGauge = ({ confidence }) => {
  if (confidence === null || confidence === undefined) return null;

  return (
    <Box sx={{ mb: 3 }}>
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
    </Box>
  );
};

export default CompletenessGauge;