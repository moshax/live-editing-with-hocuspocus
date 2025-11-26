import { StrictMode } from 'react'

import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root')

// Get config from global window
const docId = window.EditorConfig?.docId || "default-doc"
const userName = window.EditorConfig?.userName || "Anonymous"

// Pass them as props to App
ReactDOM.createRoot(rootElement).render(
  <App docId={docId} userName={userName} />
)
