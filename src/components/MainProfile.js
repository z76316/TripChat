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
import TripCard from './TripCard';

// Server ip
let Server_ip = 'http://localhost:9000';
// let Server_ip = 'http://52.89.137.222:9000';

// Fake Trip list
let a_trip = {
	tripId: 1,
	tripTitle: '清水斷崖獨木舟',
	tripDate: new Date(2018,6,21),
	tripLocation: '宜蘭',
	tripMembers: '伯斯, 真伯斯, 假伯斯'
};

let b_trip = {
	tripId: 2,
	tripTitle: '草嶺古道驚魂記',
	tripDate: new Date(2016,3,11),
	tripLocation: '宜蘭',
	tripMembers: '伯斯, 真伯斯, 假伯斯'
};

let c_trip = {
	tripId: 3,
	tripTitle: '司馬庫斯看星星',
	tripDate: new Date(2013,8,17),
	tripLocation: '新竹',
	tripMembers: '伯斯, 真伯斯, 假伯斯'
};

let d_trip = {
	tripId: 4,
	tripTitle: '阿里山看日出沒看到',
	tripDate: new Date(2012,1,3),
	tripLocation: '嘉義',
	tripMembers: '伯斯, 真伯斯, 假伯斯'
};

let e_trip = {
	tripId: 5,
	tripTitle: '花蓮3日遊',
	tripDate: new Date(2011,8,27),
	tripLocation: '花蓮',
	tripMembers: '伯斯, 真伯斯, 假伯斯'
};

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
			trip_list: [a_trip, b_trip, c_trip],
			memory_list: [d_trip, e_trip]
		};
	}

	ajax = (method, src, args, callback) => {
		let req = new XMLHttpRequest();
		if(method.toLowerCase() === 'post'){ 
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
			this.ajax('post', Server_ip+'/exe/accounts/editname', update_data, (req) => {
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
		console.log(currEditName);
	}

	logOut = () => {
		this.ajax('get', Server_ip+'/exe/logout', '', (req) => {
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
		this.ajax('get', Server_ip+'/exe/checkloginstate', '', (req) => {
			let result=JSON.parse(req.responseText);
			console.log('MainProfile.js session ' + result.name + ' ' + result.email);
			if(result.isLogin) {
				this.setState(
					{
						profile_name: result.name,
						profile_email: result.email
					}
				);

				this.getTripList();
			}
		});
	}

	getTripList = () => {
		this.ajax('get', Server_ip+'/exe/gettriplist', '', (req) => {
			let result=JSON.parse(req.responseText);
			console.log('TripList data is: ' + result);
			console.log(result[0]);
			console.log(result[1]);
			console.log(result[2]);
			console.log(result);
			let trip_list = [];
			let memory_list = [];
			let trip = {};

			// let temp = new Date();
			// let currDate = new Date(temp.toLocaleDateString());
			// console.log(currDate);

			let now = new Date();
			let currDate = new Date(now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate());
			// let currDate = new Date(startOfDay / 1000);
			console.log(currDate);

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
				console.log(trip.tripDate);
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
		let newTripId;
		if (confirmToCreateNewTrip) {

			let tripDate = + new Date();
			console.log(tripDate);
			
			let newTrip = {
				// tripId: newTripId,
				tripTitle: '新的旅程',
				tripDate: tripDate,
				tripLocation: '去哪玩咧',
			};

			this.ajax('post', Server_ip+'/exe/createnewtrip', newTrip, (req) => {
				let result=JSON.parse(req.responseText);
				console.log(result);
				if(result.err) {
					alert(result.err);
				} else {
					newTrip.tripId = result.new_trip_id;
					newTrip.tripDate = new Date(tripDate);
					let new_trip_list = this.state.trip_list;
					new_trip_list.push(newTrip);
					this.setState({trip_list: new_trip_list});
					console.log(new_trip_list);
				}
			});

		}
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
