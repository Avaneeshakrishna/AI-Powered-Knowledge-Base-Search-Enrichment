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
import { Drawer, Toolbar, List, ListItem, ListItemIcon, ListItemText, AppBar } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; 

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
      <Box sx={{ width: '100%', bgcolor: 'background.paper', pt: 3, pb: 2, boxShadow: '0 2px 8px #e3e3e3' }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
            <Box sx={{ width: '100%', maxWidth: 700, bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 2px 16px #e3e3e3', p: 2, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <SearchBox onSearchResult={handleSearchResult} onError={handleError} />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Main content below header */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Tabs for Documents/Upload */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{
            display: 'flex',
            bgcolor: '#f7f7fa',
            borderRadius: 8,
            boxShadow: '0 2px 8px #e3e3e3',
            p: 0.5,
            gap: 1,
            width: 340,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TabButton
              active={tab === 0}
              icon={<ArticleIcon sx={{ mr: 1 }} />}
              label="Documents"
              onClick={() => setTab(0)}
            />
            <TabButton
              active={tab === 1}
              icon={<UploadFileIcon sx={{ mr: 1 }} />}
              label="Upload"
              onClick={() => setTab(1)}
            />
          </Box>
        </Box>
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              {tab === 0 ? (
                <DocumentList refreshTrigger={refreshDocs} onError={handleError} />
              ) : null}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              {tab === 1 ? (
                <DocumentUpload onUploadSuccess={handleUploadSuccess} onError={handleError} />
              ) : null}
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