using SignalQuiz.WebApp.Models;

namespace SignalQuiz.WebApp.Hubs
{
    public interface IQuizHub
    {
        Task PlayerJoined(QuizPlayer player);
        Task StartQuiz(Quiz quiz);
        Task QuestionSent(QuizQuestion question);
        Task AnswerBooked(QuizQuestion question);
        Task AnswerSent(QuizQuestion question);
        Task AnswerValidated(QuizQuestion question);
        Task EndQuiz(Quiz quiz);
    }
}
