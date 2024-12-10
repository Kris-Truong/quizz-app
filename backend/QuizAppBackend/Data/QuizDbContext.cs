using Microsoft.EntityFrameworkCore;
using QuizAppBackend.Models;

namespace QuizAppBackend.Data
{
    public class QuizDbContext : DbContext
    {
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuizSession> QuizSessions { get; set; }

        public QuizDbContext(DbContextOptions<QuizDbContext> options) : base(options)
        {
        }
    }
}