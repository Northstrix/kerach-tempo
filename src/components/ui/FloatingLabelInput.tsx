
"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface FloatingLabelInputProps {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  textarea?: boolean;
  isRTL?: boolean;
  accentColor?: string;
  textareaHeight?: string;
  parentBackground?: string; // Used as label background and input background
  inputOutlineColor?: string;
  inputFocusOutlineColor?: string; // Active/focused outline color
  outlineWidth?: string;
  foregroundColor?: string;
  mutedForegroundColor?: string;
  rounding?: string;
  inputPadding?: string;
  inputFontSize?: string;
  labelFontSize?: string;
  labelActiveFontSize?: string;
  labelPadding?: string;
  labelActivePadding?: string;
  inputHeight?: string;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
  inputClassName?: string;
  isComboboxFocused?: boolean;
}

function detectRTL(text: string): boolean {
  return /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text);
}

function detectLabelDir(text: string): "rtl" | "ltr" {
  return detectRTL(text) ? "rtl" : "ltr";
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onValueChange,
  type = "text",
  autoComplete = "off",
  required = false,
  disabled = false,
  textarea = false,
  isRTL,
  accentColor = "hsl(var(--primary))",
  textareaHeight = "152px",
  parentBackground = "hsl(var(--card))",
  inputOutlineColor = "hsl(var(--border))",
  inputFocusOutlineColor = "hsl(var(--foreground))",
  outlineWidth = "1.5px",
  foregroundColor = "hsl(var(--foreground))",
  mutedForegroundColor = "hsl(var(--muted-foreground))",
  rounding = "var(--radius)",
  inputPadding = "17px",
  inputFontSize = "0.875rem",
  labelFontSize = "0.875rem",
  labelActiveFontSize = "0.75rem",
  labelPadding = "0 7px",
  labelActivePadding = "0 6px",
  inputHeight = "40px",
  min,
  max,
  step,
  readOnly,
  inputClassName,
  isComboboxFocused,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [rtlInput, setRtlInput] = useState(isRTL ?? false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) setRtlInput(isRTL ?? false);
    else setRtlInput(detectRTL(value));
  }, [value, isRTL]);

  useEffect(() => {
    if (!value) setRtlInput(isRTL ?? false);
  }, [label, isRTL, value]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onValueChange(e.target.value);
    },
    [onValueChange]
  );
  
  const handleStep = (direction: 'up' | 'down') => {
    if(type !== 'number') return;
    const currentValue = parseFloat(value);
    if(isNaN(currentValue)) return;
    const stepAmount = step ?? 0.01;

    let newValue = direction === 'up' ? currentValue + stepAmount : currentValue - stepAmount;
    if(min !== undefined) newValue = Math.max(min, newValue);
    if(max !== undefined) newValue = Math.min(max, newValue);
    
    // Format to avoid floating point inaccuracies
    const precision = stepAmount.toString().split('.')[1]?.length || 2;
    onValueChange(newValue.toFixed(precision));
  }


  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const hasValue = value && value.length > 0;
  const labelDir = detectLabelDir(label);
  const effectiveFocused = focused || isComboboxFocused;

  const style: React.CSSProperties = {
    "--accent-color": accentColor,
    "--mobile-form-input-bg": "hsl(var(--background))",
    "--input-outline": inputOutlineColor,
    "--input-outline-focus": inputFocusOutlineColor,
    "--input-outline-width": outlineWidth,
    "--foreground": foregroundColor,
    "--muted-foreground": mutedForegroundColor,
    "--parent-background": parentBackground,
    "--general-rounding": rounding,
    "--floating-input-layout-text-area-height": textareaHeight,
    "--input-padding": inputPadding,
    "--input-font-size": inputFontSize,
    "--label-font-size": labelFontSize,
    "--label-active-font-size": labelActiveFontSize,
    "--label-padding": labelPadding,
    "--label-active-padding": labelActivePadding,
    "--input-height": inputHeight,
  } as React.CSSProperties;

  return (
    <div
      className={[
        "mobile-form-group",
        rtlInput ? "rtl" : "",
        effectiveFocused ? "active" : "",
        hasValue ? "has-value" : "",
        textarea ? "textarea" : "",
      ].join(" ")}
      style={style}
    >
      {textarea ? (
        <textarea
          className="mobile-form-input"
          required={required}
          value={value}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          dir={rtlInput ? "rtl" : "ltr"}
          spellCheck={false}
          readOnly={readOnly}
          {...props}
        />
      ) : (
        <div className="relative w-full">
            <input
              ref={inputRef}
              className={`mobile-form-input ${inputClassName || ''}`}
              type={type}
              required={required}
              value={value}
              onChange={handleInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete={autoComplete}
              disabled={disabled}
              dir={rtlInput ? "rtl" : "ltr"}
              spellCheck={false}
              readOnly={readOnly}
              {...props}
            />
             {type === 'number' && !readOnly && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 h-full flex flex-col justify-center items-center">
                    <button type="button" onClick={() => handleStep('up')} className="h-1/2 w-5 flex justify-center items-center text-muted-foreground hover:text-foreground" tabIndex={-1}><ChevronUp size={14}/></button>
                    <button type="button" onClick={() => handleStep('down')} className="h-1/2 w-5 flex justify-center items-center text-muted-foreground hover:text-foreground" tabIndex={-1}><ChevronDown size={14}/></button>
                </div>
            )}
        </div>
      )}
      <label
        className={"mobile-form-label" + (textarea ? " label-textarea" : "")}
        dir={labelDir}
      >
        {label}
      </label>
      <style jsx>{`
        .mobile-form-group {
          position: relative;
          width: 100%;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .mobile-form-input {
          width: 100%;
          height: var(--input-height);
          padding: var(--input-padding);
          font-size: var(--input-font-size);
          font-weight: 400;
          color: var(--foreground);
          background: var(--mobile-form-input-bg);
          border: var(--input-outline-width) solid var(--input-outline);
          border-radius: var(--general-rounding);
          outline: none;
          box-sizing: border-box;
          text-align: left;
          transition: border-color 0.3s, color 0.3s, background 0.3s;
          resize: none;
          line-height: 1.4;
        }
        input[type="number"] {
            padding-right: 2rem; /* Make space for buttons */
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield; /* Firefox */
        }

        .mobile-form-input:focus {
          border-color: var(--input-outline-focus);
        }
        .mobile-form-input:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .mobile-form-group.rtl .mobile-form-input {
          direction: rtl;
          text-align: right;
        }
        .mobile-form-group.textarea .mobile-form-input {
          height: var(--floating-input-layout-text-area-height);
          overflow-y: auto;
        }
        .mobile-form-label {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
          font-size: var(--label-font-size);
          font-weight: 400;
          pointer-events: none;
          background: var(--parent-background);
          padding: var(--label-padding);
          transition: color 0.3s, background 0.3s, font-size 0.3s, top 0.3s,
            left 0.3s, right 0.3s, transform 0.3s;
          z-index: 2;
          max-width: calc(100% - 26px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-radius: var(--radius);
        }
        .mobile-form-group.rtl .mobile-form-label {
          right: 12px;
          left: auto;
          text-align: right;
        }
        .mobile-form-group.active .mobile-form-label,
        .mobile-form-group.has-value .mobile-form-label,
        .mobile-form-group .mobile-form-input:focus + .mobile-form-label {
          top: 0;
          transform: translateY(-50%);
          left: 12px;
          right: auto;
          font-size: var(--label-active-font-size);
          background: var(--parent-background);
          padding: var(--label-active-padding);
          z-index: 2;
          border-radius: var(--radius);
        }
        .mobile-form-group.active .mobile-form-label {
           color: var(--accent-color);
        }
        .mobile-form-group.has-value:not(.active) .mobile-form-label {
            color: var(--muted-foreground);
        }
        .mobile-form-group.rtl.active .mobile-form-label,
        .mobile-form-group.rtl .mobile-form-input:focus + .mobile-form-label {
          right: 12px;
          left: auto;
        }
        .mobile-form-group.rtl.has-value:not(.active) .mobile-form-label {
          right: 12px;
          left: auto;
        }
        .mobile-form-group.textarea .mobile-form-label {
          left: 12px;
          right: auto;
          padding: var(--label-padding);
        }
        .mobile-form-group.textarea.rtl .mobile-form-label {
          right: 12px;
          left: auto;
        }
        .mobile-form-group.textarea:not(.active):not(.has-value)
          .mobile-form-label {
          top: 12px;
          left: 12px;
          right: auto;
          transform: none;
          font-size: var(--label-font-size);
          color: var(--muted-foreground);
          background: var(--parent-background);
          padding: var(--label-padding);
          text-align: left;
          
        }
        .mobile-form-group.textarea:not(.active):not(.has-value).rtl
          .mobile-form-label {
          right: 12px;
          left: auto;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default FloatingLabelInput;

    