using Microsoft.EntityFrameworkCore;
using Shop.Domain.Entities;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> users { get; set; }
    public DbSet<PromoCode> promocodes { get; set; }
    public DbSet<UserBalance> user_balance { get; set; }
    public DbSet<UsedPromocodes> used_promocodes { get; set; }
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PromoCode>()
            .HasIndex(p => p.code)
            .IsUnique();
        modelBuilder.Entity<UsedPromocodes>()
            .HasKey(x => new { x.userid, x.promoid });
        modelBuilder.Entity<UserBalance>()
            .HasOne(ub => ub.User)
            .WithMany()
            .HasForeignKey(ub => ub.user_id);
    }
}
