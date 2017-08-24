import React, { Component } from 'react';

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

export default ZoomOptions;