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
    if(points.length > 0) {
      textPoints = points.map(function(point,i){
        pointsDate = point.point.day;
        return (
          <g key={i} transform={"translate(0,"+i*20 + 18+")"}>
            <circle r="5" cx={0} cy={i*20} fill={point.color} stroke='black'/>
            <text is x="10" y={i*20 + 5} text-anchor="start"  font-size="15px" fill="#a9f3ff">
              {point.name + ': ' + point.point.close}
            </text>
          </g>
        );
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
                r="7" 
                cx={_self.props.x(d.date)} 
                cy={_self.props.y(d.close)} 
                fill={(_self.props.dotActive === i) ? _self.props.fillColor : "transparent"}
                stroke= {(_self.props.dotActive === i) ? "#3e474f" : "transparent" }
                strokeWidth="5px" 
                key={i}/>
      )
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
      const timeScales = data[0].data.map(function(d) { return x(d.date); });
      var bisect = bisector(function(d) { return -d; }).right;
      const i = bisect(timeScales, -mouse(overlay)[0], 1);
      const di = data[0].data[i-1];
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
      return {
        name: stock.name,
        color: colors[i],
        point: stock.data[index-1]
      };
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
    const margin = {top: 20, right: 50, bottom: 90, left: 70},
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

    let tickValues = [];
    if(data.length > 0){
      tickValues = data[0].data;
    }
    const xAxis = axisBottom()
    .scale(xScale)
    // eslint-disable-next-line
    .tickValues(tickValues.map(function(d,i){
      if(i>0) return d.date;
    }).splice(1))
    .tickFormat(timeFormat("%d-%b-%y"));

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
  render() {
    return (
      <div className="stock">
        <p>{this.props.name}</p>
        <button type="button" onClick={this.onRemoveStock}>✖</button>
      </div>
    );
  }
}

const StocksContianer = props => {
  const stocks = props.data.map(function(stock,i){
    return <Stock name={stock.name} key={i}/>
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

  componentDidMount(){
    axios.get('https://www.quandl.com/api/v3/datasets/WIKI/MMM.json?column_index=4&&start_date=2016-01-01&&collapse=monthly&api_key=zNqQuMVnabe3ZQEakpZ3')
      .then(res => {
        const name = res.data.dataset.name.substr(0,res.data.dataset.name.indexOf(')')+1);
        const data = res.data.dataset.data.map(row => { 
          return {
            day: row[0],
            close: row[1]
          };
        });
        this.setState({
          data: [
            {
              name:name,
              data:data
            }
          ]
        });
      })
      .catch(error => {
        console.log('Error fetching or parsing data', error);
      })
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
        <Header />
        <div className="App-main-content">
          <ChartContainer data={this.state.data} zoomLength={this.state.zoomLength} onZoomClick={this.onZoomClick}/>
          <StocksContianer data={this.state.data}/>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
