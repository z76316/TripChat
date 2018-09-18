import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

class Ranking extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return(
			<div className="ranking_container">
				<div className="rank_head">
					<div className="number">Ranking</div>
					<div className="name">Name</div>
					<div className="step">Steps</div>
				</div>
				<div className="ranking_container">
					{ this.props.ranking.map( (rank, index) => {
						return (
							<div key={index} className="rank_head">
								<div 
									key={index+1} 
									className="number"
								>{rank.number}</div>
								<div 
									key={index+2} 
									className="name"
								>{rank.name}</div>
								<div 
									key={index+3} 
									className="step"
								>{rank.steps}</div>
							</div>
							
						);
					})}
				</div>
			</div>
		);
	}
	
};

Ranking.propTypes = { 
	handleNameInput: PropTypes.func,
	handleStartGameButton: PropTypes.func,
	ranking: PropTypes.any
}; 

export default Ranking;