import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

class Game extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return(
			<div className="game_container">
				<div className="step_count">Step Count: {this.props.steps}</div>
				<div className={this.props.boardStyle}>
					{ this.props.cells.map( (cell, index) => {
						if(cell.num === 0){
							return (
								<div 
									key={index} 
									className="cell cell-space" 
									x={cell.x} 
									y={cell.y} 
									style={cell.style}></div>

							);
						} else {
							return (
								<div 
									key={index} 
									className="cell" 
									x={cell.x} 
									y={cell.y} 
									style={cell.style}
									onClick={ () => this.props.handleClickCell(cell.num)}
								>{cell.num}</div>
							);
						}
						
					})}


				</div>
			</div>
		);
	}
};

Game.propTypes = { 
	cells: PropTypes.any,
	boardStyle: PropTypes.any,
	handleNameInput: PropTypes.func,
	handleStartGameButton: PropTypes.func,
	handleClickCell: PropTypes.func,
	steps: PropTypes.any
}; 

export default Game;
