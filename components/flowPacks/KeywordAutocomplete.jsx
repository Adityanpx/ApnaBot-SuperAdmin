// components/flowPacks/KeywordAutocomplete.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const MAX_SUGGESTIONS = 8;

function getMatches(value, existingKeywords) {
  const query = (value || '').trim().toLowerCase();
  const seen = new Set();
  const matches = [];
  for (const raw of existingKeywords) {
    const trimmed = (raw || '').trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    if (query && !key.includes(query)) continue;
    seen.add(key);
    matches.push(trimmed);
    if (matches.length >= MAX_SUGGESTIONS) break;
  }
  return matches;
}

/**
 * KeywordAutocomplete — free-text "next keyword" input with a suggestion
 * dropdown drawn from the flow pack's existing rule keywords. Ported from
 * apnabot-web's KeywordAutocomplete; typing a keyword that matches nothing
 * is still allowed and is what drives the "new reply" ghost-node flow in
 * FlowMap.jsx, so it must never be forced to pick a suggestion.
 *
 * Props:
 *   value             string        — current nextKeyword value
 *   onChange          fn(string)    — called with the new value
 *   existingKeywords  string[]      — candidate keywords to suggest (already
 *                                     excludes the rule being edited)
 *   placeholder       string
 */
export default function KeywordAutocomplete({ value, onChange, existingKeywords = [], placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);

  const matches = getMatches(value, existingKeywords);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [value, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectKeyword = (keyword) => {
    onChange(keyword);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1 < matches.length ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 >= 0 ? i - 1 : matches.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < matches.length) {
        e.preventDefault();
        selectKeyword(matches[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        className="input-field"
      />
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-bg-raised border border-border rounded-lg shadow-card max-h-56 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-tertiary">
              No matching reply — this will create a new one
            </div>
          ) : (
            matches.map((keyword, i) => (
              <button
                key={keyword}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectKeyword(keyword);
                }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm truncate transition-colors duration-150',
                  i === highlightIndex
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-text-primary hover:bg-bg-subtle'
                )}
              >
                {keyword}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
