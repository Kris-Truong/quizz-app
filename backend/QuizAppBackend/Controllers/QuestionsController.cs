[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private static List<Question> questions = new List<Question>
    {
        new Question
        {
            Id = 1,
            Text = "What is ASP.NET Core?",
            Options = new List<string> { "Framework", "Library", "Tool" },
            CorrectAnswerIndex = 0
        },
        new Question
        {
            Id = 2,
            Text = "What is Entity Framework?",
            Options = new List<string> { "Database", "ORM", "UI Library" },
            CorrectAnswerIndex = 1
        }
    };

    private static Dictionary<int, QuizSession> sessions = new Dictionary<int, QuizSession>();
    private static int nextSessionId = 1;

    // GET: api/quiz/questions
    [HttpGet("questions")]
    public ActionResult<List<Question>> GetAllQuestions()
    {
        return Ok(questions);
    }

    // PUT: api/quiz/questions/{id}
    [HttpPut("questions/{id}")]
    public ActionResult EditQuestion(int id, [FromBody] Question updatedQuestion)
    {
        var question = questions.FirstOrDefault(q => q.Id == id);
        if (question == null)
            return NotFound("Question not found.");

        question.Text = updatedQuestion.Text;
        question.Options = updatedQuestion.Options;
        question.CorrectAnswerIndex = updatedQuestion.CorrectAnswerIndex;

        return Ok("Question updated successfully.");
    }

    // POST: api/quiz/start
    [HttpPost("start")]
    public ActionResult<int> StartQuiz()
    {
        var sessionId = nextSessionId++;
        sessions[sessionId] = new QuizSession
        {
            QuizId = sessionId,
            Questions = questions
        };

        return Ok(sessionId);
    }

    // GET: api/quiz/{sessionId}/questions
    [HttpGet("{sessionId}/questions")]
    public ActionResult<List<Question>> GetQuizQuestions(int sessionId)
    {
        if (!sessions.TryGetValue(sessionId, out var session))
            return NotFound("Session not found.");

        return Ok(session.Questions);
    }

    // POST: api/quiz/{sessionId}/submit
    [HttpPost("{sessionId}/submit")]
    public ActionResult<int> SubmitAnswers(int sessionId, [FromBody] Dictionary<int, int> userAnswers)
    {
        if (!sessions.TryGetValue(sessionId, out var session))
            return NotFound("Session not found.");

        foreach (var answer in userAnswers)
        {
            var question = session.Questions.FirstOrDefault(q => q.Id == answer.Key);
            if (question != null && question.CorrectAnswerIndex == answer.Value)
            {
                session.Score++;
            }
        }

        session.IsCompleted = true;
        return Ok(session.Score);
    }
}
