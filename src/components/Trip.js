import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GoogleApiWrapper } from 'google-maps-react';

// import CSS
import '../css/reset.css';
import '../css/app.css';
import '../css/header.css';
import '../css/trip.css';

// import photo
import logo from '../../photo/logo_04_burned.png';
import fbHead from '../../photo/fb_head.jpg';
import meetingIcon from '../../photo/meeting_icon_01.png';
import addMemberIcon from '../../photo/add_member_icon_01.png';

// import ReactDOM
import MyChatBox from './myChatBox';
import OthersChatBox from './othersChatBox';

// Server ip
import Server_ip from '../server_ip';

// some global variable for Socket.IO and Google Maps API 
let socket;
let map, geocoder;
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
			currPos: '',
			tool: 'normal',
			arrow_icon_style: 'arrow_icon_style currTool',
			marker_icon_style: 'marker_icon_style',
			deleteMarkers: [],
			member_list: [],
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
		req.withCredentials = true;
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

					// socket emit updating trip location
					let update_location = {
						trip_id: this.state.trip_id,
						location: result.location
					};
					socket.emit('updateLocation', update_location);
				}
			});
		}
	}

	getLatLng = (place) => {
		geocoder.geocode( { 'address': place}, (results, status) => {
			if (status == 'OK') {
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
	}

	handleTripDateInput = (e) => {
		let tripDateInput = e.target.value;
		this.setState({tripDateInput: tripDateInput});
	}

	handleTripLocationInput = (e) => {
		let tripLocationInput = e.target.value;
		this.setState({tripLocationInput: tripLocationInput});
	}

	addMember = () => {
		this.setState({add_member_box_style: 'add_member_box'});
	}

	handleAddMemberInput = (e) => {
		let addMemberInput = e.target.value;
		this.setState({addMemberInput: addMemberInput});
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
				alert(result.message);
				this.closeAddMember();
				this.getTripMember();
			}
		});
	}

	getTripMember = () => {
		let data = {
			trip_id: this.state.trip_id
		};

		this.ajax('post', Server_ip+'/exe/trip/gettripmember', data, (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert(result.err);
			} else {
				let member_list = [];
				for(let i = 0; i < result.length; i++) {
					member_list.push(result[i].account_email);
				}
				this.setState({member_list: member_list});
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
					zoom: 14
				});
			} else {
				map = new google.maps.Map(document.querySelector('.trip_map'), {
					center: this.state.mapInitPos,
					zoom: 14
				});
			}

			map.addListener('click', (e) => {                
				let lat = e.latLng.lat();
				let lng = e.latLng.lng();
				let currPos = {
					lat: lat,
					lng: lng
				};
				this.setState({currPos: currPos});
				this.clickByTool(currPos);
			});
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
					newAddedMarker.trip_id = this.state.trip_id;
					// socket emit adding marker
					socket.emit('addMarker', newAddedMarker);
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
		let cont = document.createElement('DIV');
		cont.className = 'infoWindow_container';
		let textarea = document.createElement('textarea');
		textarea.className = `infowindow_textarea${marker_id}`;
		textarea.placeholder = '寫下您的旅遊筆記~';
		textarea.readOnly = true;
		textarea.value = content;
		textarea.oninput = (e) => {
			this.handleTextarea(e);
		};

		let button_div = document.createElement('DIV');
		button_div.className = 'button_div';

		let submitBut = document.createElement('BUTTON');
		submitBut.className = `submitBut${marker_id}`;
		submitBut.textContent = '編輯';
		submitBut.onclick = () => {
			this.editMarkerContent(marker_id);
		};
		let deleteBut = document.createElement('BUTTON');
		deleteBut.textContent = '刪除';
		deleteBut.onclick = () => {
			this.deleteMarkers(marker_id);
			this.deleteCurrmarkers(marker_id);
		};

		cont.appendChild(textarea);
		cont.appendChild(button_div);
		button_div.appendChild(submitBut);
		button_div.appendChild(deleteBut);
		
		let infoWindow = new google.maps.InfoWindow({
			content: cont
		});
		marker.addListener('click', () => {
			infoWindow.open(map, marker);
		});
		markers.push(marker);
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
		let new_markers = [];
		for (let i = 0; i < markers.length; i++) {
			if(markers[i].marker_id === marker_id) {
				markers[i].setMap(null);
			} else {
				new_markers.push(markers[i]);
			}
		}
		markers = new_markers;
	}

	selectTool = (toolType) => {
		if(toolType === 'normal') {
			this.setState({
				tool: toolType,
				arrow_icon_style: 'arrow_icon_style currTool',
				marker_icon_style: 'marker_icon_style'
			});
		} else if (toolType === 'marker') {
			this.setState({
				tool: toolType,
				arrow_icon_style: 'arrow_icon_style',
				marker_icon_style: 'marker_icon_style currTool'
			});
		}
	}

	handleTextarea = (e) => {
		let currTextarea = e.target.value;
		this.setState({currTextarea: currTextarea});
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

		let delete_marker = {
			marker_id: marker_id
		};
		this.ajax('post', Server_ip+'/exe/trip/deletemarker', delete_marker, (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert(result.err);
			} else {
				delete_marker.trip_id = this.state.trip_id;
				
				// socket emit deleting marker
				socket.emit('deleteMarker', delete_marker);
			}
		});
	}

	// Edit a specific marker in currMarkers array
	editMarkerContent = (marker_id) => {
		let editBut = document.querySelector(`.submitBut${marker_id}`);
		let infoTextarea = document.querySelector(`.infowindow_textarea${marker_id}`);
		if(editBut.textContent === '編輯') {
			editBut.textContent = '完成';
			infoTextarea.readOnly = false;
			let currTextareaContent = infoTextarea.value;
			this.setState({currTextarea: currTextareaContent});
		} else {
			editBut.textContent = '編輯';
			infoTextarea.readOnly = true;

			for(let i = 0; i < currMarkers.length; i++) {
				if(currMarkers[i].marker_id === marker_id) {
					currMarkers[i].content = this.state.currTextarea;
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
					this.setMarkersOnMap(currMarkers);
					update_marker.trip_id = this.state.trip_id;
					
					// socket emit updating marker
					socket.emit('updateMarker', update_marker);
				}
			});
		}
	}

	// Chat room
	handleChatInput = (e) => {
		let currUser = this.state.currUser;
		let isTyping;
		e.target.value ? isTyping = true : isTyping = false;
		socket.emit('typing', {
			trip_id: this.state.trip_id,
			who: currUser, 
			isTyping: isTyping
		});
		let chatInputValue = e.target.value;
		this.setState({chatInputValue: chatInputValue});
	}

	onEnterPress = (e) => {
		if(e.keyCode == 13 && e.shiftKey == false) {
			if(e.target.value === '') {
				e.preventDefault();
				return;	
			}
			e.preventDefault();

			// this.myFormRef.submit();
			let newMessage = this.state.chatInputValue.replace(/'/g, "''");
			socket.emit('chat', {
				trip_id: this.state.trip_id,
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
				message: newMessage
			};
			this.ajax('post', Server_ip+'/exe/trip/savemessage', message_data, (req) => {
				let result=JSON.parse(req.responseText);
				if(result.err) {
					alert(result.err);
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
		let data = {
			trip_id: trip_id
		};

		// initialize this trip's info and markers
		this.ajax('post', Server_ip+'/exe/trip/getTripData', data, (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert(result.err);
			} else if(result.notTripMember) {
				window.location = '/';
			} else {
				let date = new Date(result.trip_date);
				let trip_date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();

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
				}, () => {
					this.getTripMember();
				});
			}
		});

		// initialize this chat room's chat logs
		let chat_room_data = {
			trip_id: trip_id
		};
		this.ajax('post', Server_ip+'/exe/trip/getchatlogs', chat_room_data, (req) => {
			let result=JSON.parse(req.responseText);
			if(result.err) {
				alert(result.err);
			} else if(result.no_chat_log) {
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
		socket.on(`chat${trip_id}`, (data) => {
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
		socket.on(`typing${trip_id}`, (typingState) => {
			if(typingState.isTyping) {
				this.setState({whoTyping: typingState.who});
			} else {
				this.setState({whoTyping: ''});
			}
		});

		// Listen for adding marker
		socket.on(`addMarker${trip_id}`, (newMarker) => {
			currMarkers.push(newMarker);
			this.addMarker(newMarker.marker_id, newMarker.location, newMarker.content);
		});

		// Listen for updating marker content
		socket.on(`updateMarker${trip_id}`, (update_marker) => {
			for(let i = 0; i < currMarkers.length; i++) {
				if(currMarkers[i].marker_id === update_marker.marker_id) {
					currMarkers[i].content = update_marker.content;
				}
			}
			this.deleteMarkers(update_marker.marker_id);
			this.setMarkersOnMap(currMarkers);
		});

		// Listen for deleting marker
		socket.on(`deleteMarker${trip_id}`, (delete_marker) => {
			let new_currMarkers = [];
			for(let i = 0; i < currMarkers.length; i++) {
				if(currMarkers[i].marker_id !== delete_marker.marker_id) {
					new_currMarkers.push(currMarkers[i]);
				}
			}
			this.deleteMarkers(delete_marker.marker_id);
			currMarkers = new_currMarkers;
		});

		// Listen for updating trip location
		socket.on(`updateLocation${trip_id}`, (update_location) => {
			geocoder.geocode( { 'address': update_location.location}, (results, status) => {
				if (status == 'OK') {
					let	lat = results[0].geometry.location.lat();
					let	lng = results[0].geometry.location.lng();
					this.moveToLocation(lat, lng);
				} 
			});		
			this.setState({
				trip_location: update_location.location,
			});
		});
	}

	componentWillUnmount() {
		socket.disconnect();
		markers = [];
		currMarkers = [];
	}

	render() {
		return(
			<div className='trip_div'>
				<header>
					<div className='header_left'>
						<img className='header_logo' src={logo} alt={'logo'} />
						<div className="header_title">TripChat</div>
					</div>
					<Link to='/'>
						<img className='fbHead_icon' src={fbHead} alt={'main page icon'} />
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
							<div 
								className={this.state.arrow_icon_style} 
								onClick={ () => this.selectTool('normal')} >
							</div>
							<div 
								className={this.state.marker_icon_style} 
								onClick={ () => this.selectTool('marker')} >
							</div>
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
							<div className='member_list'>
								{'旅遊夥伴: '}
								{
									this.state.member_list.map((email, index) => {
										return (
											<div 
												className='member_email'
												key={index}
											>{email}</div>
										);
									})
								}
							</div>
							<div className='add_member_button_box'>
								<button
									className='add_member_submit_button'
									type='button'
									onClick={() => this.submitAddMember()}>加入</button>
								<button
									className='close_add_member_box'
									type='button'
									onClick={() => this.closeAddMember()}>關閉</button>
							</div>
						</div>
					</div>
					<div className='trip_chat_room'>
						<div className='chat_room_header'>
							<img className='chat_room_header_icon' style={{height: '24px'}} src={meetingIcon} alt={'meeting icon'} />
							<div className='chat_room_header_title'>討論桌</div>
						</div>
						<div className='chat_room_main'>
							<div className='chat_area'>
								{ this.state.chatBoxes.map( (chat,index) => {
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

// export default Google Map API;
export default GoogleApiWrapper({
	apiKey: ('AIzaSyAOrwA13NUBURp_YygxsGwTPHyCs4dEoOs')
})(Trip);