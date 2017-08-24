import React, { Component } from 'react';
import axios from 'axios';
import '../assets/styles/App.css';

// Import Components
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
import AddStockDisplay from '../components/AddStockDisplay';
import Footer from '../components/Footer';
import ChartContainer from '../components/ChartContainer';
import StocksContianer from '../components/StockContainer';

class App extends Component {

  constructor() {
    super()
    this.state = {
      data: [],
    }
  }

  onRemoveStock = index => {
    const data = [
      ...this.state.data.slice(0, index),
      ...this.state.data.slice(index + 1),
    ];

    this.setState({
      data: data,
    });
  }

  onAddStock = name => {
    this.fetchData(name);
  }

  fetchData = name => {
    axios.get(`https://www.quandl.com/api/v3/datasets/WIKI/${name}.json?column_index=4&&start_date=2016-01-01&&collapse=daily&api_key=zNqQuMVnabe3ZQEakpZ3`)
    .then(res => {
      let codes = [];
      this.state.data.forEach(function(stock){
        codes.push(stock.code);
      });
      const code = res.data.dataset.dataset_code;
      const name = res.data.dataset.name.substr(0,res.data.dataset.name.indexOf(')')+1);
      if (codes.indexOf(code) !== -1) return this.onErrorMessage( name + " It's already being displayed");
      if(res.data.dataset.data.length === 0) return this.onErrorMessage("Oops! Data not available for: " + name);
      const data = res.data.dataset.data.map(row => { 
        return {
          day: row[0],
          close: row[1]
        };
      });
      this.setState({
        data: [
          ...this.state.data,
          {
            code:code,
            name:name,
            data:data
          }
        ]
      });
    })
    .catch(error => {
      console.log('Error fetching or parsing data', error);
      this.onErrorMessage(name + " Is not on US Stock Exchange.");
    })
  }
  
  onErrorMessage = message => {
    this.setState({
      error: message
    });

    setTimeout(this.onClearError,5000);
  }

  onClearError = () => {
    this.setState({
      error: ""
    });
  }

  onZoomClick = (zoomValue) => {
    if(zoomValue !== this.state.zoomLength){
      this.setState({
        zoomLength: +zoomValue
      });
    }
  };

  render() {
    return (
      <div className="App">
        <Header onAddStock={this.onAddStock}/>
        <div className="App-main-content">
          {
            (this.state.error)
            ? <ErrorMessage message={this.state.error}/>
            : ""
          }
          {
            (this.state.data.length > 0)
            ? <ChartContainer data={this.state.data} zoomLength={this.state.zoomLength} onZoomClick={this.onZoomClick}/> 
            : <AddStockDisplay />
          }
          <StocksContianer data={this.state.data} onRemoveStock={this.onRemoveStock}/>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
