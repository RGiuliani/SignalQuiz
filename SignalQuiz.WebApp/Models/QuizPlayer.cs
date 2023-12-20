using System.ComponentModel.DataAnnotations;

namespace SignalQuiz.WebApp.Models
{
    public class QuizPlayer
    {
        [Key]
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public string Name { get; set; }
        public int Score { get; set; }
    }
}
