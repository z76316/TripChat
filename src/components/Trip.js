import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

// import CSS
import '../css/reset.css';
import '../css/app.css';
import '../css/header.css';
import '../css/trip.css';

// import photo
import logo from '../../photo/logo_04.png';
import planIcon from '../../photo/plan_icon_01.png';
import arrowIcon from '../../photo/arrow_icon_01.png';
import markerIcon from '../../photo/marker_icon_01.png';
// import deleteIcon from '../../photo/delete_icon_01.png';
import meetingIcon from '../../photo/meeting_icon_01.png';
import addMemberIcon from '../../photo/add_member_icon_01.png';

// import ReactDOM
import MyChatBox from './myChatBox';
import OthersChatBox from './othersChatBox';

// Server ip
let Server_ip = 'http://localhost:9000';
// let Server_ip = 'http://52.89.137.222:9000';

let socket;

let map, geocoder;

// let m1 = {
// 	marker_id: 1,
// 	location: {
// 		lat: 25.042299,
// 		lng: 121.565182	
// 	},
// 	content: '安安喔喔喔',
// };
// let m2 = {
// 	marker_id: 2,
// 	location: {
// 		lat: 25.542299,
// 		lng: 122.065182	
// 	},
// 	content: '安安喔喔喔2',
// };
// let m3 = {
// 	marker_id: 3,
// 	location: {
// 		lat: 25.042299,
// 		lng: 121.545182	
// 	},
// 	content: '安安喔喔喔3',
// };
// let currMarkers = [m1, m2, m3];

let markers = [];
let currMarkers = [];


