import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// import CSS
import '../css/reset.css';
import '../css/app.css';
import '../css/header.css';
import '../css/main_profile.css';

// import photo
import logo from '../../photo/logo_04.png';
import planIcon from '../../photo/plan_icon_01.png';
import fbHead from '../../photo/fb_head.jpg';

// import ReactDOM

class MainProfile extends Component {

	constructor(props) {
		super(props);
		this.state = {
			profile_name: '',
			profile_email: '',
			trip_list_tag_now: 'trip_list_tag_now current',
			trip_list_tag_past: 'trip_list_tag_past'
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange = (e) => {
		let inputName = e.target.value;
		console.log(this.state);
		this.setState({inputName: inputName});
	}

	logOut = () => {
		localStorage.removeItem('currUser');
		this.props.changeLoginState(false);
	}

	getLoginState = () => {
		let currUser = JSON.parse(localStorage.getItem('currUser'));
		this.setState(
			{
				profile_name: currUser.name,
				profile_email: currUser.email
			});
	}

	componentDidMount() {
		this.getLoginState();
	}

	render() {
		return(
			<div>
				<header>
					<div className='header_left'>
						<img className='header_logo' src={logo} alt={'logo'} />
						<div className="header_title">TripChat</div>
					</div>
					<Link to='/'>
						<img className='plan_icon' src={planIcon} alt={'main page icon'} />
					</Link>
				</header>
				<div className="main_container">
					<div className="profile_container">
						<img className='profile_picture' src={fbHead} />
						<div className='profile_content'>
							<div className='profile_name'>{this.state.profile_name}</div>
							<div className='profile_email'>{this.state.profile_email}</div>
							<button 
								className='logout_button'
								type='button' 
								onClick={() => this.logOut()}>登出</button>
						</div>
					</div>
					<div className='trip_list_container'>
						<div className='trip_list_tag'>
							<div className={this.state.trip_list_tag_now}>規劃中</div>
							<div className={this.state.trip_list_tag_past}>回憶錄</div>
						</div>
						<div className='trip_list_background'>
							<div className='trip_list_area'>
								<Link to='/trip'>
									<div className='trip'>
										<div className='trip_title'>清水斷崖獨木舟</div>
										<div className='trip_date'>2018.6.21</div>
										<div className='trip_location'>宜蘭</div>
										<div className='trip_member'>伯斯、真博斯、假伯斯</div>
									</div>
								</Link>
								<Link to='/trip'>
									<div className='trip'>
										<div className='trip_title'>清水斷崖獨木舟</div>
										<div className='trip_date'>2018.6.21</div>
										<div className='trip_location'>宜蘭</div>
										<div className='trip_member'>伯斯、真博斯、假伯斯</div>
									</div>
								</Link>
								<Link to='/trip'>
									<div className='trip'>
										<div className='trip_title'>清水斷崖獨木舟</div>
										<div className='trip_date'>2018.6.21</div>
										<div className='trip_location'>宜蘭</div>
										<div className='trip_member'>伯斯、真博斯、假伯斯</div>
									</div>
								</Link>
								<Link to='/trip'>
									<div className='trip'>
										<div className='trip_title'>清水斷崖獨木舟</div>
										<div className='trip_date'>2018.6.21</div>
										<div className='trip_location'>宜蘭</div>
										<div className='trip_member'>伯斯、真博斯、假伯斯</div>
									</div>
								</Link>
								<div className='trip_create'>
									<div className='trip_create_content'>開啟下一趟旅程</div>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>
		);


		
	}

}

MainProfile.propTypes = { 
	changeLoginState: PropTypes.func
}; 

export default MainProfile;
