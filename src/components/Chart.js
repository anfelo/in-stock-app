import React, { Component } from 'react';

// D3 Imports
import { line } from 'd3-shape';
import { scaleLinear, scaleTime } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { max, min } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';

// Component Imports
import Grid from './Grid';
import Axis from './Axis';
import Dots from './Dots';
import ToolTip from './ToolTip';
import Overlay from './Overlay';

// Other Imports
import colors from '../data/colors';

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

export default Chart;