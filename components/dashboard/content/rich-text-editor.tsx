"use client"

import { useEffect, type ReactNode } from "react"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean
  disabled?: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the story…",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        horizontalRule: false,
        codeBlock: false,
        code: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-64 px-4 py-3 text-[15px] leading-7 outline-none focus-visible:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = current.isEmpty ? "" : current.getHTML()
      onChange(html)
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? "" : editor.getHTML()
    if (value === current) return
    editor.commands.setContent(value || "", { emitUpdate: false })
  }, [editor, value])

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-80 rounded-xl border border-input bg-transparent",
          className
        )}
      />
    )
  }

  function setLink() {
    const previous = editor?.getAttributes("link").href as string | undefined
    const next = window.prompt("Link URL", previous ?? "https://")
    if (next === null) return
    const trimmed = next.trim()
    if (!trimmed) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run()
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-input bg-transparent",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-input px-2 py-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={2} />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="text-xs font-semibold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="text-xs font-semibold">H3</span>
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <HugeiconsIcon icon={LeftToRightListBulletIcon} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <HugeiconsIcon icon={LeftToRightListNumberIcon} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <HugeiconsIcon icon={TextAlignCenterIcon} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <HugeiconsIcon icon={TextAlignRightIcon} strokeWidth={2} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
