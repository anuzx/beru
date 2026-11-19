import { CodeDiff, ThemeScope, getGlobalCss, getThemeCss } from "@lobehub/ui"
import { useEffect } from "react"

const LOBE_STYLE_ID = "lobe-ui-theme"

/**
 * @lobehub/ui ships its design tokens as a stylesheet that isn't imported by
 * the entry point, so we inject it once (tokens + global layer) on demand.
 */
function ensureLobeStyles() {
  if (typeof document === "undefined") return
  if (document.getElementById(LOBE_STYLE_ID)) return

  const style = document.createElement("style")
  style.id = LOBE_STYLE_ID
  style.textContent = `${getThemeCss()}\n\n${getGlobalCss()}`
  document.head.append(style)
}

export interface CodeDiffPreviewProps {
  fileName: string
  language: string
  oldContent: string
  newContent: string
  className?: string
}

/** Renders a side-by-side code diff for the change Beru is about to apply. */
export function CodeDiffPreview({
  fileName,
  language,
  oldContent,
  newContent,
  className,
}: CodeDiffPreviewProps) {
  useEffect(ensureLobeStyles, [])

  return (
    <ThemeScope appearance="dark" className={className}>
      <CodeDiff
        fileName={fileName}
        language={language}
        oldContent={oldContent}
        newContent={newContent}
        viewMode="split"
        variant="outlined"
        defaultExpand
      />
    </ThemeScope>
  )
}

export default CodeDiffPreview