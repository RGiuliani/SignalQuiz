using System.ComponentModel.DataAnnotations;

namespace SignalQuiz.WebApp.Models
{
    public class Quiz
    {
        [Key]
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public StateEnum State { get; set; }
        public Guid? WinnerPlayerId { get; set; }

        public enum StateEnum
        {
            Open = 0,
            InProgress = 1,
            Won = 2,
            Lost = 3
        }
    }
}