export class Trip extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mapInitPos: {
				lat: 25.042299,
				lng: 121.565182
			},
			trip_id: '',
			trip_title: '',
			trip_date: '',
			trip_location: '',
			tripTitleInput: '',
			tripDateInput: '',
			tripLocationInput: '',
			input_trip_title_style: 'displayNone',
			input_trip_date_style: 'displayNone',
			input_trip_location_style: 'displayNone',
			edit_title: false,
			edit_date: false,
			edit_location: false,
			temp_title: '',
			temp_date: '',
			temp_location: '',
			add_member_box_style: 'displayNone',
			addMemberInput: '',
			members: [],
			currPos: '',
			tool: 'normal',
			newMarkers: [],
			deleteMarkers: [],
			currTextarea: '',
			chatInputValue: '',
			currUser: '',
			currUserEmail: '',
			whoTyping: '',
			chatBoxes: []
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

	editTitle = () =>  {
		if(!this.state.edit_title) {
			let temp_title = this.state.trip_title;
			this.setState({
				temp_title: temp_title,
				tripTitleInput: temp_title,
				trip_title: '',
				edit_title: true,
				input_trip_title_style: 'input_trip_title'
			});
		} else {
			let update_data = {
				trip_id: this.state.trip_id,
				new_title: this.state.tripTitleInput,
				old_title: this.state.temp_title
			};
			this.ajax('post', Server_ip+'/exe/trip/edittitle', update_data, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
				} else {
					this.setState({
						trip_title: result.title,
						edit_title: false,
						input_trip_title_style: 'displayNone'
					});
				}
			});
		}
	}

	editDate = () => {
		if(!this.state.edit_date) {
			let temp_date = this.state.trip_date;
			this.setState({
				temp_date: temp_date,
				tripDateInput: temp_date,
				trip_date: '',
				edit_date: true,
				input_trip_date_style: 'input_trip_date'
			});
		} else {
			let update_data = {
				trip_id: this.state.trip_id,
				new_date: + new Date(this.state.tripDateInput),
				old_date: + new Date(this.state.temp_date)
			};
			this.ajax('post', Server_ip+'/exe/trip/editdate', update_data, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
				} else {
					let date = new Date(result.date);
					let trip_date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
					this.setState({
						trip_date: trip_date,
						edit_date: false,
						input_trip_date_style: 'displayNone'
					});
				}
			});
		}
	}

	editLocation = () => {
		if(!this.state.edit_location) {
			let temp_location = this.state.trip_location;
			this.setState({
				temp_location: temp_location,
				tripLocationInput: temp_location,
				trip_location: '',
				edit_location: true,
				input_trip_location_style: 'input_trip_location'
			});
		} else {
			let update_data = {
				trip_id: this.state.trip_id,
				new_location: this.state.tripLocationInput,
				old_location: this.state.temp_location
			};
			this.ajax('post', Server_ip+'/exe/trip/editlocation', update_data, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
				} else {
					console.log(result.location);
					geocoder.geocode( { 'address': result.location}, (results, status) => {
						if (status == 'OK') {
							let	lat = results[0].geometry.location.lat();
							let	lng = results[0].geometry.location.lng();
							this.moveToLocation(lat, lng);
						} 
					});		
					this.setState({
						trip_location: result.location,
						edit_location: false,
						input_trip_location_style: 'displayNone'
					});
				}
			});
		}
	}

	getLatLng = (place) => {
		geocoder.geocode( { 'address': place}, (results, status) => {
			if (status == 'OK') {
				console.log(results[0].geometry.location.lat());
				console.log(results[0].geometry.location.lng());
				let newCenter = {
					lat: results[0].geometry.location.lat(),
					lng: results[0].geometry.location.lng()
				};
				return newCenter;
			} else {
				return this.state.mapInitPos;
			}
		});
	}

	handleTripTitleInput = (e) => {
		let tripTitleInput = e.target.value;
		this.setState({tripTitleInput: tripTitleInput});
		console.log(tripTitleInput);
	}

	handleTripDateInput = (e) => {
		let tripDateInput = e.target.value;
		this.setState({tripDateInput: tripDateInput});
		console.log(tripDateInput);
	}

	handleTripLocationInput = (e) => {
		let tripLocationInput = e.target.value;
		this.setState({tripLocationInput: tripLocationInput});
		console.log(tripLocationInput);
	}

	addMember = () => {
		this.setState({add_member_box_style: 'add_member_box'});
	}

	handleAddMemberInput = (e) => {
		let addMemberInput = e.target.value;
		this.setState({addMemberInput: addMemberInput});
		console.log(addMemberInput);
	}

	submitAddMember = () => {
		let newMemberEmail = this.state.addMemberInput;
		let data = {
			trip_id: this.state.trip_id,
			member_email: newMemberEmail
		};

		this.ajax('post', Server_ip+'/exe/trip/addnewmember', data, (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert(result.err);
			} else {
				let member_name = result.name;
				alert(result.message);
				this.close_add_member_box();
			}
		});
	}

	closeAddMember = () => {
		this.setState({
			addMemberInput: '',
			add_member_box_style: 'displayNone'
		});
	}

	// Google map
	initMap = (tripLocation) => {

		// set map's initial position by the location of this trip
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': tripLocation}, (results, status) => {
			if (status == 'OK') {
				map = new google.maps.Map(document.querySelector('.trip_map'), {
					center: results[0].geometry.location,
					zoom: 12
				});
			} else {
				console.log(status);
				map = new google.maps.Map(document.querySelector('.trip_map'), {
					center: this.state.mapInitPos,
					zoom: 12
				});
			}

			map.addListener('click', (e) => {                
				console.log(e.latLng.lat());
				console.log(e.latLng.lng());
				let lat = e.latLng.lat();
				let lng = e.latLng.lng();
				let currPos = {
					lat: lat,
					lng: lng
				};
				this.setState({currPos: currPos});
				this.clickByTool(currPos);
			});

			console.log('到setMarkersOnMap了');
			console.log(currMarkers);
			this.setMarkersOnMap(currMarkers);

		});

	}

	moveToLocation = (lat, lng) => {
		let center = new google.maps.LatLng(lat, lng);
		// using global variable:
		map.panTo(center);
	}

	// judge clicking behavior by this.state.tool
	clickByTool = (location) => {
		if(this.state.tool === 'marker') {
			// let marker_id = currMarkers[currMarkers.length - 1].marker_id + 1;
			// let content = '寫下您的旅遊筆記~';
			// let newAddedMarker = {
			// 	marker_id: marker_id,
			// 	location: location,
			// 	content: content
			// };

			// add this marker to SQL
			let marker_data = {
				trip_id: this.state.trip_id,
				lat: location.lat,
				lng: location.lng,
				content: '寫下您的旅遊筆記~'
			};
			this.ajax('post', Server_ip+'/exe/trip/addmarker', marker_data, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
				} else {
					let newAddedMarker = {
						marker_id: result.marker_id,
						location: result.location,
						content: result.content
					};
					currMarkers.push(newAddedMarker);
					this.addMarker(result.marker_id, result.location, result.content);

				}
			});
		}
	}

	// set all markers on map
	setMarkersOnMap = (currMarkers) => {
		if(markers.length) {
			currMarkers.map((marker, i) => {
				let marker_id = marker.marker_id;
				let location = marker.location;
				let content = marker.content;
					
				for(let j = 0; j < markers.length; j++) {
					console.log(marker_id);
					console.log(markers[j].marker_id);
					if(marker_id === markers[j].marker_id ) {
						return;
					}	
				}
				
				this.addMarker(marker_id, location, content);	
				
			});
		} else {
			currMarkers.map((marker, i) => {
				let marker_id = marker.marker_id;
				let location = marker.location;
				let content = marker.content;
				
				console.log('等等要addMarker囉');
				console.log(marker_id);
				console.log(location);
				console.log(content);

				this.addMarker(marker_id, location, content);
			});	
		}
		this.setMapOnAll(map);
	}

	// Adds a marker to the map and push into the array.
	addMarker = (marker_id, location, content) => {
		let marker = new google.maps.Marker({
			position: location, 
			map: map,
			animation: google.maps.Animation.DROP,
			clickable: true
		});
		marker.marker_id = marker_id;
		console.log(marker.marker_id);
		let cont = document.createElement('DIV');
		let textarea = document.createElement('textarea');
		textarea.placeholder = '寫下您的旅遊筆記~';
		textarea.value = content;
		textarea.oninput = (e) => {
			this.handleTextarea(e);
		};
		let submitBut = document.createElement('BUTTON');
		submitBut.textContent = '完成';
		submitBut.onclick = () => {
			console.log(`有按到id=${marker_id}的完成按鈕喔喔喔喔`);
			this.editMarkerContent(marker_id);
		};
		let deleteBut = document.createElement('BUTTON');
		deleteBut.textContent = '刪除';
		deleteBut.onclick = () => {
			console.log(`按到刪除id=${marker_id}囉`);
			this.deleteMarkers(marker_id);
			this.deleteCurrmarkers(marker_id);
		};

		cont.appendChild(textarea);
		cont.appendChild(submitBut);
		cont.appendChild(deleteBut);
		let infoWindow = new google.maps.InfoWindow({
			content: cont
		});
		console.log('加入 addListener 了啊');
		marker.addListener('click', () => {
			infoWindow.open(map, marker);
		});
		
		markers.push(marker);
		console.log(markers);
	}

	// Sets the map on all markers in the array.
	setMapOnAll = (map) => {
		for (let i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	}

	// Removes the markers from the map, but keeps them in the array.
	clearMarkers = () => {
		this.setMapOnAll(null);
	}

	// Shows any markers currently in the array.
	showMarkers = () => {
		this.setMapOnAll(map);
	}

	// Deletes all markers in the array by removing references to them.
	deleteAllMarkers = () => {
		this.clearMarkers();
		markers = [];
	}

	// Deletes a specific marker in markers array
	deleteMarkers = (marker_id) => {
		console.log(`gonna delete the marker its id= ${marker_id} in markers`);
		let new_markers = [];
		for (let i = 0; i < markers.length; i++) {
			if(markers[i].marker_id === marker_id) {
				markers[i].setMap(null);
			} else {
				new_markers.push(markers[i]);
				console.log(new_markers);

			}
			
		}
		markers = new_markers;
		console.log(markers);

	}

	// Deletes a specific marker in currMarkers array
	deleteCurrmarkers = (marker_id) => {
		console.log(`gonna delete the marker its id= ${marker_id} in currMarkers`);
		let new_currMarkers = [];
		for(let i = 0; i < currMarkers.length; i++) {
			if(currMarkers[i].marker_id !== marker_id) {
				new_currMarkers.push(currMarkers[i]);
			}
		}
		currMarkers = new_currMarkers;
		console.log(currMarkers);
		
		let delete_marker = {
			marker_id: marker_id
		};
		this.ajax('post', Server_ip+'/exe/trip/deletemarker', delete_marker, (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert(result.err);
			} else {
				alert(result.message);
			}
		});

	}

	selectTool = (toolType) => {
		this.setState({tool: toolType});
		console.log(this.state.tool);
	}

	handleTextarea = (e) => {
		let currTextarea = e.target.value;
		console.log(currTextarea);
		this.setState({currTextarea: currTextarea});
	}

	editMarkerContent = (marker_id) => {
		console.log(marker_id);
		for(let i = 0; i < currMarkers.length; i++) {
			console.log(currMarkers[i].marker_id);
			console.log(marker_id);
			if(currMarkers[i].marker_id === marker_id) {
				currMarkers[i].content = this.state.currTextarea;
				console.log(this.state.currTextarea);
				console.log(currMarkers[i]);
			}
		}

		let update_marker = {
			marker_id: marker_id,
			content: this.state.currTextarea
		};
		this.ajax('post', Server_ip+'/exe/trip/editmarker', update_marker, (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert(result.err);
			} else {
				this.deleteMarkers(marker_id);
				console.log(currMarkers);
				this.setMarkersOnMap(currMarkers);
			}
		});

	}


	// Chat room
	handleChatInput = (e) => {
		let currUser = this.state.currUser;
		let isTyping;
		e.target.value ? isTyping = true : isTyping = false;
		socket.emit('typing', {who: currUser, isTyping: isTyping});
		let chatInputValue = e.target.value;
		this.setState({chatInputValue: chatInputValue});
		console.log(chatInputValue);
	}

	onEnterPress = (e) => {
		if(e.keyCode == 13 && e.shiftKey == false) {
			if(e.target.value === '') {
				e.preventDefault();
				return;	
			}
			e.preventDefault();
			// this.myFormRef.submit();
			socket.emit('chat', {
				message: this.state.chatInputValue,
				currUser: this.state.currUser,
				currUserEmail: this.state.currUserEmail
			});
			e.target.value = '';
			
			// Save message into SQL
			let message_data = {
				trip_id: this.state.trip_id,
				show_name: this.state.currUser,
				account_email: this.state.currUserEmail,
				message: this.state.chatInputValue
			};
			this.ajax('post', Server_ip+'/exe/trip/savemessage', message_data, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
				} else {
					console.log(result.done_message);
				}
			});
		}
	}

	scrollToBottom() {
		this.messagesEnd.scrollIntoView({ behavior: 'auto' });
	}


	componentDidUpdate() {
		this.scrollToBottom();
	}

	componentDidMount() {
		// check login state
		this.ajax('get', Server_ip+'/exe/checkloginstate', '', (req) => {
			let result=JSON.parse(req.responseText);
			console.log('Trip.js session ' + result.name + ' ' + result.email);
			if(result.isLogin) {
				this.setState({
					currUser: result.name,
					currUserEmail: result.email
				});
			} else {
				window.location = '/';
			}
		});

		let afterHashURL = location.hash;
		let trip_id = parseInt(afterHashURL.split('=')[1]);
		console.log(trip_id);
		console.log(typeof trip_id);
		let data = {
			trip_id: trip_id
		};

		// initialize this trip's info and markers
		this.ajax('post', Server_ip+'/exe/trip/getTripData', data, (req) => {
			let result=JSON.parse(req.responseText);
			console.log(result);
			if(result.err) {
				alert(result.err);
			} else if(result.notTripMember) {
				window.location = '/';
			} else {
				console.log(result);
				let date = new Date(result.trip_date);
				let trip_date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
				console.log(trip_date);

				currMarkers = result.markers;
				let initPos = result.trip_location;
				this.initMap(initPos);

				this.setState({
					trip_id: trip_id,
					trip_title: result.trip_title,
					trip_date: trip_date,
					trip_location: result.trip_location,
					tripTitleInput: result.trip_title,
					tripDateInput: trip_date,
					tripLocationInput: result.trip_location
				});
			}
		});

		// initialize this chat room's chat logs
		let chat_room_data = {
			trip_id: trip_id
		};
		this.ajax('post', Server_ip+'/exe/trip/getchatlogs', chat_room_data, (req) => {
			let result=JSON.parse(req.responseText);
			console.log(result);
			if(result.err) {
				alert(result.err);
			} else if(result.no_chat_log) {
				console.log(result.no_chat_log);
			}else {
				this.setState({
					chatBoxes: result.chat_logs
				});
			}
		});
		
		// let chat room scoll to bottom
		this.scrollToBottom();

		// socket.IO connect
		socket = io.connect(Server_ip);

		// Listen for chat
		socket.on('chat', (data) => {
			console.log(data);
			let temp_chatBoxes = this.state.chatBoxes;
			let new_chat = {
				who: data.currUser,
				email: data.currUserEmail,
				content: data.message
			};
			temp_chatBoxes.push(new_chat);
			this.setState({
				chatBoxes: temp_chatBoxes,
				chatInputValue: '',
				whoTyping: ''
			});
		});

		// Listen for typing
		socket.on('typing', (typingState) => {
			console.log(typingState);
			if(typingState.isTyping) {
				this.setState({whoTyping: typingState.who});
			} else {
				this.setState({whoTyping: ''});
			}
		});

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
				<div className="trip_container">
					<div className='trip_map'>
					</div>
					<div className='trip_map_bar'>
						<div className='bar_title_container'>
							<div className='trip_title_style'>Trip: {this.state.trip_title}</div>
							<input 
								className={this.state.input_trip_title_style}
								type="text" 
								name="trip_title" 
								placeholder='旅程標題' 
								value={this.state.tripTitleInput}
								onChange={ (e) => this.handleTripTitleInput(e) }
							/>
							<div className='edit_icon'
								onClick={() => this.editTitle()}></div>
						</div>
						<div className='bar_title_container'>
							<div className='trip_date_style'>日期: {this.state.trip_date}</div>
							<input 
								className={this.state.input_trip_date_style}
								type="text" 
								name="trip_date" 
								placeholder='出發日期' 
								value={this.state.tripDateInput}
								onChange={ (e) => this.handleTripDateInput(e) }
							/>
							<div className='edit_icon'
								onClick={() => this.editDate()}></div>
						</div>
						<div className='bar_title_container'>
							<div className='trip_location_style'>地點: {this.state.trip_location}</div>
							<input 
								className={this.state.input_trip_location_style}
								type="text" 
								name="trip_location" 
								placeholder='旅遊地點' 
								value={this.state.tripLocationInput}
								onChange={ (e) => this.handleTripLocationInput(e) }
							/>
							<div className='edit_icon'
								onClick={() => this.editLocation()}></div>
						</div>
						<div className='trip_map_bar_tool_box'>
							<img 
								className='arrow_icon' 
								src={arrowIcon} 
								alt={'arrow tool'}
								onClick={ () => this.selectTool('normal')} 
							/>
							<img 
								className='marker_icon' 
								src={markerIcon} 
								alt={'marker tool'} 
								onClick={ () => this.selectTool('marker')} 
							/>
							{/* <img 
								className='delete_icon' 
								src={deleteIcon} 
								alt={'delete tool'} 
								onClick={ () => this.selectTool('delete')} 
							/> */}
							{/* <img 
								className='compass_icon' 
								src={compassIcon} 
								alt={'circle tool'} 
								onClick={ () => this.selectTool('delete')} 
							/> */}
						</div>
						<div 
							className='addMemberButton'
							alt={'add member'}
							onClick={() => this.addMember()}>
							<img className='add_member_icon' style={{height: '32px'}} src={addMemberIcon} alt={'add member button'} />
						</div>
						<div className={this.state.add_member_box_style}>
							<input 
								className='input_add_member'
								type="email" 
								name="add member input" 
								placeholder='輸入 email 邀請您的旅遊夥伴' 
								value={this.state.addMemberInput}
								onChange={ (e) => this.handleAddMemberInput(e) }
							/>
							<button
								className='add_member_submit_button'
								type='button'
								onClick={() => this.submitAddMember()}>加入</button>
							<button
								className='close_add_member_box'
								type='button'
								onClick={() => this.closeAddMember()}>關閉</button>
						</div>
						{/* <button 
							className='export_button'
							type='button' 
							onClick={() => this.exportFile()}>匯出</button> */}
					</div>
					<div className='trip_chat_room'>
						<div className='chat_room_header'>
							<img className='chat_room_header_icon' style={{height: '24px'}} src={meetingIcon} alt={'meeting icon'} />
							<div className='chat_room_header_title'>討論桌</div>
						</div>
						<div className='chat_room_main'>
							<div className='chat_area'>
								{ this.state.chatBoxes.map( (chat,index) => {
									console.log(chat.who);
									console.log(chat.email);
									console.log(chat.content);
									if(chat.email === this.state.currUserEmail) {
										return (
											<MyChatBox 
												key={index}
												index={index} 
												user={chat.who}
												content={chat.content}
											/>
										);
									} else {
										return (
											<OthersChatBox 
												key={index}
												index={index} 
												user={chat.who}
												content={chat.content}
											/>
										);
									}
								})}

								{ 
									this.state.whoTyping ? 
										<div className='who_typing'>{this.state.whoTyping}輸入中訊息中...</div> : 
										<div className='who_typing'></div>
								}
								<div style={{ float:'left', clear: 'both' }}
           				ref={(el) => { this.messagesEnd = el; }}>
         				</div>
							</div>

							{/* <input 
								className='temp_currUser' 
								type="text" 
								name="temp_currUser" 
								placeholder='先打暱稱，以後幫大家變成使用者資訊' 
								onChange={ (e) => this.handleNameInput(e) }
							/> */}

	            <textarea 
	            	className='input_chat'
	            	name='chat_content'
	            	onChange={ (e) => this.handleChatInput(e) } 
	            	onKeyDown={this.onEnterPress}
	            	placeholder='傳送訊息'
	            	cols={40} rows={3}
            	></textarea>

						</div>
					</div>
				</div>
			</div>
		);


		
	}

}

Trip.propTypes = { 
	tripTitle: PropTypes.any,
	tripDate: PropTypes.any,
	tripLocation: PropTypes.any,
	tripMember: PropTypes.any,
	google: PropTypes.any
}; 


// export default Trip;
export default GoogleApiWrapper({
	apiKey: ('AIzaSyAOrwA13NUBURp_YygxsGwTPHyCs4dEoOs')
})(Trip);

