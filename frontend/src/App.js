import React, {useState} from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';
import CompletenessGauge from './components/CompletenessGauge';
import EnrichmentSuggestions from './components/EnrichmentSuggestions';
import axios from 'axios';

function App() {
  const [refreshDocs, setRefreshDocs] = useState(0);
  const [searchResult, setSearchResult] = useState(null);
  const [confidence, setonfidence] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const handleUploadSuccess = () => {
    setRefreshDocs(r => r + 1);
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
    <div>
      <DocumentUpload onUploadSuccess={handleUploadSuccess} />
      <DocumentList refreshTrigger={refreshDocs} />
      <SearchBox onSearchResult={handleSearchResult} />
      <CompletenessGauge confidence={confidence} />
      <AnswerDisplay answer={searchResult?.answer} sources={searchResult?.sources} />
      <EnrichmentSuggestions suggestions={suggestions} />
      {/* Add other components here */}
    </div>
  );
}

export default App;