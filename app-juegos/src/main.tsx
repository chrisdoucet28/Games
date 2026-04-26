import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Opcional, pero recomendado (ver punto 2)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)