import React, { Component } from 'react';

export class Home extends Component {
  static displayName = Home.name;

  render() {
    return (
      <div>
        <h1>Welcome to SignalQuiz!</h1>
        <p>This webapp is implemented with:</p>
        <ul>
          <li><a href='https://get.asp.net/'>ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx'>C#</a> for server-side code</li>
          <li><a href='https://facebook.github.io/react/'>React</a> for client-side code</li>
          <li><a href='http://getbootstrap.com/'>Bootstrap</a> for layout and styling</li>
        </ul>

        <p>Here are some of the main features:</p>
            <ul>
                <li><strong>Realtime comunication</strong> Server can push messages to connected clients instantly with <strong>SignalR</strong> library. SignalR handles connection management automatically, and lets us broadcast messages to all connected clients simultaneously, like a chat room</li>
                <li><strong>ORM Framework</strong> Server is implemented as a data-oriented application with <strong>EF Core</strong> without having to worry about the type of database on which the architecture is based. An InMemory database is currently used, but it can easily be replaced with a SQLServer or similar.</li>
                <li><strong>Concurrency conflicts</strong> Using EF Core, record concurrency controls could be added for critical operations. Specifically for the <code>BookAnswer</code> endpoint, a check was added to ensure that only one player at a time can book the answer to the question </li>
            </ul>
            <h2>Instructions:</h2>
            <ul>
                <li>One player must be the quiz host. He must click on <strong>Host Quiz</strong> to create a new game, enter a Title and a Code that will allow other players to connect to the game and finally click on the <strong>Create</strong> button</li>
                <li>Players attending the quiz must click <strong>Play Quiz</strong>, enter the code provided by the host and a nickname for the game</li>
                <li>Once all players have connected, the Host player can start the game by clicking the <strong>Start</strong> button</li>
                <li>Host player then sends a question to the players with the <strong>Send</strong> button</li>
                <li>A 30-second timer starts and players must book the answer with the <strong>Book Answer</strong> button</li>
                <li>Only the player who booked first can enter an answer to be sent with the <strong>Send Answer</strong> button</li>
                <li>The Host player must then evaluate the answer with the <strong>Yes\No</strong> buttons. If it is correct, the player who sent the answer earns +1 point, otherwise the player is disqualified</li>
                <li>If the answer is wrong, other players can try to answer, but with a 10-second timer</li>
                <li>If the timer expires before a player books the answer, the Host player can move on to the next question with the <strong>Next Question</strong> button</li>
                <li>The Host player will continue to propose questions and the other players to earn points or be disqualified. The first player to earn 5 points wins the quiz. If, on the other hand, all players are disqualified, the quiz is lost.</li>
            </ul>
      </div>
    );
  }
}
