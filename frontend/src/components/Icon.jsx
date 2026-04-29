import React from 'react';

const PATHS = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
  book:      <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V4.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/></>,
  shield:    <><path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></>,
  layers:    <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5"/></>,
  flag:      <><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></>,
  sparkle:   <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></>,
  search:    <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
  chevron:   <><path d="M9 6l6 6-6 6"/></>,
  close:     <><path d="M6 6l12 12M6 18L18 6"/></>,
  trend:     <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h6v6"/></>,
  download:  <><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>,
  bot:       <><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 4v3"/><circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/></>,
  arrowUp:   <><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></>,
  arrowDown: <><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></>,
  cite:      <><path d="M7 7h4v4H7zM7 13h4v4H7zM13 7h4v4h-4zM13 13h4v4h-4z"/></>,
  plus:      <><path d="M12 5v14M5 12h14"/></>,
  edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:     <><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></>,
  dot:       <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>,
  check:     <><path d="M20 6L9 17l-5-5"/></>,
  user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></>,
  sliders:   <><path d="M4 6h12M4 12h6M4 18h10"/><circle cx="18" cy="6" r="2"/><circle cx="13" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></>,
};

export default function Icon({ name, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      {PATHS[name] || null}
    </svg>
  );
}
