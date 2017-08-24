import React, { Component } from 'react';

// Other Imports
import colors from '../data/colors';

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

export default Stock;