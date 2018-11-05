import React, { Component } from 'react';
import { Route } from 'react-router-dom';

// import CSS
import '../css/reset.css';
import '../css/app.css';

// import ReactDOM
import Main from './Main';
import Trip from './Trip';


const App = () => {
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
};

export default App;