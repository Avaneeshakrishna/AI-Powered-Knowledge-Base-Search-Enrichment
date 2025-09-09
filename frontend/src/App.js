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
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
          {/* Left side: Compact document upload and list with tab switch and search */}
          <Box sx={{ minWidth: 260, maxWidth: 320, flex: '0 0 320px', bgcolor: 'transparent', borderRadius: 3, boxShadow: 'none', p: 2 }}>
            {/* Tabs */}
            <Box sx={{ display: 'flex', mb: 2, gap: 1, boxShadow: 'none', border: 'none', bgcolor: 'transparent' }}>
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
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none', fontSize: 13, marginBottom: 8, background: '#fafafa', boxShadow: 'none' }}
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
          {/* Right side: AI answer, completeness, enrichment */}
          <Box sx={{ flex: 1, minWidth: 340 }}>
            <Box sx={{ mb: 4, boxShadow: 'none', border: 'none', bgcolor: 'transparent', position: 'relative', width: '100%' }}>
              {/* AI Answer Title */}
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                AI Answer
              </Typography>
              <AnswerDisplay answer={searchResult && searchResult.answer} />
              {/* Show confidence only when AI answer is present, resize and remove completeness word */}
              {searchResult && searchResult.answer && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M7 13l3 3 7-7" stroke="#43a047" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="11" stroke="#43a047" strokeWidth="2" fill="none"/></svg>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500, lineHeight: 1 }}>Confidence</Typography>
                      <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 700, lineHeight: 1 }}>{confidence !== null && confidence !== undefined ? `${Math.round(confidence * 100)}%` : '--'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompletenessGauge confidence={confidence} small />
                  </Box>
                </Box>
              )}
              {/* References, citations, sources below AI Answer */}
              {searchResult && searchResult.citations && searchResult.citations.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>References & Citations</Typography>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {searchResult.citations.map((cite, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{cite}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
              <Box sx={{ mt: 3 }}>
                <EnrichmentSuggestions suggestions={suggestions} />
              </Box>
            </Box>
          </Box>
        </Box>
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