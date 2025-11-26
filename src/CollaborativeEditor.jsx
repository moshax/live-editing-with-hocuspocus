import React, { useEffect, useMemo, useState } from 'react'
import { useEditor, EditorContent,BubbleMenu  } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'

import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { Mark } from '@tiptap/core'

// ------- config from external source -------
const cfg = window.EditorConfig || {}
const DOC_ID = cfg.docId || 'demo-doc'
const USER_NAME = cfg.userName || 'Anonymous'
const INITIAL_HTML = cfg.initialHtml || ''

// ------- Yjs Doc + Provider  -------
const ydoc = new Y.Doc()
const commentsY = ydoc.getArray('comments')

const provider = new HocuspocusProvider({
  url: 'wss://2ooly.com/', // replace with your Hocuspocus server URL 
  name: DOC_ID,
  document: ydoc,
})



const CommentMark = Mark.create({
  name: 'commentMark',

  addAttributes() {
    return {
      id: {},
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        ...HTMLAttributes,
        'data-comment-id': HTMLAttributes.id,
        style:
          'background-color:#fef3c7;border-radius:3px;padding:0 2px;',
      },
      0,
    ]
  },
})

function ConnectionBadge({ status }) {
  let label = ''
  let bg = ''
  let dot = ''
  let color = '#111827'

  switch (status) {
    case 'connected':
      label = 'متصل'
      bg = '#dcfce7'
      dot = '#22c55e'
      break
    case 'connecting':
      label = 'جار الاتصال'
      bg = '#fef3c7'
      dot = '#facc15'
      break
    default:
      label = 'غير متصل'
      bg = '#fee2e2'
      dot = '#ef4444'
      break
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '999px',
        backgroundColor: bg,
        fontSize: '0.75rem',
        fontWeight: 500,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '999px',
          backgroundColor: dot,
        }}
      />
      {label}
    </span>
  )
}

export default function CollaborativeEditor() {
  const [comments, setComments] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  const user = useMemo(() => {
    const colors = ['#ec4899', '#6366f1', '#22c55e', '#f97316', '#06b6d4']
    const color = colors[Math.floor(Math.random() * colors.length)]
    return { name: USER_NAME, color }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Underline,
      CommentMark,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({ provider, user }),
    ],
  })



