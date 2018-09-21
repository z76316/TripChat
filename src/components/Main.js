import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// import CSS
import '../css/reset.css';
import '../css/app.css';
import '../css/main.css';

// import photo
import logo from '../../photo/logo_04_burned.png';
import planIcon from '../../photo/plan_icon_01.png';

// import ReactDOM
import MainProfile from './MainProfile';

class Main extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLogin: this.props.isLogin,
			loginOrSignup: 'signup',
			login_tab_style: 'login_tab active',
			singup_tab_style: 'login_tab',
			inputName: '',
			inputEmail: '',
			inputPassword: '',
			tripMember: '',
			tripTitle: '',
			tripDate: '',
			tripLocation: ''
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange = (e) => {
		let inputName = e.target.value;
		console.log(this.state);
		this.setState({inputName: inputName});
	}

	loginWithFB = (e) => {

	}

	loginWithGo = (e) => {

	}

	handleNameInput = (e) => {
		let inputName = e.target.value;
		// this.setState({inputName: inputName});
	}

	handleEmailInput = (e) => {
		let inputEmail = e.target.value;
		// this.setState({inputEmail: inputName});
	}

	handlePasswordInput = (e) => {
		let inputPassword = e.target.value;
		// this.setState({inputPassword: inputName});
	}

	render() {
		if(!this.state.isLogin) {
			return(
				<div className='login_page'>
					<div className='login_page_background'></div>

					<div className='login_container'>
						<div className='login_title_div'>
							<img className='login_logo' src={logo} alt={'logo'} />
							<div className="title">TripChat</div>
						</div>
						<div className="subtitle">編輯地圖，規劃旅途</div>
						<button 
							className='fb_login_button'
							type='button' 
							onClick={() => this.loginWithFB()}>使用 Facebook 登入</button>
						<button 
							className='go_login_button'
							type='button' 
							onClick={() => this.loginWithGo()}>使用 Google 登入</button>
						<div className='login_tab_container'>
							<span className={this.state.login_tab_style}>登入</span>
							<span className={this.state.singup_tab_style}>快速註冊</span>
						</div>
						
						<div className='login_input_container'>
							{	
								(this.state.loginOrSignup === 'signup') ? 
									(<input 
										className='input_name' 
										type="text" 
										name="user_name" 
										placeholder='請輸入姓名' 
										onChange={ (e) => this.handleNameInput(e) }
									/>) : 
									(null)
							}
							<input 
								className='input_email' 
								type="text" 
								name="email" 
								placeholder='example@xmail.com' 
								onChange={ (e) => this.handleEmailInput(e) }
							/>
							<input 
								className='input_password' 
								type="text" 
								name="password" 
								placeholder='請輸入密碼(至少 6 碼)' 
								onChange={ (e) => this.handlePasswordInput(e) }
							/>
							<button 
								className='submit_login_button'
								type='button' 
								onClick={() => this.submitLogin()}>送出</button>
						</div>

					</div>
				</div>
			);
		} else {
			return(
				<MainProfile />
			);
		}


		
	}

}

Main.propTypes = { 
	isLogin: PropTypes.any
}; 

export default Main;