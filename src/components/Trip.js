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

export class Trip extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mapInitPos: {
				lat: 25.042299,
				lng: 121.565182
			},
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
						<Map google={this.props.google} 
							initialCenter={this.state.mapInitPos}
							zoom={14}
						>

							<Marker onClick={this.onMarkerClick}
								name={'Current location'} />

							<InfoWindow onClose={this.onInfoWindowClose}>
								{/* <div>
									<h1>{this.state.selectedPlace.name}</h1>
								</div> */}
							</InfoWindow>
						</Map>
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
							<img className='arrow_icon' src={arrowIcon} alt={'arrow tool'} />
							<img className='note_icon' src={noteIcon} alt={'note tool'} />
							<img className='pen_icon' src={penIcon} alt={'pen tool'} />
							<img className='compass_icon' src={compassIcon} alt={'circle tool'} />
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

