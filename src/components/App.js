import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';

// import CSS
import '../css/normalize.css';
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
			trip: [],
			tripTitle: '',
			tripDate: '',
			tripLocation: '',
			tripMember: []
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
		this.setState({inputName: inputName});
	}

	handleEmailInput = (e) => {
		let inputEmail = e.target.value;
		this.setState({inputEmail: inputName});
	}

	handlePasswordInput = (e) => {
		let inputPassword = e.target.value;
		this.setState({inputPassword: inputName});
	}

	render() {
		return(
			<div>
				<Route 
					path='/' 
					render={() => <Main
						isLogin={this.state.isLogin}
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