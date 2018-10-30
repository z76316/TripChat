import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import CSS
import '../css/trip.css';

class MyChatBox extends Component {

	constructor(props) {
		super(props);
		this.state = {
		};
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