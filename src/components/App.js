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


class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLogin: false,
			loginOrSignup: 'signup',
			trip: [],
			tripTitle: '',
			tripDate: '',
			tripLocation: '',
			tripMember: []
		};

	}

	loginWithFB = (e) => {

	}

	loginWithGo = (e) => {

	}

	handleIsLogin = (state) => {
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
		return(
			<div>
				<Route 
					exact path='/' 
					render={() => <Main
						isLogin={this.state.isLogin}
						handleIsLogin={this.handleIsLogin}
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