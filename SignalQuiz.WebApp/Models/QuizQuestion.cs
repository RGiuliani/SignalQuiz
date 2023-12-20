using System.ComponentModel.DataAnnotations;

namespace SignalQuiz.WebApp.Models
{
    public class QuizQuestion
    {
        [Key]
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public int Index { get; set; }
        public string Question { get; set; }
        public DateTime EndDate { get; set; }
        public int LeftAttempts { get; set; }

        public Guid? BookedPlayerId { get; set; }
        public string? Answer { get; set; }
        public bool? IsAnswerCorrect { get; set; }


        [ConcurrencyCheck]
        public Guid Version { get; set; }
    }
}
