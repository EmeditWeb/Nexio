/**
 * SearchBar — search conversations and users.
 */
const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <span>🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search or start new chat"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {value && (
          <span
            style={{ cursor: 'pointer', fontSize: '14px' }}
            onClick={() => onChange('')}
          >
            ✕
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
