import React, {useState} from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';
import CompletenessGauge from './components/CompletenessGauge';
import EnrichmentSuggestions from './components/EnrichmentSuggestions';
import axios from 'axios';
import { Container, Grid, Box, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function App() {
  const [tab, setTab] = useState(0);
  // ...existing code...
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#ff9800' },
      background: { default: '#f5f5f5', paper: '#fff' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 500 },
    },
  });
  const [refreshDocs, setRefreshDocs] = useState(0);
  const [searchResult, setSearchResult] = useState(null);
  const [confidence, setonfidence] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleUploadSuccess = () => {
    setRefreshDocs(r => r + 1);
    setSnackbar({ open: true, message: 'Upload successful!', severity: 'success' });
  };
  // Error handlers for child components
  const handleError = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearchResult = async (result) => {
    setSearchResult(result);
    setonfidence(null);
    setSuggestions([]);
    if(result && result.answer) {
      try {
        const res = await axios.post('http://localhost:4000/api/completeness', { answer: result.answer });
        setonfidence(res.data.confidence);
        console.log('Completeness confidence:', res.data.confidence);
      } catch {
        setonfidence(null);
      }
      try {
        const res = await axios.post('http://localhost:4000/api/enrich', { answer: result.answer });
        setSuggestions(res.data.suggestions);
        console.log('Enrichment suggestions:', res.data.suggestions);
      } catch {
        setSuggestions([]);
      }
    }
  }

 // Tab button component for segmented control
  const TabButton = ({ active, icon, label, onClick }) => {
    return (
      <Button
        onClick={onClick}
        startIcon={icon}
        sx={{
          flex: 1,
          px: 3,
          py: 1.5,
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 16,
          bgcolor: active ? '#fff' : 'transparent',
          color: active ? '#222' : '#888',
          boxShadow: active ? '0 2px 8px #e3e3e3' : 'none',
          border: active ? '1.5px solid #e3e3e3' : 'none',
          textTransform: 'none',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: '#fff', color: '#1976d2' },
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Top header with logo, title, subtitle */}
  <Box sx={{ width: '100%', bgcolor: 'transparent', pt: 3, pb: 2, boxShadow: '0 2px 8px #e3e3e3' }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
              <Box sx={{ mr: 2, width: 48, height: 48, borderRadius: 2, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/brain-logo.png" alt="logo" style={{ width: 36, height: 36 }} />
              </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>AI Knowledge Base</Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Search, analyze, and enrich your documents with AI</Typography>
            </Box>
          </Box>
          {/* Centered search bar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box sx={{ width: '100%', maxWidth: 700 }}>
              <SearchBox onSearchResult={handleSearchResult} onError={handleError} />
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Main content below header */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={4} alignItems="flex-start">
          {/* Left side: Compact document upload and list with tab switch and search */}
          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'transparent', borderRadius: 3, boxShadow: 'none', p: 2, minWidth: 220, maxWidth: 320, mx: 'auto' }}>
              {/* Tabs */}
              <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
                <Button
                  variant={tab === 0 ? 'contained' : 'text'}
                  size="small"
                  onClick={() => setTab(0)}
                  sx={{ flex: 1, borderRadius: 2, fontSize: 13, fontWeight: 600, textTransform: 'none' }}
                >
                  Documents
                </Button>
                <Button
                  variant={tab === 1 ? 'contained' : 'text'}
                  size="small"
                  onClick={() => setTab(1)}
                  sx={{ flex: 1, borderRadius: 2, fontSize: 13, fontWeight: 600, textTransform: 'none' }}
                >
                  Upload
                </Button>
              </Box>
              {/* Document Search */}
              {tab === 0 && (
                <Box sx={{ mb: 2 }}>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none', fontSize: 13, marginBottom: 8 }}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <DocumentList refreshTrigger={refreshDocs} onError={handleError} searchTerm={searchTerm} />
                </Box>
              )}
              {/* Upload Tab */}
              {tab === 1 && (
                <Box sx={{ mb: 2 }}>
                  <DocumentUpload onUploadSuccess={handleUploadSuccess} onError={handleError} compact />
                </Box>
              )}
            </Box>
          </Grid>
          {/* Right side: AI answer, completeness, enrichment */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <AnswerDisplay answer={searchResult && searchResult.answer} />
              <Box sx={{ mt: 3 }}>
                <CompletenessGauge confidence={confidence} />
              </Box>
              <Box sx={{ mt: 3 }}>
                <EnrichmentSuggestions suggestions={suggestions} />
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;