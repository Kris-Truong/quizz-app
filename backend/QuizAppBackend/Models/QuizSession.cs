using System.ComponentModel.DataAnnotations;

namespace QuizAppBackend.Models
{
    public class QuizSession
    {
        [Key]
        public int QuizId { get; set; }

        public List<Question> Questions { get; set; } = new List<Question>(); // Initialize the list

        public int Score { get; set; }
        public bool IsCompleted { get; set; }
    }
}
