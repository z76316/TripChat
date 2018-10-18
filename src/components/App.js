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
import Server_ip from '../server_ip';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			
		};

	}

	render() {
		return(
			<div className='render_me_div'>
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