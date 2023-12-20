import React, { Component } from 'react';
import * as signalR from '@microsoft/signalr'

import { QuizHeader } from './QuizHeader';
import { QuizRanking } from './QuizRanking';
import { QuizQuestion } from './QuizQuestion';
import { QuizAnswer } from './QuizAnswer';

//const baseUrl = "https://localhost:7206/"; //LOCAL DEBUG
const baseUrl = "";

export class HostQuiz extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            quiz: null,
            questions: [],
            currentQuestion: null,
            players: [],
            loading: false
        };
    }

    async createQuiz(event)
    {
        this.showLoading();

        event.preventDefault();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: event.target.code.value,
                title: event.target.title.value
            })
        };
        event.target.reset();

        const response = await fetch(baseUrl + 'quiz', requestOptions);

        if (!response.ok)
        {
            alert(await response.text());
            this.hideLoading();
            return;
        }

        console.log(response);

        const data = await response.json();
        this.setState({ quiz: data }, this.connectToQuizHub);
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
            await this.refreshPlayers()
        }.bind(this));
        connection.on("QuestionSent", async function (question)
        {
            console.log("QuestionSent: " + question.question);

            this.setState({
                ...this.state,
                questions: this.state.questions.concat([question]),
                currentQuestion: question,
            });
        }.bind(this));
        connection.on("AnswerBooked", async function (question)
        {
            console.log("AnswerBooked: " + question.bookedPlayerId);

            this.setState({
                ...this.state,
                currentQuestion: question,
            });
        }.bind(this));
        connection.on("AnswerSent", async function (question)
        {
            console.log("AnswerSent: " + question.answer);

            this.setState({
                ...this.state,
                currentQuestion: question,
            });

        }.bind(this));
        connection.on("AnswerValidated", async function (question)
        {
            console.log("AnswerValidated: " + question.isAnswerCorrect);

            this.setState({
                ...this.state,
                currentQuestion: question,
            },this.refreshPlayers);
        }.bind(this));
        connection.on("EndQuiz", async function (quiz)
        {
            console.log("EndQuiz: " + quiz.state);

            this.setState({
                ...this.state,
                quiz: quiz,
            },this.refreshPlayers);
        }.bind(this));

        connection.start().then(function ()
        {
            connection.invoke("PlayerJoin", quizId)

        });

        this.hideLoading();
    }

    async refreshPlayers()
    {
        const response = await fetch(baseUrl + 'quiz/players?quizId=' + this.state.quiz.id);
        const data = await response.json();

        this.setState({
            ...this.state,
            players: data,
        });
    }

    async startQuiz()
    {
        this.showLoading();

        const requestOptions = {
            method: 'POST',
        };

        const response = await fetch(baseUrl + 'quiz/start?quizId=' + this.state.quiz.id, requestOptions);

        if (!response.ok)
        {
            alert(await response.text());
            this.hideLoading();
            return;
        }

        console.log(response);

        const data = await response.json();
        this.setState({
            ...this.state,
            quiz: data
        }, this.hideLoading);
    }

    async sendQuestion(event)
    {
        this.showLoading();

        event.preventDefault();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId: this.state.quiz.id,
                index: event.target.index.value,
                question: event.target.question.value
            })
        };
        event.target.reset();

        const response = await fetch(baseUrl + 'quiz/sendquestion', requestOptions);

        if (!response.ok)
        {
            alert(await response.text());
            this.hideLoading();
            return;
        }

        this.hideLoading();
    }

    async nextQuestion()
    {
        this.setState({
            ...this.state,
            currentQuestion: null
        });
    }

    async validateAnswer(isAnswerCorrect)
    {
        this.showLoading();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: this.state.currentQuestion.id,
                isAnswerCorrect: isAnswerCorrect
            })
        };

        const response = await fetch(baseUrl + 'quiz/validateanswer', requestOptions);

        if (!response.ok)
        {
            alert(await response.text());
            this.hideLoading();
            return;
        }

        this.hideLoading();
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
        const showCreateForm = this.state.quiz === null;
        const showStartButton = this.state.quiz !== null && this.state.quiz.state === 0;
        const showSendQuestionForm = this.state.currentQuestion === null || this.state.currentQuestion.isAnswerCorrect !== null;

        const isQuizEnded = this.state.quiz !== null && (this.state.quiz.state === 2 || this.state.quiz.state === 3);

        return (
            <div>
                <h1>Host Quiz</h1>
                {showCreateForm ?
                    <div>
                        <h2>Create a new Quiz</h2>
                        <form onSubmit={this.createQuiz.bind(this)} className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Code: </label>
                                <input type="text" id="code" className="form-control"></input>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Title: </label>
                                <input type="text" id="title" className="form-control"></input>
                            </div>
                            <div className="col-md-6">
                                <button type="submit" className="btn btn-primary">Create</button>
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
                                        {
                                            showStartButton ?
                                                <div>
                                                <button onClick={this.startQuiz.bind(this)} className="btn btn-primary">Start</button>
                                                </div>
                                                :
                                                (showSendQuestionForm ?
                                                    <div>
                                                        <h3>Send Question</h3>
                                                            <form onSubmit={this.sendQuestion.bind(this)} className="row g-3">
                                                            <input type="hidden" id="index" value={this.state.questions.length + 1}></input>
                                                            <div className="col-md-12">
                                                                <label className="form-label">Question {this.state.questions.length + 1}:</label>
                                                                <input type="text" id="question" className="form-control"></input>
                                                            </div>
                                                            <div className="col-md-12">
                                                                <button type="submit" className="btn btn-primary">Send</button>
                                                            </div>
                                                    </form>
                                                    </div>
                                                    :
                                                    <QuizQuestion
                                                        question={this.state.currentQuestion}
                                                        players={this.state.players}
                                                        buttonEnabledStatus={2} buttonLabel="Next Question"
                                                        onButtonClicked={this.nextQuestion.bind(this)} />
                                                )
                                        }
                                        <QuizAnswer
                                            question={this.state.currentQuestion}
                                            players={this.state.players}
                                            onValidate={this.validateAnswer.bind(this)}></QuizAnswer>
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
