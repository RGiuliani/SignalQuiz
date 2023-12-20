using Microsoft.EntityFrameworkCore;
using SignalQuiz.WebApp.Models;

namespace SignalQuiz.WebApp.Database
{
    public class QuizDatabaseContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(databaseName: "QuizDb");
        }

        public DbSet<Quiz> Quizs { get; set; }
        public DbSet<QuizPlayer> Players { get; set; }
        public DbSet<QuizQuestion> Questions { get; set; }

        public Quiz FindQuizByCode(string code)
        {
            return Quizs.FirstOrDefault(p => p.Code == code);
        }

        public int CountActiveQuizs()
        {
            return Quizs.Count(q => q.State == Quiz.StateEnum.Open || q.State == Quiz.StateEnum.InProgress);
        }

        public QuizPlayer FindPlayerByQuizName(Guid quizId, string name)
        {
            return Players.FirstOrDefault(p => p.QuizId == quizId && p.Name == name);
        }

        public QuizPlayer[] GetQuizPlayersByQuizId(Guid quizId)
        {
            return Players
                .Where(p => p.QuizId == quizId)
                .OrderByDescending(p => p.Score).ThenBy(p => p.Name)
                .ToArray();
        }
        public int CountQuizPlayers(Guid quizId)
        {
            return Players
                .Where(p => p.QuizId == quizId)
                .Count();
        }

        public QuizQuestion[] GetQuizQuestionsByQuizId(Guid quizId)
        {
            return Questions
                .Where(q => q.QuizId == quizId)
                .OrderBy(q => q.Index)
                .ToArray();
        }
    }
}
