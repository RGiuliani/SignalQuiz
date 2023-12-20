import React, { Component } from 'react';

export class QuizAnswer extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            question: null
        };
    }

    componentDidUpdate(prevProps)
    {
        if (this.props.question !== prevProps.question)
        {
            this.setState({
                question: this.props.question
            });
        }
    }

    render()
    {
        const showAnswer =
            this.state.question !== null &&
            this.state.question.answer !== null;
        const showButtonValidate =
            this.props.onValidate !== undefined &&
            this.state.question !== null &&
            this.state.question.isAnswerCorrect === null;

        let playerName = null;

        if (showAnswer)
        {
            playerName = this.props.players.find(p => p.id === this.state.question.bookedPlayerId)?.name;
        }

        return (
            showAnswer ?
                <div>
                    <h3>Answer</h3>
                    <div className="lead">Player: {playerName}</div>
                    <div className="lead">Answer: {this.state.question.answer}</div>
                    {showButtonValidate ?
                        <div>
                            <h4>Valid Answer ?</h4>
                            <div className="btn-group">
                                <button className="btn btn-success" onClick={() => this.props.onValidate(true)}>YES</button>
                                <button className="btn btn-danger" onClick={() => this.props.onValidate(false)}>NO</button>
                            </div>
                        </div>
                        :
                        <div>
                            {
                                this.state.question.isAnswerCorrect === null ? <div className="p-3 border rounded-3">Host is evaluating the answer...</div> :
                                this.state.question.isAnswerCorrect === false ? <div className="p-3 border rounded-3 bg-danger">WRONG!</div> :
                                this.state.question.isAnswerCorrect === true ? <div className="p-3 border rounded-3 bg-success">CORRECT!</div> :
                                <></>
                            }
                        </div>
                    }
                </div>
                :
                <div>
                </div>
        );
    }
}
