namespace SignalQuiz.WebApp.DTOs
{
    public class BookQuestionRequest
    {
        public Guid PlayerId { get; set; }
        public Guid QuestionId { get; set; }
    }
}
