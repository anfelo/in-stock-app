import React from 'react';
import SearchForm from './SearchForm';
import logo from '../assets/img/logo.svg';

const Header = props => {
  return (
    <div className="App-header">
      <div className="App-logo-wrapper">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Welcome to React</h2>
      </div>
      <SearchForm onAddStock={props.onAddStock}/>
    </div>
  );
}

export default Header;