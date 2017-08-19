import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from '../assets/img/logo.svg';
import '../assets/styles/App.css';

import { line } from 'd3-shape';
import { scaleLinear, scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import { extent, max, bisect } from 'd3-array';
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

class ToolTip extends Component {
  render() {
    const points = this.props.tooltip.data;
    let visibility="hidden";
    let transform="";
    let x=0;
    let y=0;
    const width=150,height=points.length * 25;
    const transformText='translate(15,15)';
    let transformArrow="";

    if(this.props.tooltip.display===true){
        var position = this.props.tooltip.pos;

        x= position.x + width/2;
        y= position.y + height;
        visibility="visible";

        if(x>width){
            transform='translate(' + (x-width*3/2 - 10) + ',' + (y-height-20) + ')';
            transformArrow='translate('+(width - 20)+','+(height/2)+') rotate(-90,20,0)';
        }else if(x<width){
            transform='translate(10,' + (y-height-20) + ')';
            transformArrow='translate(-20,'+(height/2)+') rotate(90,20,0)';
        }

    }else{
        visibility="hidden";
    }
    let textPoints = [];
    if(points.length > 0) {
      textPoints = points.map(function(point,i){
        return (
          <g key={i}>
            <circle r="5" cx={0} cy={i*20} fill={point.color} stroke='black'/>
            <text is x="10" y={i*20 + 5} text-anchor="start"  font-size="15px" fill="#a9f3ff">
              {point.name + ': ' + point.point.count}
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
    //.slice(1)
    // data.pop();
    const circles=data.map(function(d,i){
      return (
        <circle className="dot" 
                r="7" 
                cx={_self.props.x(d.date)} 
                cy={_self.props.y(d.count)} 
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
    const timeScales = data[0].data.map(function(d) { return x(d.date); });
    const i = bisect(timeScales, mouse(overlay)[0], 1);
    const di = data[0].data[i-1];
    select('.focus').attr("transform", "translate(" + x(di.date) + ",0)");

    this.props.showToolTip(i,x(di.date),this.props.height/2);
  }

  render() {
    return (
      <rect transform={this.props.transform} className="overlay" width={this.props.width} height={this.props.height} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} /> 
    );
  }
}

class Chart extends Component {
  
  state = {
    data: this.props.data,
    tooltip:{ display:false,data:[]},
    width:this.props.width
  };

  showToolTip = (index,xPos,yPos) => {
    // e.target.setAttribute('fill', '#FFFFFF');
    const points = this.state.data.map(function(stock,i){
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
    // const colorIndex = e.target.getAttribute('data-index');
    // e.target.setAttribute('fill', colors[colorIndex]);
    this.setState({
      tooltip:{ display:false,data:[]},
      dotIndex: null
    });
  }

  render() {
    const _self=this;
    const margin = {top: 40, right: 50, bottom: 60, left: 70},
    width = this.props.size[0] - (margin.left + margin.right),
    height = this.props.size[1] - (margin.top + margin.bottom);

    const parseDate = timeParse("%m-%d-%Y");

    const data = this.state.data;
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
      return (
        <g key={index}>
          <path className="line shadow" stroke={colors[index]} d={stockLine(stock.data)} strokeLinecap="round"/>
          <Dots data={stock.data} x={xScale} y={yScale} parentIndex={index} fillColor={colors[index]} dotActive={_self.state.dotIndex}/>
        </g>
      );
    });

    return (
      <svg width={this.props.size[0]} height={this.props.size[1]}> 
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
