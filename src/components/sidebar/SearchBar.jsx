import { useState, useRef, useCallback } from 'react';

/**
 * SearchBar — debounced search with minimum 2 chars and spinner.
 */
const SearchBar = ({ onSearch }) => {
  const [value, setValue] = useState('');
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setValue(val);

    if (val.length >= 2) {
      setSearching(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(val);
        setSearching(false);
      }, 300);
    } else {
      onSearch('');
      setSearching(false);
    }
  }, [onSearch]);

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search conversations..."
          value={value}
          onChange={handleChange}
          aria-label="Search conversations"
        />
        {searching && <div className="search-spinner" />}
      </div>
    </div>
  );
};

export default SearchBar;
