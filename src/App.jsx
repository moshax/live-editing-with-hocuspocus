import React from 'react'
import CollaborativeEditor from './CollaborativeEditor.jsx'

export default function App( docId, userName) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#f5f5f7',
    }}>
      <p class="alert alert-primary" style={{ marginBottom: '0.25rem' }}>
        This collaborative editor allows multiple people to write, edit, and share comments on the same document in real time. Each user appears in a different color, 
        and you can see the cursor and others' changes as they happen. Edits are also saved automatically.
    </p>

      <div style={{
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
        padding: '1rem 1.5rem 1.5rem',
        border: '1px solid #e5e7eb',
      }}>
        <CollaborativeEditor docId={docId} userName={userName} />
      </div>
       <p class="alert alert-primary" style={{ marginBottom: '0.25rem' }}>
        Implemented at <a href="https://2ooly.com">2ooly.com</a>.
    </p>
    </div>
  )
}
