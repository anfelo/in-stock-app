import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import logo from '../assets/img/logo.svg';
import '../assets/styles/App.css';

import { line } from 'd3-shape';
import { scaleLinear, scaleTime } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { max, min, bisector } from 'd3-array';
import { select, mouse } from 'd3-selection';
import { axisLeft, axisBottom } from 'd3-axis';

const colors = ['#7dc7f4','#c25975','#53bbb4','#f9845b','#51b46d'];

class SearchForm extends Component {

  constructor() {
    super();
    this.state = {
      name: "",
    };
  };

  onAddStock = e => {
    e.preventDefault();
    this.props.onAddStock(this.state.name);
    this.setState({name:""});
  };

  onNameChange = e => {
		this.setState({name: e.target.value});
	};

  render() {
    return (
      <div className="search-form-wrapper">
        <form className="search-form" onSubmit={this.onAddStock} >
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
      <SearchForm onAddStock={props.onAddStock}/>
    </div>
  );
}

const ErrorMessage = props => {
  return (
    <div className="error-message">
      <p>{props.message}</p>
    </div>
  );
}

const AddStockDisplay = () => {
  return (
    <div className="add-stock-message">
      <h1>Add Stocks</h1>
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
    const translate = "translate(0,"+(this.props.height + 30)+")";
    return (
        <g className={this.props.axisType==='x'?'x axis':'y axis'} transform={this.props.axisType==='x'?translate:""} >
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

class ToolTip extends Component {
  render() {
    const points = this.props.tooltip.data;
    let visibility="hidden";
    let transform="";
    let x=0;
    let y=0;
    const width=200,height=points.length * 30 + 20;
    const transformText='translate(15,15)';
    let transformArrow="";

    if(this.props.tooltip.display===true){
        var position = this.props.tooltip.pos;

        x= position.x + width/2;
        y= position.y + height;
        visibility="visible";

        if(x > width + 20){
            transform='translate(' + (x-width*3/2 - 10) + ',' + (y-height-20) + ')';
            transformArrow='translate('+(width - 21)+','+(height/2)+') rotate(-90,20,0)';
        } else if(x < width +20){
            transform='translate('+(position.x + 10)+',' + (y-height-20) + ')';
            transformArrow='translate(-20,'+(height/2)+') rotate(90,20,0)';
        }

    } else{
        visibility="hidden";
    }

    let textPoints = [];
    let pointsDate = "";
    let indexOffset = 0;
    if(points.length > 0) {
      textPoints = points.map(function(point,i){
        if(point !== null)
        {
          pointsDate = point.point.day;
          let textOffset = 0;
          if (indexOffset === 0) {
            textOffset = indexOffset * 20 + 20;
          } else {
            textOffset = 20;
          }
          indexOffset++;
          return (
            <g key={i} transform={"translate(0,"+ textOffset +")"}>
              <circle r="5" cx={0} cy={indexOffset * 20} fill={point.color} stroke='black'/>
              <text is x="10" y={indexOffset * 20 + 5} text-anchor="start"  font-size="15px" fill="#a9f3ff">
                {point.code + ': ' + point.point.close}
              </text>
            </g>
          );  
        }
        return null;  
      });
    }
    return (
        <g transform={transform}>
            <rect class="shadow" is width={width} height={height} rx="5" ry="5" visibility={visibility} fill="#6391da" opacity=".9"/>
            <polygon class="shadow" is points="10,0  30,0  20,10" transform={transformArrow}
                     fill="#6391da" opacity=".9" visibility={visibility}/>
            <g is visibility={visibility} transform={transformText}>
              <text is x={width/2-10} y="5" text-anchor="middle" font-size="15px" fill="#f9845b">{pointsDate}</text>
              {textPoints}
            </g>
        </g>
    );
  }
}

class Dots extends Component {
  render() {
    const _self=this;
    const data = this.props.data;
    const circles=data.map(function(d,i){
      return (
        <circle className="dot" 
                r="5" 
                cx={_self.props.x(d.date)} 
                cy={_self.props.y(d.close)} 
                fill={(_self.props.dotActive === i) ? _self.props.fillColor : "transparent"}
                key={i} />
      );
    });
    return(
        <g>
          {circles}
        </g>
    );
  }
}

class Overlay extends Component {

  componentDidMount() {
    var _this = this;
    select('.overlay').on("mousemove", _this.onMouseMove);
  }

  onMouseOver = (e) => {
    select('.focus').style('display', null);
  }

  onMouseOut = (e) => {
    select('.focus').style('display', 'none');
    this.props.hideToolTip();
  }

  onMouseMove = () => {
    const overlay = select('.overlay').node();
    const x = this.props.x;
    const data = this.props.data;
    if(data.length > 0){
      let maxLenIndex = 0;
      data.forEach(function(stock,index){
        if(index === 0) return;
        if(stock.data.length > data[maxLenIndex].data.length) return maxLenIndex = index;
      });
      const timeScales = data[maxLenIndex].data.map(function(d) { return x(d.date); });
      var bisect = bisector(function(d) { return -d; }).right;
      const i = bisect(timeScales, -mouse(overlay)[0], 1);
      const di = data[maxLenIndex].data[i-1];
      select('.focus').attr("transform", "translate(" + x(di.date) + ",0)");
      this.props.showToolTip(i,x(di.date),this.props.height/2);
    }
  }

  render() {
    return (
      <rect transform={this.props.transform} className="overlay" width={this.props.width} height={this.props.height} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} /> 
    );
  }
}

class Chart extends Component {
  
  state = {
    tooltip:{ display:false,data:[]},
    width:this.props.size[0],
    zoomLength: this.props.zoomLength
  };

  componentWillMount(){
    const _self = this;
    window.onresize = function(event) {
      _self.updateSize();
    };
    this.setState({width:this.props.size[0]});
  }

  componentDidMount() {
    this.updateSize();
  }
 
  updateSize = () => {
      var node = document.getElementsByClassName("chart-container");
      var parentWidth=node[0].offsetWidth;
      if(parentWidth<this.props.size[0]){
          this.setState({width:parentWidth-20});
      }else{
          this.setState({width:this.props.size[0]});
      }
  }

  showToolTip = (index,xPos,yPos) => {
    const points = this.props.data.map(function(stock,i){
      if(stock.data[index-1]){
        return {
          code: stock.code,
          color: colors[i],
          point: stock.data[index-1]
        };
      }
      return null;
    });

    this.setState({
      tooltip:{
        display:true,
        data: points,
        pos: {
          x:xPos,
          y:yPos
        },
      },
      dotIndex: index-1
    });
  }

  hideToolTip = (e) => {
    this.setState({
      tooltip:{ display:false,data:[]},
      dotIndex: null
    });
  }

  render() {
    const _self=this;
    const margin = {top: 20, right: 30, bottom: 90, left: 70},
    width = this.state.width - (margin.left + margin.right),
    height = this.props.size[1] - (margin.top + margin.bottom);

    const parseDate = timeParse("%Y-%m-%d");

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
      return d.close + 100;
    });

    const maxDate = max(allValues, function(d){
      return d.date;
    });

    const minDate = min(allValues, function(d){
      return d.date;
    });

    const yScale = scaleLinear()
    .domain([0, dataMax])
    .range([height, 0]);

    const xScale = scaleTime()
    .domain([minDate, maxDate])
    .rangeRound([0, width]);

    const yAxis = axisLeft()
    .scale(yScale)
    .ticks(5);

    // let tickValues = [];
    // if(data.length > 0){
    //   tickValues = data[0].data;
    // }
    const xAxis = axisBottom()
    .scale(xScale)
    // eslint-disable-next-line
    // .tickValues(tickValues.map(function(d,i){
    //   if(i>0) return d.date;
    // }).splice(1))
    .tickFormat(timeFormat("%b-%y"))
    .ticks(12);

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
        return yScale(d.close);
    });

