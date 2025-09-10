import './styles.scss'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Button, Icon, TextField } from '@shopify/polaris'
import {
    CodeIcon
} from '@shopify/polaris-icons';
import { useEffect, useState } from 'react'
import { cleanEditorHtml } from 'app/lib/utils/cleanEditorHtml'
// const extensions = [TextStyleKit, StarterKit]
const extensions = [TextStyleKit, StarterKit]

export function MenuBar({ editor, setShowCode, isShowCode }: { editor: Editor, setShowCode: (value: boolean) => void, isShowCode: boolean }) {
    if (!editor) return null;

    // Read the current editor's state, and re-render the component when it changes
    const editorState = useEditorState({
        editor,
        selector: ctx => {
            return {
                isBold: ctx.editor.isActive('bold') ?? false,
                canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
                isItalic: ctx.editor.isActive('italic') ?? false,
                canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
                isParagraph: ctx.editor.isActive('paragraph') ?? false,
                isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
                isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
                isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
                isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
                isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
                isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
                isBulletList: ctx.editor.isActive('bulletList') ?? false,
            }
        },
    })

    return (
        <>
            <div className="toolbar">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editorState.canBold || isShowCode}
                    className={editorState.isBold ? 'is-active' : ''}
                >
                    B
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editorState.canItalic || isShowCode}
                    className={editorState.isItalic ? 'is-active' : ''}
                >
                    𝑰
                </button>
                <button
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editorState.isParagraph ? 'is-active' : ''}
                    disabled={isShowCode}
                >
                    P
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editorState.isHeading1 ? 'is-active' : ''}
                    disabled={isShowCode}

                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editorState.isHeading2 ? 'is-active' : ''}
                    disabled={isShowCode}

                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editorState.isHeading3 ? 'is-active' : ''}
                    disabled={isShowCode}

                >
                    H3
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    className={editorState.isHeading4 ? 'is-active' : ''}
                    disabled={isShowCode}

                >
                    H4
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                    className={editorState.isHeading5 ? 'is-active' : ''}
                    disabled={isShowCode}


                >
                    H5
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                    className={editorState.isHeading6 ? 'is-active' : ''}
                    disabled={isShowCode}

                >
                    H6
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editorState.isBulletList ? 'is-active' : ''}
                    disabled={isShowCode}

                >
                    list
                </button>
                <button
                    className={editorState.isBulletList ? 'is-active' : ''}
                    onClick={() => { setShowCode(!isShowCode) }}
                >
                    <Icon
                        source={CodeIcon}
                        tone="base"
                    />
                </button>
            </div>

        </>
    )
}

export const EditorComponent = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => {
    const [isShowCode, setShowCode] = useState(false)
    const editor = useEditor({
        extensions,
        immediatelyRender: false,
        content,
        onUpdate: ({ editor }) => {
            // Khi editor thay đổi, trả về HTML
            const html = editor.getHTML()
            onChange?.(html)
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '', { emitUpdate: false });
        }
    }, [content, editor]);
    return (<>
        <div className='rich-editor-wrap'>
            <div className='rich-editor'>
                {editor && <MenuBar editor={editor} setShowCode={setShowCode} isShowCode={isShowCode} />}
                {isShowCode ?
                    <div className="input-editor"> &nbsp; {cleanEditorHtml(content)}</div>
                    :
                    <EditorContent className='input-editor' editor={editor} />
                }
            </div>
        </div>
    </>
    )
}
