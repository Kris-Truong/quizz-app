using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizAppBackend.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuizAppBackend.Models;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly QuizDbContext _context;

    public QuizController(QuizDbContext context)
    {
        _context = context;
    }

    // GET: api/quiz/questions
    [HttpGet("questions")]
    public async Task<ActionResult<List<Question>>> GetAllQuestions()
    {
        var questions = await _context.Questions.ToListAsync();
        return Ok(questions);
    }

    // POST: api/quiz/questions
    [HttpPost("questions")]
    public async Task<ActionResult<Question>> CreateQuestion([FromBody] Question newQuestion)
    {
        if (newQuestion == null)
            return BadRequest("Question data is required.");

        if (newQuestion.Options == null || newQuestion.Options.Count < 2)
            return BadRequest("A question must have at least two options.");

        if (newQuestion.CorrectAnswerIndex < 0 || newQuestion.CorrectAnswerIndex >= newQuestion.Options.Count)
            return BadRequest("CorrectAnswerIndex must point to a valid option.");

        _context.Questions.Add(newQuestion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAllQuestions), new { id = newQuestion.Id }, newQuestion);
    }

    // PUT: api/quiz/questions/{id}
    [HttpPut("questions/{id}")]
    public async Task<ActionResult<Question>> EditQuestion(int id, [FromBody] Question updatedQuestion)
    {
        var question = await _context.Questions.FindAsync(id);
        if (question == null)
            return NotFound("Question not found.");

        question.Text = updatedQuestion.Text;
        question.Options = updatedQuestion.Options;
        question.CorrectAnswerIndex = updatedQuestion.CorrectAnswerIndex;

        await _context.SaveChangesAsync();

        // Return the updated question object
        return Ok(question);
    }

    // DELETE: api/quiz/questions/{id}
    [HttpDelete("questions/{id}")]
    public async Task<ActionResult> DeleteQuestion(int id)
    {
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
