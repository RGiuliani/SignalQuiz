import React, { Component } from 'react';

export class QuizQuestion extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            timerValue: null,
            status: 0,
            question: this.props.question,
        };
    }

    componentDidMount()
    {
        setInterval(function ()
        {
            if (!this.state.question)
                return;

            let value = Math.ceil((new Date(this.state.question.endDate) - new Date()) / 1000);
            value = value <= 0 ? 0 : value;

            let status = 0;

            if (this.state.question.bookedPlayerId)
            {
                status = 1;

                if (this.state.status !== 1)
                {
                    this.setState({
                        ...this.state,
                        timerValue: value,
                        status: status,
                    });
                }
            }
            else if (value === 0)
            {
                status = 2;

                if (this.state.status !== 2)
                {
                    this.setState({
                        ...this.state,
                        timerValue: value,
                        status: status
                    });
                }
            }
            else
            {
                this.setState({
                    ...this.state,
                    timerValue: value,
                    status: status
                });
            }

        }.bind(this), 200);
    }

    componentDidUpdate(prevProps)
    {
        if (this.props.question !== prevProps.question)
        {
            this.setState({
                ...this.state,
                question: this.props.question
            });
        }
    }

    render()
    {
        const isBookedAnswer = this.state.status === 1;
        const isExpiredAsnwer = this.state.status === 2;

        const showButton = this.state.status === this.props.buttonEnabledStatus;

        const colorClass = 'p-3 border rounded-3' + (
                isBookedAnswer ? ' bg-warning' :
                isExpiredAsnwer ? ' bg-danger' :
                '');

        const playerName = isBookedAnswer ? this.props.players?.find(p => p.id === this.state.question.bookedPlayerId)?.name : null;
        let bookedPlayerInfo = '';

        if (playerName)
        {
            bookedPlayerInfo = 'booked by player ' + playerName;
        }

        return (
            this.state.question ?
                <div>
                    <h2>Question {this.state.question.index}: {this.state.question.question}</h2>
                    <h4 className={colorClass}>Timer {this.state.timerValue} sec {bookedPlayerInfo}</h4>
                    {
                        showButton ?
                            <button onClick={this.props.onButtonClicked} className="btn btn-primary">{this.props.buttonLabel}</button>
                            :
                            <></>
                    }
                </div>
                :
                <div>
                    Waiting for new question...
                </div>
        );
    }
}
