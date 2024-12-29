using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizAppBackend.Data;
using QuizAppBackend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private const string FixedToken = "FixedToken123";
    private readonly QuizDbContext _context;

    public QuizController(QuizDbContext context)
    {
        _context = context;
    }


    [HttpPost("validate")]
    public IActionResult ValidateToken([FromHeader(Name = "Authorization")] string token)
    {
        // Check if the Authorization header is present
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new { message = "Authorization token is missing." });
        }

        // Remove the "Bearer" prefix, if it exists
        const string BearerPrefix = "Bearer ";
        if (token.StartsWith(BearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring(BearerPrefix.Length).Trim();
        }

        // Validate the token against the fixed token
        if (token == FixedToken)
        {
            return Ok(new { message = "Token is valid" });
        }

        return Unauthorized(new { message = "Invalid token" });
    }


    private bool IsAuthorized(HttpRequest request)
    {
        if (!request.Headers.TryGetValue("Authorization", out var providedToken))
            return false;

        return providedToken.ToString().Trim() == FixedToken;
    }

    // GET: api/quiz/questions
    [HttpGet("questions")]
    public async Task<ActionResult<List<Question>>> GetAllQuestions()
    {
        if (!IsAuthorized(Request))
            return Unauthorized(new { message = "Invalid or missing token." });

        var questions = await _context.Questions.ToListAsync();
        return Ok(questions);
    }

    // POST: api/quiz/questions
    [HttpPost("questions")]
    public async Task<ActionResult<Question>> CreateQuestion([FromBody] Question newQuestion)
    {
        if (!IsAuthorized(Request))
            return Unauthorized(new { message = "Invalid or missing token." });

        if (newQuestion == null)
            return BadRequest("Question data is required.");

        if (string.IsNullOrWhiteSpace(newQuestion.Text))
            return BadRequest("Question text is required.");

        if (newQuestion.Options == null || newQuestion.Options.Count != 4)
            return BadRequest("A question must have at least two options.");

        if (newQuestion.CorrectAnswerIndex < 0 || newQuestion.CorrectAnswerIndex >= newQuestion.Options.Count)
            return BadRequest("CorrectAnswerIndex must point to a valid option.");

        _context.Questions.Add(newQuestion);
        await _context.SaveChangesAsync();

        //CreatedAtAction is used to give a URL pointing to the newly created resource. In this case, url starts with the url of getallquestions plus the new id created
        //This is best practice to follow eventhough you may not need the backend to return the id or newQuestion contains when created
        return CreatedAtAction(nameof(GetAllQuestions), new { id = newQuestion.Id }, newQuestion);
    }

    // PUT: api/quiz/questions/{id}
    [HttpPut("questions/{id}")]
    public async Task<ActionResult<Question>> EditQuestion(int id, [FromBody] Question updatedQuestion)
    {
        if (!IsAuthorized(Request))
            return Unauthorized(new { message = "Invalid or missing token." });

        var question = await _context.Questions.FindAsync(id);
        if (question == null)
            return NotFound("Question not found.");

        question.Text = updatedQuestion.Text;
        question.Options = updatedQuestion.Options;
        question.CorrectAnswerIndex = updatedQuestion.CorrectAnswerIndex;

        await _context.SaveChangesAsync();

        return Ok(question);
    }

    // DELETE: api/quiz/questions/{id}
    [HttpDelete("questions/{id}")]
    public async Task<ActionResult> DeleteQuestion(int id)
    {
        if (!IsAuthorized(Request))
            return Unauthorized(new { message = "Invalid or missing token." });

        var question = await _context.Questions.FindAsync(id);
        if (question == null)
        {
            return NotFound("Question not found.");
        }

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync();

        return NoContent();
    }



// POST: api/quiz/start
[HttpPost("start")]
    public async Task<ActionResult<int>> StartQuiz()
    {
        var session = new QuizSession

        {
            //Guid.NewGuid(): A Guid (Globally Unique Identifier) used to ensure that each value is different across systems and sessions
            //GetHashCode(): This is a method that returns an integer representation of the Guid so it can be stored as key id in database
            QuizId = Guid.NewGuid().GetHashCode(),
            Questions = await _context.Questions.ToListAsync()
        };

        _context.QuizSessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(session.QuizId);
    }

    // GET: api/quiz/{sessionId}/questions
    [HttpGet("{sessionId}/questions")]
    public async Task<ActionResult<List<Question>>> GetQuizQuestions(int sessionId)
    {
        var session = await _context.QuizSessions
            .Include(s => s.Questions)
            .FirstOrDefaultAsync(s => s.QuizId == sessionId);

        if (session == null)
            return NotFound("Session not found.");

        return Ok(session.Questions);
    }

    // POST: api/quiz/{sessionId}/submit
    [HttpPost("{sessionId}/submit")]
    public async Task<ActionResult<int>> SubmitAnswers(int sessionId, [FromBody] Dictionary<int, int> userAnswers)
    {
        var session = await _context.QuizSessions
            .Include(s => s.Questions)
            .FirstOrDefaultAsync(s => s.QuizId == sessionId);

        if (session == null)
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
        await _context.SaveChangesAsync();

        return Ok(session.Score);
    }
}
