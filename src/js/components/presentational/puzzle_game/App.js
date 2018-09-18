import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';

import Game from './Game';
import Ranking from './Ranking';

import './css/normalize.css';
import './css/app.css';

const position = [ 
	[{left: '0px', top: '0px'},{left: '0px',	top: '100px'},{left: '0px', top: '200px'}],
	[{left: '100px',	top: '0px'},{left: '100px',	top: '100px'},{left: '100px', top: '200px'}],
	[{left: '200px', top: '0px'},{left: '200px', top: '100px'},{left: '200px',	top: '200px'}]
];

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			inputName: '',
			enterNameStyle: 'enter_name',
			boardStyle: 'board disable',
			ifInputDisable: false,
			steps: 0,
			cells: [
				{num: 1, x: 0, y: 0, style: position[0][0]},
				{num: 2, x: 1, y: 0, style: position[1][0]},
				{num: 3, x: 2, y: 0, style: position[2][0]},
				{num: 4, x: 0, y: 1, style: position[0][1]},
				{num: 5, x: 1, y: 1, style: position[1][1]},
				{num: 6, x: 2, y: 1, style: position[2][1]},
				{num: 7, x: 0, y: 2, style: position[0][2]},
				{num: 8, x: 1, y: 2, style: position[1][2]},
				{num: 0, x: 2, y: 2, style: position[2][2]}
			],
			ranking: [
				// { value: 'Clean the kitchen', done: false },
				// { value: 'Wash the car', done: true },
			]
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange = (e) => {
		let inputName = e.target.value;
		console.log(this.state);
		this.setState({inputName: inputName});
	}

	handleNameInput = (e) => {
		if(this.state.enterNameStyle !== 'enter_name') {
			return;
		}
		let inputName = e.target.value;
		console.log(this.state);
		this.setState({inputName: inputName});
	}

	handleStartGameButton = (e) => {
		console.log(this.state);
		if(!this.state.inputName) {
			return;
		}
		let cloneCells = this.state.cells;
		let currCell, spaceCell;
		cloneCells.forEach( (cell) => {
			if(cell.num === 8) {
				currCell = cell;
				console.log(currCell);
			}
			if(cell.num === 0) {
				spaceCell = cell;
				console.log(spaceCell);
			}
		});
		let tempX = currCell.x;
		let tempY = currCell.y;
		let tempStyle = currCell.style;
		cloneCells.forEach( (cell) => {
			if(cell.num === 8) {
				cell.x = spaceCell.x;
				cell.y = spaceCell.y;
				cell.style = spaceCell.style;
			}
			if(cell.num == 0) {
				cell.x = tempX;
				cell.y = tempY;
				cell.style = tempStyle;
			}
		});

		if(this.state.inputName){
			this.setState({cells: cloneCells, enterNameStyle: 'enter_name disable', ifInputDisable: true, boardStyle: 'board'});
		}
	}

	handleClickCell = (num) => {
		if(this.state.boardStyle !== 'board') {
			return;
		}
		console.log(this.state.cells);
		let cloneCells = this.state.cells;
		let currCell, spaceCell;
		cloneCells.forEach( (cell) => {
			if(cell.num === num) {
				currCell = cell;
				console.log(currCell);
			}
			if(cell.num === 0) {
				spaceCell = cell;
				console.log(spaceCell);
			}
		});

		if( (currCell.x+1 === spaceCell.x && currCell.y === spaceCell.y) 
			|| currCell.x === spaceCell.x && currCell.y-1 === spaceCell.y
			|| currCell.x-1 === spaceCell.x && currCell.y === spaceCell.y
			|| currCell.x === spaceCell.x && currCell.y+1 === spaceCell.y
		) {
			let tempX = currCell.x;
			let tempY = currCell.y;
			let tempStyle = currCell.style;
			cloneCells.forEach( (cell) => {
				if(cell.num === num) {
					cell.x = spaceCell.x;
					cell.y = spaceCell.y;
					cell.style = spaceCell.style;
				}
				if(cell.num == 0) {
					console.log(cell.num);
					cell.x = tempX;
					console.log(cell.x);
					cell.y = tempY;
					console.log(cell.y);
					cell.style = tempStyle;
					console.log(cell.style);
				}
			}); 
			console.log(this.state.cells);
			let steps = this.state.steps + 1;
			this.setState({cells: cloneCells, steps: steps});
		}
	}

	updateRanking() {
		if(localStorage.getItem('ranking')) {
			let ranking_array = JSON.parse(localStorage.getItem('ranking'));
			this.setState({ranking: ranking_array});
			console.log(this.state.ranking);
		}
	}

	componentDidUpdate() {
		if(this.state.inputName && this.state.steps > 0 && this.state.boardStyle === 'board') {
			let ifOkay = true;
			this.state.cells.forEach( (cell) => {
				if( (cell.num == 1 && cell.style !== position[0][0])
					|| (cell.num == 2 && cell.style !== position[1][0])
					|| (cell.num == 3 && cell.style !== position[2][0])
					|| (cell.num == 4 && cell.style !== position[0][1])
					|| (cell.num == 5 && cell.style !== position[1][1])
					|| (cell.num == 6 && cell.style !== position[2][1])
					|| (cell.num == 7 && cell.style !== position[0][2])
					|| (cell.num == 8 && cell.style !== position[1][2]) ) {
					ifOkay = false;
				}
			});
			if(ifOkay) {
				console.log(this.state.cells);
				let number = this.state.ranking.length+1;
				let ranking_array = [];
				let json_ranking = {
					number: number,
					name: this.state.inputName,
					steps: this.state.steps
				};
				if(!localStorage.getItem('ranking')) {
					ranking_array.push(json_ranking);
					localStorage.setItem('ranking', JSON.stringify(ranking_array));
				} else {
					ranking_array = JSON.parse(localStorage.getItem('ranking'));
					ranking_array.push(json_ranking);
					localStorage.setItem('ranking', JSON.stringify(ranking_array));
				}
				alert('Genius!');
				this.setState({boardStyle: 'board disable', ranking: ranking_array});
			}
		}
	}

	render() {
		let disable = this.state.ifInputDisable ? {'disabled' : 'disabled'} : {};
		return(
			<main>
				<nav>
					<Link to='/'><div className="header_button">Game</div></Link>
					<Link to='/ranking'><div className="header_button" onClick={ () => this.updateRanking()}>Ranling</div></Link>
				</nav>
				<Route 
					exact path="/" 
					render={() => 
						<header>
							<input 
								{...disable}
								className={this.state.enterNameStyle} 
								type="text" 
								name="enter_name" 
								placeholder='Enter Name' 
								onChange={ (e) => this.handleNameInput(e) }
							/>
							<button 
								className='start_game_button'
								type='button' 
								onClick={() => this.handleStartGameButton()}>Start Game</button>
						</header>
					}
				/>
				<Route 
					exact path="/" 
					render={() => <Game
						cells={this.state.cells} 
						boardStyle={this.state.boardStyle}
						handleNameInput={this.handleNameInput}
						handleStartGameButton={this.handleStartGameButton}
						handleClickCell={this.handleClickCell}
						steps={this.state.steps}
					/>}
				/>
				<Route 
					path="/ranking" 
					render={() => <Ranking 
						ranking={this.state.ranking}
						handleNameInput={this.handleNameInput}
					/>}
				/>
			</main>
		);
	}

}

export default App;