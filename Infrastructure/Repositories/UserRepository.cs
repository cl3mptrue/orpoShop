
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Shop.Domain.Entities;
using Shop.Domain.interfaces;

namespace Shop.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }
    

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.users
            .Include(u => u.Role)
            .ToListAsync();
    }
    public async Task<User?> GetByIdAsync(int id) => await _context.users.FindAsync(id);
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.email == email);
    }

    public async Task RegisterUser(User user)
    {
        _context.users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _context.users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task<string> LoginUser(User user)
    {
        _context.users.Update(user);
        await _context.SaveChangesAsync();
        return "Авторизован";
    }

    public async Task<string> GenerateJwtToken(User user)
    {
        _context.users.Update(user);
        await _context.SaveChangesAsync();
        return "Авторизован";
    }
}
