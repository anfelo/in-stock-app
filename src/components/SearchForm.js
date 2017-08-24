import React, {Component} from 'react';

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
					<input className="name-input" type="text" placeholder="Search Stock..." value={this.state.name}  onChange={this.onNameChange} required/>
					<button type="submit" id="submit" className="search-button"><i className="fa fa-search"></i></button>
				</form>
			</div>
		);
	}
}

export default SearchForm;

