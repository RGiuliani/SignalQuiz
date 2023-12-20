import React, { Component } from 'react';

export class QuizRanking extends Component
{
    static renderPlayersTable(players)
    {
        return (
            <table className='table'>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((p, index) =>
                        <tr key={index}>
                            <td>{p.name}</td>
                            <td>{p.score >= 0 ? p.score : <span className="p-1 border rounded-3 bg-danger">DISQUALIFIED</span>}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render()
    {
        return (
            <div>
                <h3>Players Score</h3>
                {
                    this.props.players.length === 0 ?
                        <label>No players joined the quiz</label>
                        :
                        QuizRanking.renderPlayersTable(this.props.players)
                }
            </div>
        );
    }
}
