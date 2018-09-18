import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';

import App from '../presentational/puzzle_game/App';

class FormContainer extends Component {

	render() {
		return (
			<BrowserRouter>			
				<App />
			</BrowserRouter>
		);
	}
}

export default FormContainer;

const wrapper = document.getElementById('render_me');
wrapper ? ReactDOM.render(<FormContainer />, wrapper) : false;