    const transform ='translate(' + margin.left + ',' + margin.top + ')';
    const lines = data.map(function(stock, index){
      return (
        <g key={index}>
          <path className="line shadow" stroke={colors[index]} d={stockLine(stock.data)} strokeLinecap="round"/>
          <Dots data={stock.data} x={xScale} y={yScale} parentIndex={index} fillColor={colors[index]} dotActive={_self.state.dotIndex}/>
        </g>
      );
    });

    return (
      <svg width={this.state.width} height={this.props.size[1]} > 
        <g transform={transform}>
          <Grid height={height} grid={yGrid} gridType="y"/>
          <Axis height={height} axis={yAxis} axisType="y"/>
          <Axis height={height} axis={xAxis} axisType="x"/>
          { lines }
          <ToolTip tooltip={this.state.tooltip}/>
          <g className="focus" style={{display:'none'}}>
            <line className="hover-line" y1="0" y2={height} stroke={'white'} strokeWidth={'2px'} />
          </g>
        </g>
        <Overlay transform={transform} width={width} height={height} data={data} x={xScale} showToolTip={_self.showToolTip} hideToolTip={_self.hideToolTip}/>
      </svg>
    );
  }
}

class ZoomOptions extends Component {

  onClick = (e) => {
    const zoomIndex = e.target.dataset.id;
    this.props.onZoomClick(zoomIndex);
  }

  render() {
    return (
      <div className="zoom-options">
        <button type="button" onClick={this.onClick} data-id={1}>1m</button>
        <button type="button" onClick={this.onClick} data-id={2}>3m</button>
        <button type="button" onClick={this.onClick} data-id={3}>6m</button>
        <button type="button" onClick={this.onClick} data-id={4}>All</button>
      </div>
    );
  }
}

class ChartContainer extends Component {
  render() {
    return (
      <div className="chart-container">
        <ZoomOptions onZoomClick={this.props.onZoomClick}/>
        <Chart data={this.props.data} size={[1200,500]} zoomLength={this.props.zoomLength}/>
      </div>
    );
  }
}

class Stock extends Component {

  onRemoveStock = (e) => {
    const index = e.target.dataset.index;
    this.props.onRemoveStock(index);
  }

  render() {
    return (
      <div className="stock" >
        <div className="tongue" style={{"backgroundColor":colors[this.props.index]}}></div>
        <div className="info">
          <h3>{this.props.code}</h3>
          <p>{this.props.name}</p>
        </div>
        <button type="button" onClick={this.onRemoveStock} data-index={this.props.index}>✖</button>
      </div>
    );
  }
}

const StocksContianer = props => {
  const stocks = props.data.map(function(stock,i){
    return <Stock name={stock.name} code={stock.code} key={i} index={i} onRemoveStock={props.onRemoveStock}/>
  });
  return (
    <div className="stocks-container">
      {stocks}
    </div>
  );
}

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
