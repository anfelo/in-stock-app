import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from '../assets/img/logo.svg';
import '../assets/styles/App.css';

import { line } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import { extent, max } from 'd3-array';
import { select } from 'd3-selection';
import { axisLeft, axisBottom } from 'd3-axis';

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

class Axis extends Component {
  componentDidMount (){
    this.renderAxis();
  }

  componentDidUpdate () {
    this.renderAxis();
  }

  renderAxis () {
    const node = ReactDOM.findDOMNode(this);
    select(node).call(this.props.axis);
  }

  render () {
    const translate = "translate(0,"+(this.props.height)+")";
    return (
        <g className="axis" transform={this.props.axisType==='x'?translate:""} >
        </g>
    );
  }
}

class Grid extends Component {
  componentDidMount (){
    this.renderGrid();
  }

  componentDidUpdate () {
    this.renderGrid();
  }

  renderGrid () {
    const node = ReactDOM.findDOMNode(this);
    select(node).call(this.props.grid);
  }

  render () {
    var translate = "translate(0,"+(this.props.height)+")";
    return (
        <g className="y-grid" transform={this.props.gridType==='x'?translate:""}>
        </g>
    );
  }
}

class Chart extends Component {
  render() {
    const colors = ['#7dc7f4','#c25975','#53bbb4','#f9845b','#51b46d'];
    const margin = {top: 40, right: 50, bottom: 60, left: 70},
    width = this.props.size[0] - (margin.left + margin.right),
    height = this.props.size[1] - (margin.top + margin.bottom);

    const parseDate = timeParse("%m-%d-%Y");

    const data = this.props.data;
    data.forEach(function (stock) {
      stock.data.forEach(function (d){
        d.date = parseDate(d.day);
      });
    });

    let allValues = [];
    data.forEach(function (stock) {
      allValues = allValues.concat(stock.data);
    });

    const dataMax = max(allValues, function(d){
      return d.count + 100;
    });

    const yScale = scaleLinear()
    .domain([0, dataMax])
    .range([height, 0]);

    const xScale = scaleTime()
    .domain(extent(data[0].data, function(d){
      return d.date;
    }))
    .rangeRound([0, width]);

    const yAxis = axisLeft()
    .scale(yScale)
    .ticks(5);

    const xAxis = axisBottom()
    .scale(xScale)
    // eslint-disable-next-line
    .tickValues(data[0].data.map(function(d,i){
      if(i>0) return d.date;
    }).splice(1))
    .ticks(4);

    const yGrid = axisLeft()
    .scale(yScale)
    .ticks(5)
    .tickSize(-width, 0, 0)
    .tickFormat("");

    const stockLine = line()
    .x(function (d) {
        return xScale(d.date);
    })
    .y(function (d) {
        return yScale(d.count);
    });

    const transform ='translate(' + margin.left + ',' + margin.top + ')';

    const lines = data.map(function(stock, index){
      return <path key={index + 1} className="line shadow" stroke={colors[index]} d={stockLine(stock.data)} strokeLinecap="round"/>
    });

    return (
      <svg width={this.props.size[0]} height={this.props.size[1]}> 
        <g transform={transform}>
          <Grid height={height} grid={yGrid} gridType="y"/>
          <Axis height={height} axis={yAxis} axisType="y"/>
          <Axis height={height} axis={xAxis} axisType="x"/>
          { lines }
        </g>
      </svg>
    );
  }
}

class ChartContainer extends Component {
  render() {
    return (
      <div className="chart-container">
        <Chart data={this.props.data} size={[1100,500]}/>
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
      {
        name:'test1',
        data:[
          {day:'02-11-2016',count:180},
          {day:'02-12-2016',count:250},
          {day:'02-13-2016',count:150},
          {day:'02-14-2016',count:496},
          {day:'02-15-2016',count:140},
          {day:'02-16-2016',count:380},
          {day:'02-17-2016',count:100},
          {day:'02-18-2016',count:150}
        ]
      },
      {
        name:'test2',
        data:[
          {day:'02-11-2016',count:60},
          {day:'02-12-2016',count:110},
          {day:'02-13-2016',count:80},
          {day:'02-14-2016',count:89},
          {day:'02-15-2016',count:50},
          {day:'02-16-2016',count:10},
          {day:'02-17-2016',count:50},
          {day:'02-18-2016',count:70}
        ]
      },
      {
        name:'test3',
        data:[
          {day:'02-11-2016',count:400},
          {day:'02-12-2016',count:550},
          {day:'02-13-2016',count:500},
          {day:'02-14-2016',count:300},
          {day:'02-15-2016',count:380},
          {day:'02-16-2016',count:400},
          {day:'02-17-2016',count:460},
          {day:'02-18-2016',count:300}
        ]
      },
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
