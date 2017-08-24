import React, { Component } from 'react';

// Component Imports
import ZoomOptions from './ZoomOptions';
import Chart from './Chart';

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

export default ChartContainer;