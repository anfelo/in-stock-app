import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { select } from 'd3-selection';

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

export default Grid;