import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';

import App from './components/App';

class Container extends Component {

	render() {
		return (
			<BrowserRouter>			
				<App />
			</BrowserRouter>
		);
	}
}

export default Container;

const wrapper = document.getElementById('render_me');
wrapper ? ReactDOM.render(<Container />, wrapper) : false;