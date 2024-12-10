using System.ComponentModel.DataAnnotations;

namespace QuizAppBackend.Models
{
    public class Question
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty;

        [MinLength(4)]
        [MaxLength(4)]
        public List<string> Options { get; set; } = new List<string>();

        [Range(0, 3)]
        public int CorrectAnswerIndex { get; set; }
    }
}