useEffect(() => {
    const onStatus = (e) => {
      console.log('2ooly Editor status:', e.status)
      setConnectionStatus(e.status) // "connecting" | "connected" | "disconnected"
    }

    provider.on('status', onStatus)
    return () => provider.off('status', onStatus)
  }, [])


  const removeAllComments = () => {
  if (!editor) return
  if (!comments.length) return

  const confirmDelete = window.confirm(
    'هل تريد حذف جميع التعليقات من المستند؟'
  )
  if (!confirmDelete) return

  // 1) Remove highlight mark from the whole document
  const { state, view } = editor
  const { tr } = state

  state.doc.descendants((node, pos) => {
    // نشتغل بس على الـ text nodes
    if (!node.isText) return

    node.marks
      .filter(mark => mark.type.name === 'commentMark')
      .forEach(mark => {
        tr.removeMark(pos, pos + node.nodeSize, mark.type)
      })
  })

  if (tr.docChanged) {
    view.dispatch(tr)
  }

  // 2) Clear all comments from Yjs array
  commentsY.delete(0, commentsY.length)
}

  // sync comments state مع Yjs array
  useEffect(() => {
    const update = () => setComments(commentsY.toArray())
    update()
    commentsY.observe(update)
    return () => commentsY.unobserve(update)
  }, [])

  // log status اختياري
  useEffect(() => {
    const onStatus = e => console.log('2ooly Editor status:', e.status)
    provider.on('status', onStatus)
    return () => provider.off('status', onStatus)
  }, [])

  // load INITIAL_HTML لو الـ doc فاضي
  useEffect(() => {
    if (!editor) return

    const onSynced = ({ state }) => {
      if (!state) return
      if (!editor.isEmpty) return

      if (INITIAL_HTML) {
        editor.commands.setContent(INITIAL_HTML, false)
      }
    }

    provider.on('synced', onSynced)
    return () => provider.off('synced', onSynced)
  }, [editor])

  // expose editor لـ window
  useEffect(() => {
    if (!editor) return

    window.liveEditor = editor
    return () => {
      if (window.liveEditor === editor) delete window.liveEditor
    }
  }, [editor])

  if (!editor) return <div>Loading editor…</div>

  const makeButton = (label, action, isActive = false) => (
    <button
      type="button"
      onClick={action}
      style={{
        padding: '4px 8px',
        marginRight: '4px',
        marginBottom: '4px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        background: isActive ? '#111827' : '#f9fafb',
        color: isActive ? '#f9fafb' : '#111827',
        fontSize: '0.8rem',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  const makeGroup = (children) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginInlineEnd: '8px',
        borderInlineEnd: '1px solid #e5e7eb',
        paddingInlineEnd: '8px',
      }}
    >
      {children}
    </div>
  )

  const addComment = () => {
  if (!editor) return

  const { from, to } = editor.state.selection
  if (from === to) {
    alert('حدد جزء من النص الأول')
    return
  }

  const selectedText = editor.state.doc.textBetween(from, to, ' ')
  const text = window.prompt(`تعليق على:\n"${selectedText}"`)
  if (!text) return

  const id = Date.now() + '-' + Math.random().toString(16).slice(2)

  // 1) ضع علامة commentMark على النص المحدد
  editor.chain().focus().setMark('commentMark', { id }).run()

  // 2) خزّن التعليق في Yjs (زي ما كنت عامل قبل كده)
  commentsY.push([
    {
      id,
      author: USER_NAME,
      text,
      snippet: selectedText,
      createdAt: new Date().toISOString(),
    },
  ])
}

  const toggleLink = () => {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const previousUrl = editor.getAttributes('link').href || ''
    const url = window.prompt('أدخل الرابط:', previousUrl)
    if (!url) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const insertImage = () => {
    if (!editor) return
    const url = window.prompt('أدخل رابط الصورة:')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* LEFT: editor + toolbar */}
      <div style={{ flex: 3, minWidth: 0 }}>
              {/* Context / bubble menu for comments */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ placement: 'bottom' }}
      >
        <button
          type="button"
          onClick={addComment}
          style={{
            padding: '4px 8px',
            fontSize: '0.8rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: '#111827',
            color: '#f9fafb',
            cursor: 'pointer',
          }}
        >
          + إضافة تعليق
        </button>
      </BubbleMenu>
