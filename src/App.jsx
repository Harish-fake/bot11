import { useState } from 'react';
import { Settings, FileText, FileCode, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { marked } from 'marked';
import './index.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Please provide a Google Gemini API Key.');
      return;
    }
    if (!readmeContent || !templateContent) {
      setError('Please provide both the README and Template content.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const prompt = `You are an expert technical writer and project manager. 
I have a project README, and a Template for a final report.
I need you to carefully read the README, understand the project, and then fill out the provided Template thoroughly.
Output ONLY the fully filled template in Markdown format.

<README>
${readmeContent}
</README>

<TEMPLATE>
${templateContent}
</TEMPLATE>`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate report');
      }

      const reportText = data.candidates[0].content.parts[0].text;
      setGeneratedReport(reportText);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createMarkup = () => {
    return { __html: marked(generatedReport) };
  };

  return (
    <div className="app-container">
      <header>
        <h1>Aether ReportGen</h1>
        <p>AI-Powered Automatic Project Report Generator</p>
      </header>

      <div className="flex-container">
        <div className="col glass-panel">
          <div className="input-group">
            <label><Settings size={18}/> Gemini API Key</label>
            <input 
              type="password" 
              className="input-control" 
              placeholder="AIzaSy..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="input-group flex-1">
            <label><FileCode size={18}/> README Content</label>
            <textarea 
              className="input-control" 
              placeholder="Paste your README.md content here..."
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
            />
          </div>

          <div className="input-group flex-1">
            <label><FileText size={18}/> Report Template</label>
            <textarea 
              className="input-control" 
              placeholder="Paste your report template here..."
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
            />
          </div>

          {error && <p style={{color: '#ef4444', marginBottom: '1rem', fontWeight: 500}}>{error}</p>}

          <button 
            className="btn" 
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="spinner" size={20}/> : <Sparkles size={20}/>}
            {isLoading ? 'Generating Magic...' : 'Generate Report'}
          </button>
        </div>

        <div className="col glass-panel" style={{display: 'flex', flexDirection: 'column'}}>
          <div className="input-group" style={{marginBottom: '1rem'}}>
            <label><CheckCircle size={18}/> Generated Report</label>
          </div>
          
          <div className="result-glass">
            {generatedReport ? (
              <div 
                className="markdown-body"
                dangerouslySetInnerHTML={createMarkup()}
              />
            ) : (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)'}}>
                <p>Your generated report will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
