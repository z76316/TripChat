import React, { Component } from 'react';

// import CSS
import '../css/reset.css';
import '../css/app.css';
import '../css/main.css';

// import photo
import logo from '../../photo/logo_04_burned.png';

// import ReactDOM
import MainProfile from './MainProfile';

// Server ip
import Server_ip from '../server_ip';


class Main extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLogin: '',
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

	submitLogin = () => {
		// regular expressions of email
		let emailRule = /^\w+\@[A-Za-z0-9]+\.[A-Za-z]+$/;

		if(this.state.loginOrSignup === 'signup') {
			
			if(!this.state.inputEmail.match(emailRule)) {
				alert('Email 格式不正確。');
			} else if(this.state.inputPassword.length < 6) {
				alert('密碼至少需 6 碼。');
			} else if(this.state.inputName && 
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
						alert(result.message);
						this.setState({isLogin: true});
					}
				});
			} else {
				alert('尚有空白欄位！');
			}

		} else if(this.state.loginOrSignup === 'login') {

			if(!this.state.inputEmail.match(emailRule)) {
				alert('Email 格式不正確。');
			} else if(this.state.inputEmail && 
				this.state.inputPassword) {

				let login_data = {
					email: this.state.inputEmail,
					password: this.state.inputPassword,
					provider: 'email'
				};
				this.ajax('post', Server_ip+'/exe/accounts/login', login_data, (req) => {
					let result=JSON.parse(req.responseText);
					if(result.err) {
						alert(result.err);
					} else {
						alert(result.message);
						this.setState({isLogin: true});
					}
				});
			} else {
				alert('尚有空白欄位！');
			}
		}
	}

	changeLoginState = (state) => {
		this.setState({isLogin: state});
	}

	checkLoginState = () => {
		this.ajax('get', Server_ip+'/exe/checkloginstate', '', (req) => {
			let result=JSON.parse(req.responseText);
			console.log('Main.js session ' + result.name + ' ' + result.email);
			if(result.isLogin) {
				this.setState({isLogin: true});
			} else {
				this.setState({isLogin: false});
			}
		});
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

export default Main;