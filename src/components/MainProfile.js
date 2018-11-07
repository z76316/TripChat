import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// import CSS
import '../css/reset.css';
import '../css/app.css';
import '../css/header.css';
import '../css/main_profile.css';

// import photo
import logo from '../../photo/logo_04_burned.png';
import fbHead from '../../photo/fb_head.jpg';

// import ReactDOM
import TripCard from './TripCard';

// Server ip
import Server_ip from '../server_ip';


class MainProfile extends Component {

	constructor(props) {
		super(props);
		this.state = {
			profile_name: '',
			profile_email: '',
			temp_name: '',
			edit_name: false,
			input_edit_name_style: 'displayNone',
			currEditName: '',
			now_or_memory: 'now',
			trip_list_tag_now: 'trip_list_tag_now current',
			trip_list_tag_past: 'trip_list_tag_past',
			trip_list: [],
			memory_list: []
		};
	}

	ajax = (method, src, args, callback) => {
		let req = new XMLHttpRequest();
		req.withCredentials = true;
		if(method.toLowerCase() === 'post'
		|| method.toLowerCase() === 'put'
		|| method.toLowerCase() === 'delete'){ 
			// post through json args
			req.open(method, src);
			req.setRequestHeader('Content-Type', 'application/json');
			req.onload = function(){
				callback(this);
			};
			req.send(JSON.stringify(args));
		}else{ 
			// get through http args
			req.open(method, src+'?'+args);
			req.onload = function(){
				callback(this);
			};
			req.send();
		}
	};

	editName = () => {
		if(!this.state.edit_name) {
			let temp_name = this.state.profile_name;
			this.setState({
				temp_name: temp_name,
				currEditName: temp_name,
				profile_name: '',
				edit_name: true,
				input_edit_name_style: 'input_edit_name'
			});
		} else {
			let update_data = {new_name: this.state.currEditName};
			this.ajax('put', Server_ip+'/exe/accounts/name', update_data, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
				} else {
					this.setState({
						profile_name: result.name,
						edit_name: false,
						input_edit_name_style: 'displayNone'
					});
				}
			});
		}
	}

	handleEditName = (e) => {
		let currEditName = e.target.value;
		this.setState({
			temp_name: currEditName,
			currEditName: currEditName
		});
	}

	logOut = () => {
		this.ajax('get', Server_ip+'/exe/accounts/logout', '', (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert('登出失敗: ' + result.err);
			} else {
				this.props.changeLoginState(false);
			}
		});
	}

	changeTab = (tab) => {
		if(tab === 'now') {
			this.setState({
				now_or_memory: 'now',
				trip_list_tag_now: 'trip_list_tag_now current',
				trip_list_tag_past: 'trip_list_tag_past'
			});
		} else if(tab === 'memory') {
			this.setState({
				now_or_memory: 'memory',
				trip_list_tag_now: 'trip_list_tag_now',
				trip_list_tag_past: 'trip_list_tag_past current'
			});
		}
	}

	getLoginState = () => {
		this.ajax('get', Server_ip+'/exe/accounts/loginstate', '', (req) => {
			let result=JSON.parse(req.responseText);
			console.log('MainProfile.js session ' + result.name + ' ' + result.email);
			if(result.isLogin) {
				this.setState({
					profile_name: result.name,
					profile_email: result.email
				});
				this.getTripList();
			}
		});
	}

	getTripList = () => {
		this.ajax('get', Server_ip+'/exe/trips/gettriplist', '', (req) => {
			let result=JSON.parse(req.responseText);
			let trip_list = [];
			let memory_list = [];
			let trip = {};
			let now = new Date();
			let currDate = new Date(now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate());
			let datetime, tripDate;
			for(let i = 0; i < result.length; i ++) {
				datetime = result[i].trip_date;
				tripDate = new Date(datetime);
				trip = {
					tripId: result[i].trip_id,
					tripTitle: result[i].trip_title,
					tripDate: tripDate,
					tripLocation: result[i].trip_location,
				};
				if(trip.tripDate < currDate) {
					memory_list.push(trip);
				} else {
					trip_list.push(trip);
				}
			}
			this.setState({
				trip_list: trip_list,
				memory_list: memory_list
			});
		});
	}

	createNewTrip = () => {
		let confirmToCreateNewTrip = confirm('是否要開啟新的旅程?');
		if (confirmToCreateNewTrip) {
			let tripDate = + new Date();
			let newTrip = {
				tripTitle: '新的旅程',
				tripDate: tripDate,
				tripLocation: '去哪玩咧',
			};

			this.ajax('post', Server_ip+'/exe/trips/createnewtrip', newTrip, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
				} else {
					newTrip.tripId = result.new_trip_id;
					newTrip.tripDate = new Date(tripDate);
					let new_trip_list = this.state.trip_list;
					new_trip_list.push(newTrip);
					this.setState({trip_list: new_trip_list});
				}
			});
		}
	}

	componentDidMount() {
		this.getLoginState();
	}

	render() {
		return(
			<div className='main_profile_div'>
				<header>
					<div className='header_left'>
						<img className='header_logo' src={logo} alt={'logo'} />
						<div className="header_title">TripChat</div>
					</div>
					<Link to='/'>
						<img className='fbHead_icon' src={fbHead} alt={'main page icon'} />
					</Link>
				</header>
				<div className="main_container">
					<div className="profile_container">
						<div className='profile_picture_container'>
							<img className='profile_picture' src={fbHead} />
						</div>
						<div className='profile_content'>
							<div className='profile_name'>
								{this.state.profile_name}
								<input 
									className={this.state.input_edit_name_style} 
									type="text" 
									name="edit_name" 
									value={this.state.temp_name}
									onChange={ (e) => this.handleEditName(e) }
								/>
								<div className='edit_name_icon'
									onClick={() => this.editName()}></div>
							</div>
							<div className='profile_email'>{this.state.profile_email}</div>
							<button 
								className='logout_button'
								type='button' 
								onClick={() => this.logOut()}>登出</button>
						</div>
					</div>
					<div className='trip_list_container'>
						<div className='trip_list_tag'>
							<div className={this.state.trip_list_tag_now}
								onClick={() => this.changeTab('now')}>規劃中</div>
							<div className={this.state.trip_list_tag_past}
								onClick={() => this.changeTab('memory')}>回憶錄</div>
						</div>
						<div className='trip_list_background'>
							<div className='trip_list_area'>
								{this.state.now_or_memory === 'now' ? 
									(
										this.state.trip_list.map((trip, index) => {
											return (
												<TripCard 
													key={index}
													tripId={trip.tripId}	
													tripTitle={trip.tripTitle}
													tripDate={trip.tripDate}
													tripLocation={trip.tripLocation}
												/>
											);
										})
									) : 
									(
										this.state.memory_list.map((trip, index) => {
											return (
												<TripCard 
													key={index}
													tripId={trip.tripId}	
													tripTitle={trip.tripTitle}
													tripDate={trip.tripDate}
													tripLocation={trip.tripLocation}
												/>
											);
										})
									)		
								}
								{this.state.now_or_memory === 'now' &&
									(<div 
										className='trip_create'
										onClick={()=>{this.createNewTrip();}}
									>
										<div className='trip_create_content'>開啟下一趟旅程</div>
									</div>)
								}
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