import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// import CSS
import '../css/reset.css';
import '../css/app.css';
import '../css/header.css';
import '../css/main_profile.css';

// import photo

// import ReactDOM

// Server ip
let Server_ip = 'http://localhost:9000';
// let Server_ip = 'http://52.89.137.222:9000';

class TripCard extends Component {

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	componentDidMount() {
        
	}

	render() {
		return(
			<Link to={`/trip?trip_id=${this.props.tripId}`}>
				<div className='trip'>
					<div className='trip_title'>{this.props.tripTitle}</div>
					<div className='trip_date'>{this.props.tripDate.getFullYear()+'-'+(this.props.tripDate.getMonth()+1)+'-'+this.props.tripDate.getDate()}</div>
					<div className='trip_location'>{this.props.tripLocation}</div>
				</div>
			</Link>
		);
	}
}

TripCard.propTypes = { 
	tripId: PropTypes.any,
	tripTitle: PropTypes.any,
	tripDate: PropTypes.any,
	tripLocation: PropTypes.any,
}; 

export default TripCard;
