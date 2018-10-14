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
			
		};

	}

	render() {
		return(
			<div>
				<Route 
					exact path='/' 
					render={() => <Main	/>}
				/>
				<Route 
					path='/trip' 
					render={() => <Trip	/>}
				/>
			</div>
		);
	}

}

export default App;