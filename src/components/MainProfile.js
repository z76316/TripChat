import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// import CSS
import '../css/normalize.css';
import '../css/app.css';

// import photo
import logo from '../../photo/logo_04.png';
import planIcon from '../../photo/plan_icon_01.png';
import fbHead from '../../photo/fb_head.jpg';

// import ReactDOM

class MainProfile extends Component {

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

	logOut = (e) => {

	}

	render() {
		return(
			<div>
				<header>
					<img className='header_logo' style={{height: '42px'}} src={logo} alt={'logo'} />
					<div className="header_title">TripChat</div>
					<img className='plan_icon' style={{height: '42px'}} src={planIcon} alt={'main page icon'} />
				</header>
				<div className="main_container">
					<div className='profile_container'>
						<div className="profile_picture">
							<img style={{height: '180px', borderRadius: '50%'}} src={fbHead} />
							<div className='profile_name'>伯斯</div>
							<div className='profile_email'>boss@gmail.com</div>
							<button 
								className='logout_button'
								type='button' 
								onClick={() => this.logOut()}>登出</button>
						</div>
						<div className='trip_list_container'>
							<div className='trip_list_tag'>
								<div className='trip_list_tag_now'>規劃中</div>
								<div className='trip_list_tag_past'>回憶錄</div>
							</div>
							<div className='trip_list_area'>
								<Link to='/trip'>
									<div className='trip'>
										<div className='trip_title'>清水斷崖獨木舟</div>
										<div className='trip_date'>2018.6.21</div>
										<div className='trip_location'>宜蘭</div>
										<div className='trip_member'>伯斯、偵博斯、假伯斯</div>
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

export default MainProfile;
