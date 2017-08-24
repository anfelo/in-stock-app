import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// D3 Imports
import { select } from 'd3-selection';

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

export default Axis;