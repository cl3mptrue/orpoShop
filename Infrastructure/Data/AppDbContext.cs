using Microsoft.EntityFrameworkCore;
using Shop.Domain.Entities;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> users { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}
