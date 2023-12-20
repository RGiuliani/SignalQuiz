Welcome to SignalQuiz!
======================

This webapp is implemented with:

*   [ASP.NET Core](https://get.asp.net/) and [C#](https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx) for server-side code
*   [React](https://facebook.github.io/react/) for client-side code
*   [Bootstrap](http://getbootstrap.com/) for layout and styling

Here are some of the main features:

*   **Realtime comunication** Server can push messages to connected clients instantly with **SignalR** library. SignalR handles connection management automatically, and lets us broadcast messages to all connected clients simultaneously, like a chat room
*   **ORM Framework** Server is implemented as a data-oriented application with **EF Core** without having to worry about the type of database on which the architecture is based. An InMemory database is currently used, but it can easily be replaced with a SQLServer or similar.
*   **Concurrency conflicts** Using EF Core, record concurrency controls could be added for critical operations. Specifically for the `BookAnswer` endpoint, a check was added to ensure that only one player at a time can book the answer to the question

Instructions:
-------------

*   One player must be the quiz host. He must click on **Host Quiz** to create a new game, enter a Title and a Code that will allow other players to connect to the game and finally click on the **Create** button
*   Players attending the quiz must click **Play Quiz**, enter the code provided by the host and a nickname for the game
*   Once all players have connected, the Host player can start the game by clicking the **Start** button
*   Host player then sends a question to the players with the **Send** button
*   A 30-second timer starts and players must book the answer with the **Book Answer** button
*   Only the player who booked first can enter an answer to be sent with the **Send Answer** button
*   The Host player must then evaluate the answer with the **Yes\\No** buttons. If it is correct, the player who sent the answer earns +1 point, otherwise the player is disqualified
*   If the answer is wrong, other players can try to answer, but with a 10-second timer
*   If the timer expires before a player books the answer, the Host player can move on to the next question with the **Next Question** button
*   The Host player will continue to propose questions and the other players to earn points or be disqualified. The first player to earn 5 points wins the quiz. If, on the other hand, all players are disqualified, the quiz is lost.

#### TODO:

*   **Code cleanup** Break down functionality of some React components into multiple simple and specialized components
*   **Handling specific scenarios** Add procedures to completely manage the process of a match (ex: disconnection of players during the match, timeout for responses booked but not sent, ...)
*   **Server Side Validation** Add additional server-side validation checks (ex: max number of players per game, max number of games in progress, ...)
*   **Authentication** add user management with signin\\signup
*   **Improve Mobile experience** Found bugs in some functionality from mobile (ex: validate answer)