import React, {useState} from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';

function App() {
  const [refreshDocs, setRefreshDocs] = useState(0);
  const [searchResult, setSearchResult] = useState(null);

  const handleUploadSuccess = () => {
    setRefreshDocs(r => r + 1);
  };

  return (
    <div>
      <DocumentUpload onUploadSuccess={handleUploadSuccess} />
      <DocumentList refreshTrigger={refreshDocs} />
      <SearchBox onSearchResult={setSearchResult} />
      <AnswerDisplay answer={searchResult?.answer} sources={searchResult?.sources} />
      {/* Add other components here */}
    </div>
  );
}

export default App;