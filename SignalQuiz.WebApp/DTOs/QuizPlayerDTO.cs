using System.ComponentModel.DataAnnotations;

namespace SignalQuiz.WebApp.DTOs
{
    public class QuizPlayerDTO
    {
        public Guid QuizId { get; set; }
        public string Name { get; set; }
        public int Score { get; set; }
    }
}
