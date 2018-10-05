import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';

// import CSS
import '../css/reset.css';
import '../css/app.css';

// import photo
import logo from '../../photo/logo_04.png';

// import ReactDOM
import Main from './Main';
import Trip from './Trip';

// Server ip
// let Server_ip = 'http://localhost:9000';
let Server_ip = 'http://52.89.137.222:9000';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			// isLogin: false,
			loginOrSignup: 'signup',
			trip: [],
			tripTitle: '',
			tripDate: '',
			tripLocation: '',
			tripMember: []
		};

	}

	// ajax = (method, src, args, callback) => {
	// 	let req = new XMLHttpRequest();
	// 	if(method.toLowerCase() === 'post'){ 
	// 		// post through json args
	// 		req.open(method, src);
	// 		req.setRequestHeader('Content-Type', 'application/json');
	// 		req.onload = function(){
	// 			callback(this);
	// 		};
	// 		req.send(JSON.stringify(args));
	// 	}else{ 
	// 		// get through http args
	// 		req.open(method, src+'?'+args);
	// 		req.onload = function(){
	// 			callback(this);
	// 		};
	// 		req.send();
	// 	}
	// };

	loginWithFB = (e) => {

	}

	loginWithGo = (e) => {

	}

	// handleIsLogin = (state) => {
	// 	this.setState({isLogin: state});
	// }

	// checkLoginState = () => {
	// 	this.ajax('get', Server_ip+'/exe/checkloginstate', '', (req) => {
	// 		let result=JSON.parse(req.responseText);
	// 		console.log('App.js session' + result);
	// 		if(result.isLogin) {
	// 			this.setState({isLogin: true});
	// 		} else {
	// 			this.setState({isLogin: false});
	// 		}
	// 	});
	// }

	// componentDidMount() {
	// 	this.checkLoginState();
	// }

	render() {
		return(
			<div>
				<Route 
					exact path='/' 
					render={() => <Main
						// isLogin={this.state.isLogin}
						// handleIsLogin={this.handleIsLogin}
					/>}
				/>
				<Route 
					path='/trip' 
					render={() => <Trip
						tripTitle={'清水斷崖獨木舟'}
						tripDate={'2018.6.21'}
						tripLocation={'宜蘭'}
						tripMember={'伯斯、真博斯、賈伯斯'}
					/>}
				/>
			</div>
		);
	}

}

export default App;