// components/SearchBar.js
import React from "react";
import "./SearchBar.scss";
import search from "../../assets/svg/search.svg";
const SearchBar = ({ placeholder, onSearch }: any) => {
  const handleSearchChange = (event: any) => {
    onSearch(event.target.value);
  };

  return (
    <div className="search-bar">
      <img src={search} alt="searchIcon" />
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default SearchBar;
