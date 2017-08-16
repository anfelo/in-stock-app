import React, { Component } from 'react';
import logo from '../assets/img/logo.svg';
import '../assets/styles/App.css';

class SearchForm extends Component {

  constructor() {
    super();
    this.state = {
      name: "",
    };
  };

  addStock = e => {

  };

  onNameChange = e => {
		this.setState({name: e.target.value});
	};

  render() {
    return (
      <div className="search-form-wrapper">
        <form className="search-form" onSubmit={this.addStock} >
          <input className="name-input" type="text" placeholder="Stock Name" value={this.state.name} onChange={this.onNameChange} required/>
          <button type="submit" id="submit" className="search-button">Add</button>
        </form>
      </div>
    );
  }
}

const Header = props => {
  return (
    <div className="App-header">
      <div className="App-logo-wrapper">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Welcome to React</h2>
      </div>
      <SearchForm />
    </div>
  );
}

const Footer = () => {
  return (
    <div className="footer">
      <p>2017 &copy; anfelo - <i className="fa fa-github-alt"></i></p>
    </div>
  );
}

class Chart extends Component {

}

class ChartContainer extends Component {
  render() {
    return (
      <div className="chart-container">
        <Chart />
      </div>
    );
  }
}

class Stock extends Component {
  render() {
    return (
      <div className="stock">
        <p>Here goes one stock</p>
      </div>
    );
  }
}

const StocksContianer = props => {
  return (
    <div className="stocks-container">
      <Stock />
      <Stock />
      <Stock />
    </div>
  );
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <div className="App-main-content">
          <ChartContainer />
          <StocksContianer />
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
