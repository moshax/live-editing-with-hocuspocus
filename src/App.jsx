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
      هذا محرر تعاوني يسمح لعدة أشخاص بالكتابة، والتعديل، ومشاركة
      التعليقات في نفس المستند في الوقت الحقيقي. كل مستخدم يظهر
      بلون مختلف، ويمكنك رؤية المؤشر وتغييرات الآخرين فور حدوثها. كما أن التعديلات يتم حفظها اليا بشكل تلقائي.
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
    </div>
  )
}
