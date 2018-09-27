import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// import CSS
import '../css/trip.css';

// import photo

// import ReactDOM


class MyChatBox extends Component {

	constructor(props) {
		super(props);
		this.state = {

		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange = (e) => {
		let inputName = e.target.value;
		console.log(this.state);
		this.setState({inputName: inputName});
	}


	render() {
		return(
			<div className="talk_bubble_self">
			  <div className="talktext">
			    <p>{this.props.user}: {this.props.content}</p>
			  </div>
			</div>
		);
	}

}

MyChatBox.propTypes = { 
	index: PropTypes.any,
	user: PropTypes.any,
	content: PropTypes.any
}; 


export default MyChatBox;
