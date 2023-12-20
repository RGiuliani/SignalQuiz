namespace SignalQuiz.WebApp.DTOs
{
    public class SendAnswerRequest
    {
        public Guid PlayerId { get; set; }
        public Guid QuestionId { get; set; }
        public string Answer { get; set; }
    }
}
