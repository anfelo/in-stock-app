import React, { Component } from 'react';
import logo from '../assets/img/logo.svg';
import '../assets/styles/App.css';

import { line } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { scaleTime } from 'd3-scale';
import { timeFormat, timeParse } from 'd3-time-format';
import { extent, max } from 'd3-array';
import { select } from 'd3-selection';

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
  constructor(props){
     super(props)
     this.createBarChart = this.createBarChart.bind(this)
  };

  componentDidMount = () => {
     this.createBarChart()
  };

  componentDidUpdate = () => {
     this.createBarChart()
  };

  createBarChart = () => {
    // const margin = {top: 20, right: 50, bottom: 20, left: 50},
    //       width = this.props.size[0] - (margin.left + margin.right),
    //       height = this.props.size[1] - (margin.top + margin.bottom);

    // const node = this.node;
    // const parseDate = timeFormat("%m-%d-%Y");

    // const data = this.props.data;
    // data.forEach(function (d) {
    //   d.date = parseDate(d.day);
    // });

    // const dataMax = max(data, function(d){
    //   return d.count;
    // });

    // const yScale = scaleLinear()
    //   .domain([0, dataMax])
    //   .range([height, 0]);

    // const xScale = scaleTime()
    //   .domain(extent(data, function(d){
    //     return d.date;
    //   }))
    //   .rangeRound([0, width]);

    // var stockLine = line(data)
    //     .x(function (d) {
    //         return xScale(d.date);
    //     })
    //     .y(function (d) {
    //         return yScale(d.count);
    //     });
  };

  render() {
    const margin = {top: 20, right: 50, bottom: 20, left: 50},
    width = this.props.size[0] - (margin.left + margin.right),
    height = this.props.size[1] - (margin.top + margin.bottom);

    const node = this.node;
    const parseDate = timeParse("%m-%d-%Y");

    const data = this.props.data;
    data.forEach(function (d) {
    d.date = parseDate(d.day);
    });

    const dataMax = max(data, function(d){
    return d.count;
    });

    const yScale = scaleLinear()
    .domain([0, dataMax])
    .range([height, 0]);

    const xScale = scaleTime()
    .domain(extent(data, function(d){
      return d.date;
    }))
    .rangeRound([0, width]);

    var stockLine = line()
    .x(function (d) {
        return xScale(d.date);
    })
    .y(function (d) {
        return yScale(d.count);
    });

    return (
      <svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]}> 
        <path className="line shadow" d={stockLine(data)} strokeLinecap="round"/>
      </svg>
    );
  }
}

class ChartContainer extends Component {
  render() {
    return (
      <div className="chart-container">
        <Chart data={this.props.data} size={[800,500]}/>
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

  state = {
		data: [
      {day:'02-11-2016',count:180},
      {day:'02-12-2016',count:250},
      {day:'02-13-2016',count:150},
      {day:'02-14-2016',count:496},
      {day:'02-15-2016',count:140},
      {day:'02-16-2016',count:380},
      {day:'02-17-2016',count:100},
      {day:'02-18-2016',count:150}
    ]
	};


  render() {
    return (
      <div className="App">
        <Header />
        <div className="App-main-content">
          <ChartContainer data={this.state.data}/>
          <StocksContianer />
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
