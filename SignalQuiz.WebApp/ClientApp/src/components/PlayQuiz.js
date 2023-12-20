import React, { Component } from 'react';
import * as signalR from '@microsoft/signalr';

import { QuizHeader } from './QuizHeader';
import { QuizRanking } from './QuizRanking';
import { QuizQuestion } from './QuizQuestion';
import { QuizAnswer } from './QuizAnswer';

//const baseUrl = "https://localhost:7206/";  //LOCAL DEBUG
const baseUrl = "";  

export class PlayQuiz extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            quiz: null,
            currentPlayer: null,
            players: [],
            currentQuestion: null,
            questions: [],
        };
    }

    async joinQuiz(event)
    {
        event.preventDefault();

        const quizCode = event.target.code.value;
        const playerName = event.target.name.value;

        event.target.reset();

        const responseQuiz = await fetch(baseUrl + 'quiz?code=' + quizCode);

        if (!responseQuiz.ok)
        {
            alert(await responseQuiz.text());
            return;
        }

        const quiz = await responseQuiz.json();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId: quiz.id,
                name: playerName
            })
        };

        const responsePlayer = await fetch(baseUrl + 'quiz/join', requestOptions);

        if (!responsePlayer.ok)
        {
            alert(await responsePlayer.text());
            return;
        }

        const player = await responsePlayer.json();

        this.setState({
            ...this.state,
            currentPlayer: player,
            quiz: quiz,
        }, async function ()
        {
            this.connectToQuizHub();
            await this.refreshPlayers();
        });
    }

    connectToQuizHub()
    {
        const quizId = this.state.quiz.id;

        const connection = new signalR.HubConnectionBuilder().withUrl(baseUrl + "quizhub")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("PlayerJoined", async function (player)
        {
            console.log("PlayerJoined: " + player.name);
            await this.refreshPlayers()
        }.bind(this));
        connection.on("StartQuiz", async function (quiz)
        {
            console.log("StartQuiz");
            await this.refreshPlayers();
        }.bind(this));
        connection.on("QuestionSent", async function (question)
        {
            console.log("QuestionSent: " + question.question);

            this.setState({
                ...this.state,
                questions: this.state.questions.concat([question]),
                currentQuestion: question
            });
        }.bind(this));
        connection.on("AnswerBooked", async function (question)
        {
            console.log("AnswerBooked: " + question.bookedPlayerId);

            this.setState({
                ...this.state,
                currentQuestion: question
            });
        }.bind(this));
        connection.on("AnswerSent", async function (question)
        {
            console.log("AnswerSent: " + question.answer);

            this.setState({
                ...this.state,
                currentQuestion: question
            });

        }.bind(this));
        connection.on("AnswerValidated", async function (question)
        {
            console.log("AnswerValidated: " + question.isAnswerCorrect);

            this.setState({
                ...this.state,
                currentQuestion: question,
            }, this.refreshPlayers);
        }.bind(this));
        connection.on("EndQuiz", async function (quiz)
        {
            console.log("EndQuiz: " + quiz.state);

            this.setState({
                ...this.state,
                quiz: quiz,
            }, this.refreshPlayers);

        }.bind(this));

        connection.start().then(function ()
        {
            connection.invoke("PlayerJoin", quizId);
        });
    }

    async refreshPlayers()
    {
        const response = await fetch(baseUrl + 'quiz/players?quizId=' + this.state.quiz.id);
        const data = await response.json();

        const currentPlayer = data.find(p => p.id === this.state.currentPlayer.id);

        this.setState({
            ...this.state,
            players: data,
            currentPlayer: currentPlayer
        });
    }

    async bookQuestion()
    {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: this.state.currentPlayer.id,
                questionId: this.state.currentQuestion.id
            })
        };

        const response = await fetch(baseUrl + 'quiz/bookanswer', requestOptions);

        if (!response.ok)
        {
            alert(await response.text());
            return;
        }
    }

    async sendAnswer(event)
    {
        event.preventDefault();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: this.state.currentPlayer.id,
                questionId: this.state.currentQuestion.id,
                answer: event.target.answer.value,
            })
        };
        event.target.reset();

        const response = await fetch(baseUrl + 'quiz/sendanswer', requestOptions);

        if (!response.ok)
        {
            alert(await response.text());
            return;
        }
    }

    showLoading()
    {
        this.setState({
            ...this.state,
            loading: true
        });
    }
    hideLoading()
    {
        this.setState({
            ...this.state,
            loading: false
        });
    }

    render()
    {
        const showJoinForm = this.state.quiz === null;

        const showAnswerForm =
            this.state.currentQuestion !== null &&
            this.state.currentQuestion.bookedPlayerId === this.state.currentPlayer.id &&
            this.state.currentQuestion.answer === null;

        const isLoser = this.state.players.find(p => p.id === this.state.currentPlayer.id)?.score < 0;
        const isQuizEnded = this.state.quiz !== null && (this.state.quiz.state === 2 || this.state.quiz.state === 3);

        return (
            <div>
                <h1>Play Quiz</h1>
                {showJoinForm ?
                    <div>
                        <h2>Join Quiz</h2>
                        <form onSubmit={this.joinQuiz.bind(this)} className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Quiz Code: </label>
                                <input type="text" id="code" className="form-control"></input>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Player Name: </label>
                                <input type="text" id="name" className="form-control"></input>
                            </div>
                            <div className="col-md-6">
                                <button type="submit" className="btn btn-primary">Join</button>
                            </div>
                        </form>
                    </div>
                    :
                    <div>
                        <QuizHeader quiz={this.state.quiz} players={this.state.players} />
                        <QuizRanking players={this.state.players} />
                        {
                            isQuizEnded ? <></>
                                :
                            <div>
                                <QuizQuestion
                                    question={this.state.currentQuestion}
                                    players={this.state.players}
                                    buttonEnabledStatus={isLoser ? -1 : 0} buttonLabel="Book Answer"
                                    onButtonClicked={this.bookQuestion.bind(this)} />
                                {
                                    showAnswerForm ?
                                        <div>
                                            <h3>Send Answer</h3>
                                            <form onSubmit={this.sendAnswer.bind(this)} className="row g-3">
                                                <div className="col-md-12">
                                                    <label className="form-label">Answer: </label>
                                                    <input type="text" id="answer" className="form-control"></input>
                                                </div>
                                                <div className="col-md-12">
                                                    <button type="submit" className="btn btn-primary">Send Answer</button>
                                                </div>
                                            </form>
                                        </div>
                                        :
                                        <QuizAnswer
                                            question={this.state.currentQuestion}
                                            players={this.state.players}></QuizAnswer>
                                }
                            </div>
                        }
                    </div>
                }
                <div style={{ display: this.state.loading ? 'flex' : 'none' }} className="modalLoading">
                    <h2>Loading...</h2>
                </div>
            </div>
        );
    }
}
