import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import CSS
import '../css/trip.css';

class OthersChatBox extends Component {

	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return(
			<div className="talk_bubble">
			  <div className="talktext">
			    <p>{this.props.user}: {this.props.content}</p>
			  </div>
			</div>
		);
	}
}

OthersChatBox.propTypes = { 
	index: PropTypes.any,
	user: PropTypes.any,
	content: PropTypes.any
}; 

export default OthersChatBox;