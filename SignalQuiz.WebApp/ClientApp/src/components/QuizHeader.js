import React, { Component } from 'react';

export class QuizHeader extends Component
{
    render()
    {
        const isQuizWon = this.props.quiz !== null && this.props.quiz.state === 2;
        const isQuizLost = this.props.quiz !== null && this.props.quiz.state === 3;

        let winningPlayer = "";

        if (isQuizWon)
        {
            winningPlayer = this.props.players.find(p => p.id === this.props.quiz.winnerPlayerId)?.name;
        }

        return (
            <div>
                <h2>Quiz Name: {this.props.quiz.title}</h2>
                <div className="lead">Quiz Code: {this.props.quiz.code}</div>
                {
                    isQuizWon ?
                        <h3 className="text-center">Quiz is won by {winningPlayer}!</h3>
                        :
                    isQuizLost ?
                            <h3 className="text-center">Quiz is lost!</h3>
                        :
                            <></>
                }
            </div>
        );
    }
}