<ConnectionBadge status={connectionStatus} />
        {/* Toolbar */}
        <div
          style={{
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '0.5rem',
            marginBottom: '0.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Text style */}
          {makeGroup(
            <>
              {makeButton(
                'B',
                () => editor.chain().focus().toggleBold().run(),
                editor.isActive('bold'),
              )}
              {makeButton(
                'I',
                () => editor.chain().focus().toggleItalic().run(),
                editor.isActive('italic'),
              )}
              {makeButton(
                'U',
                () => editor.chain().focus().toggleUnderline().run(),
                editor.isActive('underline'),
              )}
              {makeButton(
                'S',
                () => editor.chain().focus().toggleStrike().run(),
                editor.isActive('strike'),
              )}
              {makeButton(
                'Highlight',
                () => editor.chain().focus().toggleHighlight().run(),
                editor.isActive('highlight'),
              )}
              {makeButton(
                '{ }',
                () => editor.chain().focus().toggleCode().run(),
                editor.isActive('code'),
              )}
            </>
          )}

          {/* Headings */}
          {makeGroup(
            <>
              {makeButton(
                'نص عادي',
                () => editor.chain().focus().setParagraph().run(),
                editor.isActive('paragraph'),
              )}
              {makeButton(
                'H1',
                () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                editor.isActive('heading', { level: 1 }),
              )}
              {makeButton(
                'H2',
                () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                editor.isActive('heading', { level: 2 }),
              )}
              {makeButton(
                'H3',
                () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                editor.isActive('heading', { level: 3 }),
              )}
            </>
          )}

          {/* Lists */}
          {makeGroup(
            <>
              {makeButton(
                '• قائمة',
                () => editor.chain().focus().toggleBulletList().run(),
                editor.isActive('bulletList'),
              )}
              {makeButton(
                '1. قائمة',
                () => editor.chain().focus().toggleOrderedList().run(),
                editor.isActive('orderedList'),
              )}
            </>
          )}

          {/* Alignment */}
          {makeGroup(
            <>
              {makeButton(
                'يمين',
                () => editor.chain().focus().setTextAlign('right').run(),
                editor.isActive({ textAlign: 'right' }),
              )}
              {makeButton(
                'يسار',
                () => editor.chain().focus().setTextAlign('left').run(),
                editor.isActive({ textAlign: 'left' }),
              )}
              {makeButton(
                'توسط',
                () => editor.chain().focus().setTextAlign('center').run(),
                editor.isActive({ textAlign: 'center' }),
              )}
              {makeButton(
                'توزيع',
                () => editor.chain().focus().setTextAlign('justify').run(),
                editor.isActive({ textAlign: 'justify' }),
              )}
            </>
          )}

          {/* Insert */}
          {makeGroup(
            <>
              {makeButton(
                'رابط',
                toggleLink,
                editor.isActive('link'),
              )}
              {makeButton(
                'صورة',
                insertImage,
              )}
              {makeButton(
                'اقتباس',
                () => editor.chain().focus().toggleBlockquote().run(),
                editor.isActive('blockquote'),
              )}
              {makeButton(
                'Code block',
                () => editor.chain().focus().toggleCodeBlock().run(),
                editor.isActive('codeBlock'),
              )}
              {makeButton(
                'خط فاصل',
                () => editor.chain().focus().setHorizontalRule().run(),
              )}
            </>
          )}

          {/* History */}
          <div style={{ display: 'flex', marginInlineStart: '8px' }}>
            {makeButton('Undo', () => editor.chain().focus().undo().run())}
            {makeButton('Redo', () => editor.chain().focus().redo().run())}
          </div>
        </div>

        {/* Editor */}
        <div
          style={{
            minHeight: '250px',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            direction: 'rtl',
            textAlign: 'right',
          }}
        >
          <EditorContent editor={editor} />
        </div>

        <p
          style={{
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            color: '#6b7280',
            textAlign: 'left',
          }}
        >
          Document: <strong>{DOC_ID}</strong> – You are <strong>{USER_NAME}</strong>.
        </p>
      </div>

      {/* RIGHT: comments */}
      <div
        style={{
          flex: 1.4,
          minWidth: '220px',
          maxWidth: '280px',
          borderLeft: '1px solid #e5e7eb',
          paddingLeft: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            التعليقات
          </h3>
          <button
            type="button"
            onClick={addComment}
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            + إضافة
          </button>
          <button
      type="button"
      onClick={removeAllComments}
      disabled={!comments.length}
      style={{
        padding: '2px 8px',
        borderRadius: '6px',
        border: '1px solid #fecaca',
        background: !comments.length ? '#f9fafb' : '#fee2e2',
        fontSize: '0.8rem',
        cursor: !comments.length ? 'not-allowed' : 'pointer',
        color: '#b91c1c',
      }}
    >
      حذف الكل
    </button>
        </div>

        {comments.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            حدّد جزء من النص، واضغط “إضافة” عشان تعمل تعليق.
          </p>
        )}

        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                marginBottom: '0.5rem',
                padding: '0.4rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                <strong>{c.author}</strong>
              </div>
              {c.snippet && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    marginBottom: '0.25rem',
                  }}
                >
                  “{c.snippet}”
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#111827' }}>
                {c.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
