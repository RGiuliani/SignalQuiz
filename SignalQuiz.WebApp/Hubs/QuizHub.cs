using Microsoft.AspNetCore.SignalR;
using SignalQuiz.WebApp.Models;
using System.Numerics;

namespace SignalQuiz.WebApp.Hubs
{
    public class QuizHub : Hub<IQuizHub>
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public async Task PlayerJoin(string quizId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, quizId);
        }
    }
}
