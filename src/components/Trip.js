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
import arrowIcon from '../../photo/arrow_icon_01.png';
import noteIcon from '../../photo/note_icon_01.png';
import penIcon from '../../photo/pen_icon_01.png';
import compassIcon from '../../photo/compass_icon_01.png';
import meetingIcon from '../../photo/meeting_icon_01.png';
import addMemberIcon from '../../photo/add_member_icon_01.png';

// import ReactDOM


class Trip extends Component {

	constructor(props) {
		super(props);
		this.state = {
			chatInputValue: ''
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange = (e) => {
		let inputName = e.target.value;
		console.log(this.state);
		this.setState({inputName: inputName});
	}

	exportFile = (e) => {

	}

	handleTripTitleInput = (e) => {

	}

	handleTripDateInput = (e) => {
		
	}

	handleTripLocationInput = (e) => {
		
	}

	handleChatInput = (e) => {

	}

	onEnterPress = (e) => {
		if(e.keyCode == 13 && e.shiftKey == false) {
			e.preventDefault();
			// this.myFormRef.submit();
		}
	}



	render() {
		return(
			<div>
				<header>
					<img className='header_logo' style={{height: '42px'}} src={logo} alt={'logo'} />
					<div className="header_title">TripChat</div>
					<img className='plan_icon' style={{height: '42px'}} src={planIcon} alt={'main page icon'} />
				</header>
				<div className="trip_container">
					<div className='trip_map_container'>
						<div className='trip_map'></div>
						<div className='trip_map_bar'>
							<div className='trip_title_style'>Trip：</div>
							<input 
								className='input_trip_title' 
								type="text" 
								name="trip_title" 
								placeholder='旅程標題' 
								onChange={ (e) => this.handleTripTitleInput(e) }
							/>
							<div className='trip_date_style'>日期：</div>
							<input 
								className='input_trip_date' 
								type="text" 
								name="trip_date" 
								placeholder='出發日期' 
								onChange={ (e) => this.handleTripDateInput(e) }
							/>
							<div className='trip_location_style'>地點：</div>
							<input 
								className='input_trip_location' 
								type="text" 
								name="trip_location" 
								placeholder='旅遊地點' 
								onChange={ (e) => this.handleTripLocationInput(e) }
							/>
							<div className='trip_map_bar_tool_box'>
								<img className='arrow_icon' style={{height: '32px'}} src={arrowIcon} alt={'arrow tool'} />
								<img className='note_icon' style={{height: '32px'}} src={noteIcon} alt={'note tool'} />
								<img className='pen_icon' style={{height: '32px'}} src={penIcon} alt={'pen tool'} />
								<img className='compass_icon' style={{height: '32px'}} src={compassIcon} alt={'circle tool'} />
							</div>
							<div className='addMemberButton'>
								<img className='add_member_icon' style={{height: '32px'}} src={addMemberIcon} alt={'add member button'} />
							</div>
							<button 
								className='export_button'
								type='button' 
								onClick={() => this.exportFile()}>匯出</button>
						</div>
					</div>
					<div className='trip_chat_room'>
						<div className='chat_room_header'>
							<img className='chat_room_header_icon' style={{height: '24px'}} src={meetingIcon} alt={'meeting icon'} />
							<div className='chat_room_header_title'>討論桌</div>
						</div>
						<div className='chat_room_main'>

							<div className="talk-bubble left-in">
							  <div className="talktext">
							    <p>真伯斯: 呵啥呵</p>
							  </div>
							</div>

							<div className="talk-bubble right-in">
							  <div className="talktext">
							    <p>伯斯: 呵屁呵</p>
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
	tripMember: PropTypes.any
}; 


export default Trip;
