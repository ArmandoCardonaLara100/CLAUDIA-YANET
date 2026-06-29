"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Highlighter,
  Link2,
  Link2Off,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wrap legacy plain text so it loads into the editor with line breaks intact.
 * Content that already looks like HTML is passed through untouched.
 */
function toInitialContent(value: string): string {
  const v = value ?? "";
  if (!v.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(v)) return v; // already HTML
  const escaped = v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<p>${escaped.replace(/\n/g, "<br>")}</p>`;
}

type RichTextEditorProps = {
  /** Initial HTML (or legacy plain text). Read once on mount — keep the host keyed. */
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
};

export function RichTextEditor({
  initialContent,
  onChange,
  className,
  minHeight = 420,
}: RichTextEditorProps) {
  // Keep the latest onChange so TipTap's once-bound onUpdate never goes stale
  // (e.g. when the parent list is reordered and index-based closures change).
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
    ],
    content: toInitialContent(initialContent),
    editorProps: {
      attributes: {
        class:
          "tiptap-content px-3.5 py-3 focus:outline-none min-h-full text-sm",
      },
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        h1: editor.isActive("heading", { level: 1 }),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        left: editor.isActive({ textAlign: "left" }),
        center: editor.isActive({ textAlign: "center" }),
        right: editor.isActive({ textAlign: "right" }),
        quote: editor.isActive("blockquote"),
        highlight: editor.isActive("highlight"),
        link: editor.isActive("link"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const previous = (editor.getAttributes("link").href as string) ?? "";
    const url = window.prompt("Dirección del enlace (URL):", previous);
    if (url === null) return; // cancelled
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "border-input bg-background rounded-md border",
          className,
        )}
        style={{ height: minHeight }}
      />
    );
  }

  return (
    <div
      className={cn(
        "border-input bg-background overflow-hidden rounded-md border",
        className,
      )}
    >
      <div className="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b p-1">
        <Btn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={state?.bold}
          label="Negrita"
        >
          <Bold className="size-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={state?.italic}
          label="Cursiva"
        >
          <Italic className="size-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={state?.underline}
          label="Subrayado"
        >
          <UnderlineIcon className="size-4" />
        </Btn>

        <Divider />

        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={state?.h1}
          label="Título 1"
        >
          <Heading1 className="size-4" />
        </Btn>
        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={state?.h2}
          label="Título 2"
        >
          <Heading2 className="size-4" />
        </Btn>
        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={state?.h3}
          label="Título 3"
        >
          <Heading3 className="size-4" />
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={state?.bullet}
          label="Lista con viñetas"
        >
          <List className="size-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={state?.ordered}
          label="Lista numerada"
        >
          <ListOrdered className="size-4" />
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={state?.left}
          label="Alinear a la izquierda"
        >
          <AlignLeft className="size-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={state?.center}
          label="Centrar"
        >
          <AlignCenter className="size-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={state?.right}
          label="Alinear a la derecha"
        >
          <AlignRight className="size-4" />
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={state?.quote}
          label="Cita / panel"
        >
          <Quote className="size-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={state?.highlight}
          label="Resaltar"
        >
          <Highlighter className="size-4" />
        </Btn>
        <Btn onClick={setLink} active={state?.link} label="Enlace">
          {state?.link ? (
            <Link2Off className="size-4" />
          ) : (
            <Link2 className="size-4" />
          )}
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!state?.canUndo}
          label="Deshacer"
        >
          <Undo2 className="size-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!state?.canRedo}
          label="Rehacer"
        >
          <Redo2 className="size-4" />
        </Btn>
      </div>

      <div
        className="resize-y overflow-auto"
        style={{ height: minHeight, minHeight: 160 }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}

function Btn({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "text-foreground/70 hover:bg-accent hover:text-accent-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/15 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="bg-border mx-0.5 h-5 w-px" aria-hidden />;
}
