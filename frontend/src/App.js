import React, {useState} from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';
import CompletenessGauge from './components/CompletenessGauge';
import EnrichmentSuggestions from './components/EnrichmentSuggestions';
import axios from 'axios';
import { Container, Grid, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function App() {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Upload & Document List */}
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3 }}>
              <DocumentUpload onUploadSuccess={handleUploadSuccess} onError={handleError} />
              <DocumentList refreshTrigger={refreshDocs} onError={handleError} />
            </Box>
          </Grid>
          {/* Search & Results */}
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 3 }}>
              <SearchBox onSearchResult={handleSearchResult} onError={handleError} />
              <CompletenessGauge confidence={confidence} />
              <AnswerDisplay answer={searchResult?.answer} sources={searchResult?.sources} />
              <EnrichmentSuggestions suggestions={suggestions} />
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