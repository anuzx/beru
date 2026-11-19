import { ArrowUp, Mic } from "lucide-react"
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { cn } from "@/lib/utils"

export interface AiPromptBarProps {
  /** Controlled value. Leave undefined to let the component manage its own state. */
  value?: string
  /** Initial value when used uncontrolled. */
  defaultValue?: string
  /** Fires on every keystroke. */
  onValueChange?: (value: string) => void
  /** Fires with the trimmed prompt on Enter or when the send button is pressed. */
  onSubmit?: (value: string) => void
  /** Fires when Escape is pressed (after the input is cleared). */
  onEscape?: () => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  maxLength?: number
  /** Minimum visible rows before the textarea starts growing. */
  minRows?: number
  /** Rows after which the textarea scrolls instead of growing. */
  maxRows?: number
  /** Accessible label for the textarea. */
  label?: string
  /** Accessible label for the submit button. */
  submitLabel?: string
  /** Fires when the microphone button is pressed. */
  onVoiceInput?: () => void
  /** Accessible label for the microphone button. */
  voiceLabel?: string
  /** Set to false to hide the microphone button. */
  showVoiceButton?: boolean
  /** Highlights the microphone button while listening. */
  isListening?: boolean
  /** Slot rendered to the left of the textarea (e.g. an attach button). */
  leading?: ReactNode
  /** Slot rendered before the submit button. */
  trailing?: ReactNode
  autoFocus?: boolean
  className?: string
  textareaClassName?: string
}

const LINE_HEIGHT = 24

export function AiPromptBar({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onEscape,
  placeholder = "Ask anything…",
  disabled = false,
  isLoading = false,
  maxLength,
  minRows = 1,
  maxRows = 8,
  label = "Prompt",
  submitLabel = "Send message",
  onVoiceInput,
  voiceLabel = "Start voice input",
  showVoiceButton = true,
  isListening = false,
  leading,
  trailing,
  autoFocus = false,
  className,
  textareaClassName,
}: AiPromptBarProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = isControlled ? value : internalValue
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSubmit = !disabled && !isLoading && currentValue.trim().length > 0

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  // Grow with the content, up to maxRows.
  useEffect(() => {
    const element = textareaRef.current
    if (!element) return

    element.style.height = "auto"
    const maxHeight = maxRows * LINE_HEIGHT
    const minHeight = minRows * LINE_HEIGHT
    element.style.height = `${Math.min(Math.max(element.scrollHeight, minHeight), maxHeight)}px`
  }, [currentValue, minRows, maxRows])

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  const submit = useCallback(() => {
    const prompt = currentValue.trim()
    if (!prompt || disabled || isLoading) return

    onSubmit?.(prompt)
    if (!isControlled) setInternalValue("")
  }, [currentValue, disabled, isLoading, isControlled, onSubmit])

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      if (currentValue.length > 0) setValue("")
      onEscape?.()
    }
  }

  return (
    <form
      role="form"
      aria-label={label}
      aria-busy={isLoading}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border p-3 shadow-sm transition-colors",
        "border-neutral-300 bg-[rgb(31,31,31)] text-neutral-900",
        "dark:border-neutral-700 dark:bg-[rgb(31,31,31)] dark:text-neutral-100",
        "focus-within:border-neutral-400 dark:focus-within:border-neutral-500",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <label className="sr-only" htmlFor="ai-prompt-bar-input">
        {label}
      </label>
      <textarea
        id="ai-prompt-bar-input"
        ref={textareaRef}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={minRows}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "w-full flex-1 resize-none bg-transparent p-0 text-base leading-6 outline-none",
          "text-neutral-900 placeholder:text-[rgb(143,143,143)] dark:text-neutral-100 dark:placeholder:text-[rgb(143,143,143)]",
          "disabled:cursor-not-allowed",
          textareaClassName,
        )}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">{leading}</div>

        <div className="flex items-center gap-1">
          {trailing}

          {showVoiceButton && (
            <button
              type="button"
              onClick={onVoiceInput}
              aria-label={voiceLabel}
              aria-pressed={isListening}
              disabled={disabled}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
                "dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
                "disabled:pointer-events-none disabled:opacity-40",
                isListening && "bg-red-500/10 text-red-500 dark:bg-red-500/15 dark:text-red-400",
              )}
            >
              <Mic className="size-4" aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            aria-label={submitLabel}
            aria-disabled={!canSubmit}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              "bg-neutral-900 text-white hover:bg-neutral-800",
              "dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {isLoading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            ) : (
              <ArrowUp className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default AiPromptBar