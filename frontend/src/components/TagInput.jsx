import React, { useState, useRef, useEffect } from 'react';
import { getSearch } from '../service/Api';
import defaultProfilePicture from '../images/Profile.webp';

function TagInput({ tags, setTags, placeholder = 'Tag users (@userId)', isUserTagging = true }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Parse tags from string to array
  const parseTags = (tagString) => tagString.split(',').map(tag => tag.trim()).filter(Boolean);
  // Convert array back to string
  const tagsToString = (tagsArray) => tagsArray.map(tag => String(tag)).join(', ');
  // Deduplicate tags (case-insensitive)
  const dedupeTags = (tagsArray) => {
    const seen = new Set();
    return tagsArray.filter(tag => {
      const lower = String(tag).toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  };

  // Search users by username
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setShowSuggestions(false);
      return;
    }
    setIsLoading(true);
    try {
      const searchResults = await getSearch(query);
      const currentTags = parseTags(tags);
      const filtered = searchResults.filter(user => !currentTags.some(t => t.toLowerCase() === user.userId.toLowerCase()));
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } catch (e) {
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Add userId tag
  const addUserTag = (user) => {
    const userTag = user.userId;
    const currentTags = parseTags(tags);
    if (!currentTags.some(tag => tag.toLowerCase() === userTag.toLowerCase())) {
      const newTags = dedupeTags([...currentTags, userTag]);
      setTags(tagsToString(newTags));
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    const currentTags = parseTags(tags);
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setTags(tagsToString(dedupeTags(newTags)));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length > 0 && isUserTagging) {
      searchUsers(value);
    } else {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        addUserTag(filteredSuggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Prevent manual tag entry
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  // Click outside closes suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label className="font-medium text-gray-700 mb-2 block">Tags</label>
      {/* Tag list display: show only @userId for each tag */}
      <div className="flex flex-wrap gap-2 mt-2">
        {parseTags(tags).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
          >
            @{tag}
            <button
              type="button"
              className="ml-2 text-purple-400 hover:text-purple-700 focus:outline-none"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          placeholder='Tag users (userId)'
        />
        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500 text-center">Searching...</div>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.userId}
                  type="button"
                  className={`w-full text-left px-3 py-2 focus:outline-none flex items-center gap-2 ${
                    index === selectedIndex 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'hover:bg-gray-100 focus:bg-gray-100'
                  }`}
                  onClick={() => addUserTag(suggestion)}
                >
                  <img
                    src={suggestion.profilePicture || "https://via.placeholder.com/24"}
                    alt={suggestion.username}
                    className="w-6 h-6 rounded-full"
                    onError={e => e.target.src = defaultProfilePicture}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">@{suggestion.username}</span>
                    <span className="text-xs text-gray-500">{suggestion.userId}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">No users found</div>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Type to search and tag users. Use ↑↓ arrows to navigate, Enter to select, or click to tag.
      </p>
    </div>
  );
}

export default TagInput; 