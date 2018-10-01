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

// Server ip
let Server_ip = 'http://localhost:9000';
// let Server_ip = 'http://52.89.137.222:9000';


class Main extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLogin: this.props.isLogin,
			loginOrSignup: 'login',
			login_tab_style: 'login_tab active',
			signup_tab_style: 'login_tab',
			inputName: '',
			inputEmail: '',
			inputPassword: '',
			tripMember: '',
			tripTitle: '',
			tripDate: '',
			tripLocation: ''
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

	loginWithFB = (e) => {

	}

	loginWithGo = (e) => {

	}

	changeToSignup = () => {
		this.setState({
			loginOrSignup: 'signup',
			login_tab_style: 'login_tab',
			signup_tab_style: 'login_tab active'
		});
	}

	changeToLogin = () => {
		this.setState({
			loginOrSignup: 'login',
			login_tab_style: 'login_tab active',
			signup_tab_style: 'login_tab'
		});
	}

	handleNameInput = (e) => {
		let inputName = e.target.value;
		this.setState({inputName: inputName});
	}

	handleEmailInput = (e) => {
		let inputEmail = e.target.value;
		this.setState({inputEmail: inputEmail});
	}

	handlePasswordInput = (e) => {
		let inputPassword = e.target.value;
		this.setState({inputPassword: inputPassword});
	}

	setLoginState = (data) => {
		localStorage.setItem('currUser', JSON.stringify(
			{
				name: data.name,
				email: data.email,
				provider: data.provider
			}));
	}

	submitLogin = () => {
		console.log(this.state.loginOrSignup);
		if(this.state.loginOrSignup === 'signup') {
			
			if(this.state.inputName && 
				this.state.inputEmail && 
				this.state.inputPassword) {

				let signup_data = {
					name: this.state.inputName,
					email: this.state.inputEmail,
					password: this.state.inputPassword,
					provider: 'email'
				};
				this.ajax('post', Server_ip+'/exe/accounts/signup', signup_data, (req) => {
					let result=JSON.parse(req.responseText);
					if(result.err) {
						alert(result.err);
					} else {
						this.setLoginState(signup_data);
						alert(result.message);
						this.props.handleIsLogin(true);
						this.setState({isLogin: true});
					}
				});
			} else {
				alert('尚有空白欄位！');
			}

		} else if(this.state.loginOrSignup === 'login') {
			if(this.state.inputEmail && 
				this.state.inputPassword) {

				let login_data = {
					email: this.state.inputEmail,
					password: this.state.inputPassword,
					provider: 'email'
				};
				console.log(login_data);
				this.ajax('post', Server_ip+'/exe/accounts/login', login_data, (req) => {
					let result=JSON.parse(req.responseText);
					if(result.err) {
						alert(result.err);
					} else {
						this.setLoginState(result.loginState);
						alert(result.message);
						this.props.handleIsLogin(true);
						this.setState({isLogin: true});
					}
				});
			} else {
				alert('尚有空白欄位！');
			}
		}
	}

	changeLoginState = (state) => {
		this.props.handleIsLogin(state);
		this.setState({isLogin: state});
	}

	checkLoginState = () => {
		if(!JSON.parse(localStorage.getItem('currUser')) || JSON.parse(localStorage.getItem('currUser')).length === 0) {
			this.setState({isLogin: false});
		} else {
			this.setState({isLogin: true});
		}
	}

	componentDidMount() {
		this.checkLoginState();
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
							<span 
								className={this.state.login_tab_style}
								onClick={() => this.changeToLogin()}>登入</span>
							<span 
								className={this.state.signup_tab_style}
								onClick={() => this.changeToSignup()}>快速註冊</span>
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
								type="password" 
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
				<MainProfile 
					changeLoginState={this.changeLoginState}/>
			);
		}


		
	}

}

Main.propTypes = { 
	isLogin: PropTypes.any,
	handleIsLogin: PropTypes.func
}; 

export default Main;