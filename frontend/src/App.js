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
      <Box sx={{ width: '100%', bgcolor: 'transparent', pt: 3, pb: 2 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 } }}>
            <Box sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 }, width: 48, height: 48, borderRadius: 2, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => {
                setTab(0);
                setSearchResult(null);
                setonfidence(null);
                setSuggestions([]);
                setRefreshDocs(r => r + 1);
              }}
            >
              <img src="/brain-logo.png" alt="logo" style={{ width: 36, height: 36 }} />
            </Box>
            <Box sx={{ maxWidth: { xs: '100%', sm: '80%', md: '600px' }, wordBreak: 'break-word' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 550,
                  fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2rem' },
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  maxWidth: { xs: '100%', sm: '80vw', md: '600px' }
                }}
              >
                AI Knowledge Base
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' },
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  maxWidth: { xs: '100%', sm: '80vw', md: '600px' }
                }}
              >
                Search, analyze, and enrich your documents with AI
              </Typography>
            </Box>
          </Box>
        </Container>
        {/* Thin, visible line from left to right end of screen */}
        <Box sx={{ width: '100vw', height: '0.1px', bgcolor: '#d1d5db', mb: 2, borderRadius: 1, position: 'relative', left: '50%', transform: 'translateX(-50%)' }} />
        {/* Centered search bar */}
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box sx={{ width: '100%', maxWidth: 700 }}>
              <SearchBox onSearchResult={handleSearchResult} onError={handleError} />
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Main content below header */}
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
            gap: { xs: 2, sm: 3, md: 4 },
            width: '100%',
          }}
        >
          {/* Left side: Compact document upload and list with tab switch and search */}
          <Box
            sx={{
              minWidth: { xs: '100%', md: 260 },
              maxWidth: { xs: '100%', md: 320 },
              flex: { xs: 'none', md: '0 0 320px' },
              bgcolor: 'transparent',
              borderRadius: 3,
              boxShadow: 'none',
              p: { xs: 1, sm: 2 },
              mb: { xs: 2, md: 0 },
            }}
          >
            {/* Tabs */}
            <Box sx={{ display: 'flex', mb: 2, gap: 0, boxShadow: 'none', border: 'none', bgcolor: 'transparent', borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(90deg, #fafafa 60%, #fff 100%)', p: 0, height: 44 }}>
              <Button
                startIcon={<span style={{ display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2h9a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h9V4H6zm2 4h5v2H8V8zm0 4h5v2H8v-2z" stroke="#222" strokeWidth="2"/></svg></span>}
                variant={tab === 0 ? 'contained' : 'text'}
                size="large"
                onClick={() => setTab(0)}
                sx={{
                  flex: 1,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: tab === 0 ? '0 2px 8px #e3e3e3' : 'none',
                  bgcolor: tab === 0 ? '#fff' : 'transparent',
                  color: tab === 0 ? '#222' : '#888',
                  px: 4,
                  py: 1,
                  minHeight: 44,
                  border: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#fff', color: '#1976d2' },
                }}
              >
                Documents
              </Button>
              <Button
                startIcon={<span style={{ display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20m10-10H2" stroke="#222" strokeWidth="2"/><circle cx="12" cy="12" r="10" stroke="#222" strokeWidth="2" fill="#fff"/></svg></span>}
                variant={tab === 1 ? 'contained' : 'text'}
                size="large"
                onClick={() => setTab(1)}
                sx={{
                  flex: 1,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: tab === 1 ? '0 2px 8px #e3e3e3' : 'none',
                  bgcolor: tab === 1 ? '#fff' : 'transparent',
                  color: tab === 1 ? '#222' : '#888',
                  px: 4,
                  py: 1,
                  minHeight: 44,
                  border: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#fff', color: '#1976d2' },
                }}
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
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 340 }, maxWidth: '100%' }}>
            <Box sx={{ mb: 4, boxShadow: 'none', border: 'none', bgcolor: 'transparent', position: 'relative', width: '100%' }}>
              <AnswerDisplay answer={searchResult && searchResult.answer} />
              {/* Show confidence only when AI answer is present, resize and remove completeness word */}
              <Box sx={{ mt: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'stretch' }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <CompletenessGauge confidence={confidence} small />
                </Box>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <EnrichmentSuggestions suggestions={suggestions} />
                </Box>
              </Box>
              {/* References, citations, sources below AI Answer */}
              <Box sx={{ mt: 3 }}>
                {searchResult && searchResult.citations && searchResult.citations.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>References & Citations</Typography>
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {searchResult.citations.map((cite, idx) => (
                        <li key={idx} style={{ marginBottom: 6 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{cite}</Typography>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
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