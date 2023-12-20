namespace SignalQuiz.WebApp.DTOs
{
    public class QuizQuestionDTO
    {
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public int Index { get; set; }
        public string Question { get; set; }
    }
}
