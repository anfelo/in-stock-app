import React, { Component } from 'react';

// D3 Imports
import { bisector } from 'd3-array';
import { select, mouse } from 'd3-selection';

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

export default Overlay;