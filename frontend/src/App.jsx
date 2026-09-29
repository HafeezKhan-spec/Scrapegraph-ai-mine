import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post(`${API_URL}/scrape`, {
        url,
        prompt,
      })
      setResult(response.data.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const examplePrompts = [
    { url: 'https://news.ycombinator.com', prompt: 'Extract the top 5 news headlines with their links' },
    { url: 'https://github.com/trending', prompt: 'List the top 3 trending repositories with descriptions' },
    { url: 'https://scrapegraphai.com', prompt: 'Extract information about the company and its features' },
  ]

  const useExample = (example) => {
    setUrl(example.url)
    setPrompt(example.prompt)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🕷️</span>
          <h1>ScrapeGraphAI</h1>
        </div>
        <p className="tagline">AI-Powered Web Scraping</p>
      </header>

      <main className="main">
        <form onSubmit={handleSubmit} className="scrape-form">
          <div className="form-group">
            <label htmlFor="url">Website URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prompt">What do you want to extract?</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Extract the main headline and a list of all product names with their prices..."
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Scraping... (this may take a few minutes)
              </>
            ) : (
              <>
                <span>🚀</span>
                Start Scraping
              </>
            )}
          </button>
        </form>

        <div className="examples">
          <h3>Try an example:</h3>
          <div className="example-buttons">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                className="example-btn"
                onClick={() => useExample(example)}
                disabled={loading}
              >
                {new URL(example.url).hostname}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-box">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-box">
            <h3>Scraped Data</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by ScrapeGraphAI + NVIDIA Nemotron LLM</p>
      </footer>
    </div>
  )
}

export default App
