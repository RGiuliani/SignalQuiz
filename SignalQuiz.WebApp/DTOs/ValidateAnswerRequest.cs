namespace SignalQuiz.WebApp.DTOs
{
    public class ValidateAnswerRequest
    {
        public Guid QuestionId { get; set; }
        public bool IsAnswerCorrect { get; set; }
    }
}
