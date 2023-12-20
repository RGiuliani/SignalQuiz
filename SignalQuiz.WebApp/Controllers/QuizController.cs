using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SignalQuiz.WebApp.Database;
using SignalQuiz.WebApp.DTOs;
using SignalQuiz.WebApp.Hubs;
using SignalQuiz.WebApp.Models;

namespace SignalQuiz.WebApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly IHubContext<QuizHub, IQuizHub> _hubContext;
        private readonly QuizDatabaseContext _dbContext;

        public QuizController(IHubContext<QuizHub, IQuizHub> hubContext, QuizDatabaseContext dbContext) 
        {
            _hubContext = hubContext;
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> Get(Guid? id, string? code)
        {
            if(id.HasValue)
            {
                var quiz = _dbContext.Quizs.Find(id);
                if(quiz == null)
                {
                    return BadRequest($"Quiz with Id {id} does not exist");
                }

                return Ok(quiz);
            }
            else if(!string.IsNullOrEmpty(code))
            {
                var quiz = _dbContext.FindQuizByCode(code);
                if (quiz == null)
                {
                    return BadRequest($"Quiz with Code {code} does not exist");
                }
                return Ok(quiz);
            }
            else
            {
                return Ok(_dbContext.Quizs.ToArray());
            }

        }

        [HttpPost]
        public async Task<IActionResult> Post(QuizDTO data)
        {
            if (string.IsNullOrEmpty(data.Code) || string.IsNullOrEmpty(data.Title))
            {
                return BadRequest($"Quiz code and title are required");
            }

            var check = _dbContext.FindQuizByCode(data.Code);
            if(check != null)
            {
                return BadRequest($"Quiz with code {data.Code} already exist");
            }

            var activeQuizCount = _dbContext.CountActiveQuizs();
            if (activeQuizCount >= 50)
            {
                return BadRequest($"Too manny open Quiz (count: {activeQuizCount}), try again later");
            }

            Quiz en = new Quiz();
            en.Id = Guid.NewGuid();
            en.Code = data.Code;
            en.Title  = data.Title;

            _dbContext.Quizs.Add(en);
            _dbContext.SaveChanges();

            return Ok(en);
        }

        [HttpPost("Join")]
        public async Task<IActionResult> Join(QuizPlayerDTO data)
        {
            if (string.IsNullOrEmpty(data.Name))
            {
                return BadRequest($"Player name is required");
            }

            var quiz = _dbContext.Quizs.Find(data.QuizId);

            if (quiz == null)
            {
                return BadRequest($"Quiz with Id {data.QuizId} does not exist");
            }

            if(quiz.State != Quiz.StateEnum.Open)
            {
                return BadRequest($"Quiz has started, no other players can join");
            }

            var quizPlayersCount = _dbContext.CountQuizPlayers(quiz.Id);
            if (quizPlayersCount >= 50)
            {
                return BadRequest($"Too manny open Player for this Quiz (count: {quizPlayersCount})");
            }

            var player = _dbContext.FindPlayerByQuizName(data.QuizId, data.Name);
            if(player != null)
            {
                return BadRequest($"User {data.Name} for the Quiz already exist");
            }

            player = new QuizPlayer();
            player.Id = Guid.NewGuid();
            player.Name = data.Name;
            player.QuizId = data.QuizId;

            _dbContext.Players.Add(player);
            _dbContext.SaveChanges();

            await _hubContext.Clients.Group(data.QuizId.ToString()).PlayerJoined(player);

            return Ok(player);
        }

        [HttpGet("Players")]
        public async Task<IActionResult> GetPlayers(Guid quizId)
        {
            var quiz = _dbContext.Quizs.Find(quizId);
            if (quiz == null)
            {
                return BadRequest($"Quiz with Id {quizId} does not exist");
            }

            var players = _dbContext.GetQuizPlayersByQuizId(quizId);

            return Ok(players);
        }

        [HttpPost("Start")]
        public async Task<IActionResult> StartQuiz(Guid quizId)
        {
            var quiz = _dbContext.Quizs.Find(quizId);

            if (quiz == null)
            {
                return BadRequest($"Quiz with Id {quizId} does not exist");
            }

            if(quiz.State != Quiz.StateEnum.Open)
            {
                return BadRequest($"Quiz has aleready started");
            }

            quiz.State = Quiz.StateEnum.InProgress;

            _dbContext.SaveChanges();

            await _hubContext.Clients.Group(quizId.ToString()).StartQuiz(quiz);

            return Ok(quiz);
        }

        [HttpPost("SendQuestion")]
        public async Task<IActionResult> SendQuestion(QuizQuestionDTO data)
        {
            var quiz = _dbContext.Quizs.Find(data.QuizId);

            if(quiz == null)
            {
                return BadRequest($"Quiz with Id {data.QuizId} does not exist");
            }

            var question = new QuizQuestion();
            question.QuizId = data.QuizId;
            question.Index = data.Index;
            question.EndDate = DateTime.UtcNow.AddSeconds(30);
            question.LeftAttempts = 2;
            question.Question = data.Question;
            question.Version = Guid.NewGuid();

            _dbContext.Questions.Add(question);
            _dbContext.SaveChanges();

            await _hubContext.Clients.Group(data.QuizId.ToString()).QuestionSent(question);

            return Ok(question);
        }

        [HttpGet("Questions")]
        public async Task<IActionResult> GetQuestions(Guid quizId)
        {
            var quiz = _dbContext.Quizs.Find(quizId);
            if (quiz == null)
            {
                return BadRequest($"Quiz with Id {quizId} does not exist");
            }

            var questions = _dbContext.GetQuizQuestionsByQuizId(quizId);

            return Ok(questions);
        }

        [HttpPost("BookAnswer")]
        public async Task<IActionResult> BookAnswer(BookQuestionRequest data)
        {
            var player = _dbContext.Players.Find(data.PlayerId);
            var question = _dbContext.Questions.Find(data.QuestionId);

            if (player == null)
            {
                return BadRequest($"Player with Id {data.PlayerId} does not exist");
            }
            if(player.Score < 0)
            {
                return BadRequest($"Player lost, cannot book other answers");
            }

            if (question == null)
            {
                return BadRequest($"Question with Id {data.QuestionId} does not exist");
            }
            if (question.BookedPlayerId.HasValue)
            {
                return BadRequest($"Question is already booked");
            }

            if (question.EndDate < DateTime.UtcNow)
            {
                return BadRequest($"Question has expired");
            }

            question.BookedPlayerId = data.PlayerId;

            question.Version = Guid.NewGuid();

            try
            {
                _dbContext.SaveChanges();
            }
            catch(DbUpdateConcurrencyException ex)
            {
                return BadRequest($"Question is already booked");
            }

            await _hubContext.Clients.Group(question.QuizId.ToString()).AnswerBooked(question);

            return Ok(question);
        }

        [HttpPost("SendAnswer")]
        public async Task<IActionResult> SendAnswer(SendAnswerRequest req)
        {
            var player = _dbContext.Players.Find(req.PlayerId);
            var question = _dbContext.Questions.Find(req.QuestionId);

            if (player == null)
            {
                return BadRequest($"Player with Id {req.PlayerId} does not exist");
            }
            if (question == null)
            {
                return BadRequest($"Question with Id {req.QuestionId} does not exist");
            }

            if (question.BookedPlayerId != req.PlayerId)
            {
                var bookedPlayer = _dbContext.Players.Find(question.BookedPlayerId);
                if (bookedPlayer == null)
                {
                    return BadRequest($"Question is already booked");
                }
                return BadRequest($"Question is already booked by player {bookedPlayer.Name}");
            }

            question.Answer = req.Answer;

            _dbContext.SaveChanges();

            await _hubContext.Clients.Group(question.QuizId.ToString()).AnswerSent(question);

            return Ok(question);
        }

        [HttpPost("ValidateAnswer")]
        public async Task<IActionResult> ValidateAnswer(ValidateAnswerRequest req)
        {
            var question = _dbContext.Questions.Find(req.QuestionId);

            if (question == null)
            {
                return BadRequest($"Question with Id {req.QuestionId} does not exist");
            }

            var player = _dbContext.Players.Find(question.BookedPlayerId);
            if (player == null)
            {
                return BadRequest($"Player with Id {question.BookedPlayerId} does not exist");
            }

            if (req.IsAnswerCorrect)
            {
                question.IsAnswerCorrect = true;
                
                player.Score = player.Score + 1;
            }
            else
            {
                player.Score = -1;

                question.LeftAttempts = question.LeftAttempts - 1;

                if (question.LeftAttempts > 0)
                {
                    question.BookedPlayerId = null;
                    question.Answer = null;

                    question.EndDate = DateTime.UtcNow.AddSeconds(10);
                }
                else
                {
                    question.IsAnswerCorrect = false;
                }
            }

            _dbContext.SaveChanges();

            await _hubContext.Clients.Group(question.QuizId.ToString()).AnswerValidated(question);

            if (player.Score >= 5)
            {
                var quiz = _dbContext.Quizs.Find(question.QuizId);

                if (quiz == null)
                {
                    return BadRequest($"Quiz with Id {question.QuizId} does not exist");
                }

                quiz.State = Quiz.StateEnum.Won;
                quiz.WinnerPlayerId = player.Id;

                _dbContext.SaveChanges();
                await _hubContext.Clients.Group(question.QuizId.ToString()).EndQuiz(quiz);
            }
            else if(req.IsAnswerCorrect == false)
            {
                var players = _dbContext.GetQuizPlayersByQuizId(question.QuizId);

                if(players.All(p => p.Score < 0))
                {
                    var quiz = _dbContext.Quizs.Find(question.QuizId);

                    if (quiz == null)
                    {
                        return BadRequest($"Quiz with Id {question.QuizId} does not exist");
                    }

                    quiz.State = Quiz.StateEnum.Lost;

                    _dbContext.SaveChanges();
                    await _hubContext.Clients.Group(question.QuizId.ToString()).EndQuiz(quiz);
                }
            }

            return Ok(question);
        }
    }
}