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
import fbHead from '../../photo/fb_head.jpg';
import arrowIcon from '../../photo/arrow_icon_01.png';
import noteIcon from '../../photo/note_icon_01.png';
import penIcon from '../../photo/pen_icon_01.png';
import compassIcon from '../../photo/compass_icon_01.png';
import meetingIcon from '../../photo/meeting_icon_01.png';
import addMemberIcon from '../../photo/add_member_icon_01.png';

// import ReactDOM
import MyChatBox from './myChatBox';
import OthersChatBox from './othersChatBox';

// Server ip
// let Server_ip = 'http://localhost:9000';
let Server_ip = 'http://52.89.137.222:9000';

let socket;

let map, geocoder;

let markers = [];
let m1 = {
	marker_id: 1,
	location: {
		lat: 25.042299,
		lng: 121.565182	
	},
	content: '安安喔喔喔',
};
let m2 = {
	marker_id: 2,
	location: {
		lat: 25.542299,
		lng: 122.065182	
	},
	content: '安安喔喔喔2',
};
let m3 = {
	marker_id: 3,
	location: {
		lat: 25.042299,
		lng: 121.545182	
	},
	content: '安安喔喔喔3',
};
let currMarkers = [m1, m2, m3];


export class Trip extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mapInitPos: {
				lat: 25.042299,
				lng: 121.565182
			},
			currPos: '',
			tool: 'marker',
			markers: [],
			currMarkers: [],
			newMarkers: [],
			deleteMarkers: [],
			currTextarea: '',
			chatInputValue: '',
			currUser: '',
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

	handleTripTitleInput = (e) => {

	}

	handleTripDateInput = (e) => {
		
	}

	handleTripLocationInput = (e) => {
		
	}

	// Google map
	initMap = (mapInitPos) => {

		let address = '市政府轉運站';

		// set map's initial position by the location of this trip
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': address}, (results, status) => {
			if (status == 'OK') {
				map = new google.maps.Map(document.querySelector('.trip_map'), {
					center: results[0].geometry.location,
					zoom: 14
				});
			} else {
				console.log(status);
				map = new google.maps.Map(document.querySelector('.trip_map'), {
					center: mapInitPos,
					zoom: 14
				});
			}

			map.addListener('click', (e) => {                
				console.log(e.latLng);
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
			let marker_id = currMarkers[currMarkers.length - 1].marker_id + 1;
			let content = '寫下您的旅遊筆記~';
			let newAddedMarker = {
				marker_id: marker_id,
				location: location,
				content: content
			};
			currMarkers.push(newAddedMarker);
			this.addMarker(marker_id, location, content);

		} else if (this.state.tool === 'hide') {
			this.setMapOnAll(null);	
		}
		
	}

	// set all markers on map
	setMarkersOnMap = (currMarkers) => {
		if(markers.length) {
			currMarkers.map((marker, i) => {
				console.log(i);
				let marker_id = marker.marker_id;
				let location = marker.location;
				let content = marker.content;
					
				console.log('等等要addMarker囉');
				// console.log(marker_id);
				// console.log(location);
				// console.log(content);
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

	// Adds a marker to the map and push to the array.
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

	// Deletes a specific marker
	deleteMarkers = (marker_id) => {
		console.log(marker_id);
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
		this.deleteMarkers(marker_id);
		console.log(currMarkers);
		this.setMarkersOnMap(currMarkers);
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
				currUser: this.state.currUser
			});
			e.target.value = '';
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
				this.setState({currUser: result.name});
			} else {
				window.location = '/';
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

		let initPos = this.state.mapInitPos;
		this.initMap(initPos);

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
						{/* <Map google={this.props.google} 
							initialCenter={this.state.mapInitPos}
							onClick={this.getLatLng}
							zoom={14}
						>

							<Marker 
								onClick={this.onMarkerClick}
								name={'Current location'}
								draggable={true}
								onDragend={this.handleDragend}
								position={{lat: 25.55500, lng: 121.55500}}
							/>

							<InfoWindow 
								onClose={this.onInfoWindowClose}
								marker={this.state.activeMarker}
								position={{lat: 25.00000, lng: 121.00000}}
								visible={true}
								disableAutoPan={true}
							>
								<div>
									<h1>安安安安</h1>
								</div>
							</InfoWindow>
							<InfoWindow 
								onClose={this.onInfoWindowClose}
								marker={this.state.activeMarker}
								position={{lat: 26.00000, lng: 121.00000}}
								visible={true}
								disableAutoPan={true}
							>
								<div>
									<h1>安安安安安安222222222</h1>
								</div>
							</InfoWindow>
						</Map> */}
					</div>
					<div className='trip_map_bar'>
						<div className='bar_title_container'>
							<div className='trip_title_style'>Trip:</div>
							<input 
								className='input_trip_title' 
								type="text" 
								name="trip_title" 
								placeholder='旅程標題' 
								onChange={ (e) => this.handleTripTitleInput(e) }
							/>
						</div>
						<div className='bar_title_container'>
							<div className='trip_date_style'>日期:</div>
							<input 
								className='input_trip_date' 
								type="text" 
								name="trip_date" 
								placeholder='出發日期' 
								onChange={ (e) => this.handleTripDateInput(e) }
							/>
						</div>
						<div className='bar_title_container'>
							<div className='trip_location_style'>地點:</div>
							<input 
								className='input_trip_location' 
								type="text" 
								name="trip_location" 
								placeholder='旅遊地點' 
								onChange={ (e) => this.handleTripLocationInput(e) }
							/>
						</div>
						<div className='trip_map_bar_tool_box'>
							<img 
								className='arrow_icon' 
								src={arrowIcon} 
								alt={'arrow tool'}
								onClick={ () => this.selectTool('normal')} 
							/>
							<img 
								className='note_icon' 
								src={noteIcon} 
								alt={'note tool'} 
								onClick={ () => this.selectTool('marker')} 
							/>
							<img 
								className='pen_icon' 
								src={penIcon} 
								alt={'pen tool'} 
								onClick={ () => this.selectTool('food')} 
							/>
							<img 
								className='compass_icon' 
								src={compassIcon} 
								alt={'circle tool'} 
								onClick={ () => this.selectTool('delete')} 
							/>
						</div>
						<div className='addMemberButton'>
							<img className='add_member_icon' style={{height: '32px'}} src={addMemberIcon} alt={'add member button'} />
						</div>
						<button 
							className='export_button'
							type='button' 
							onClick={() => this.exportFile()}>匯出</button>
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
									console.log(chat.content);
									if(chat.who === this.state.currUser) {
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

								{/*<div className="talk_bubble">
								  <div className="talktext">
								    <p>真伯斯: 呵啥呵</p>
								  </div>
								</div>

								<div className="talk_bubble_self">
								  <div className="talktext">
								    <p>伯斯: 呵屁呵</p>
								  </div>
								</div>

								<div className="talk_bubble_self">
								  <div className="talktext">
								    <p>伯斯: 呵屁呵</p>
								  </div>
								</div>

								<div className="talk_bubble">
								  <div className="talktext">
								    <p>真伯斯: 呵啥呵</p>
								  </div>
								</div>*/}
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

