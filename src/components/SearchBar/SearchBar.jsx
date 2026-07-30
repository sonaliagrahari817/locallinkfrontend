import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiSearch, FiMapPin, FiSliders, FiArrowRight, FiClock } from 'react-icons/fi';
import { locationsList } from '../../data/dummyData';
import './SearchBar.css';

function SearchBar({
  placeholder = "Search for services, workers, plumbers...",
  value = "",
  onChange,
  onSubmit,
  suggestions = [],
  selectedLocation = "Lucknow, UP",
  onLocationChange,
  onFilterClick,
  className = ""
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter suggestions based on input value
  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return suggestions.slice(0, 6); // Show top suggestions when empty and focused
    return suggestions.filter((s) => {
      const searchable = `${s.label} ${s.category || ''} ${s.keywords || ''}`.toLowerCase();
      return searchable.includes(query);
    }).slice(0, 8);
  }, [value, suggestions]);

  const showDropdown = isFocused && filteredSuggestions.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [filteredSuggestions.length, value]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit && onSubmit(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
          handleSelectSuggestion(filteredSuggestions[activeIndex]);
        } else {
          onSubmit && onSubmit(value);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    // Update the input text
    onChange && onChange(suggestion.label);
    setIsFocused(false);
    // Navigate
    if (suggestion.onSelect) {
      suggestion.onSelect();
    } else if (onSubmit) {
      onSubmit(suggestion.label, suggestion);
    }
  };

  const handleInputChange = (e) => {
    onChange && onChange(e.target.value);
    if (!isFocused) setIsFocused(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
      handleSelectSuggestion(filteredSuggestions[activeIndex]);
    } else {
      onSubmit && onSubmit(value);
      setIsFocused(false);
    }
  };

  return (
    <div className={`search-bar-outer ${className}`} ref={wrapperRef}>
      <form className="search-bar-wrapper" onSubmit={handleFormSubmit} autoComplete="off">
        <div className="search-location-select">
          <FiMapPin className="search-pin-icon" />
          <select value={selectedLocation} onChange={(e) => onLocationChange && onLocationChange(e.target.value)}>
            {locationsList.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="search-divider"></div>

        <div className="search-input-container">
          <FiSearch className="search-icon-input" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-suggestions-list"
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          />
        </div>

        {onFilterClick && (
          <button type="button" className="search-filter-btn" onClick={onFilterClick} title="Filter Settings">
            <FiSliders />
          </button>
        )}
      </form>

      {/* ── Suggestions Dropdown ── */}
      {showDropdown && (
        <div className="search-suggestions-dropdown" role="listbox" id="search-suggestions-list" ref={listRef}>
          {value.trim() === '' && (
            <div className="suggestions-header">
              <FiClock className="suggestions-header-icon" />
              <span>Popular Services</span>
            </div>
          )}
          {value.trim() !== '' && (
            <div className="suggestions-header">
              <FiSearch className="suggestions-header-icon" />
              <span>Results for "{value}"</span>
            </div>
          )}
          {filteredSuggestions.map((s, idx) => (
            <button
              key={s.id || idx}
              id={`suggestion-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              className={`suggestion-item ${idx === activeIndex ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur
                handleSelectSuggestion(s);
              }}
            >
              <div className="suggestion-icon-col" style={s.color ? { background: s.color } : {}}>
                {s.icon || <FiSearch />}
              </div>
              <div className="suggestion-text-col">
                <span className="suggestion-label">{highlightMatch(s.label, value)}</span>
                {s.subtitle && <span className="suggestion-subtitle">{s.subtitle}</span>}
              </div>
              {s.badge && <span className="suggestion-badge">{s.badge}</span>}
              <FiArrowRight className="suggestion-arrow" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Highlight the matched portion of text */
function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="suggestion-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default SearchBar;
