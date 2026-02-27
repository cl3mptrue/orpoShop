
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
    public async Task UpdatePromoAsync(PromoCode promoCode)
    {
        _context.promocodes.Update(promoCode);
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
    
    public async Task<PromoCode> GetPromoByCodeAsync(string code)
    {
        return await _context.promocodes
            .FirstOrDefaultAsync(p => p.code == code);
    }

    public async Task AddPromoCodesAsync(List<PromoCode> codes)
    {
        await _context.promocodes.AddRangeAsync(codes);
        await _context.SaveChangesAsync();
    }

    public async Task UsePromocodesAsync(UsedPromocodes id)
    {
        await _context.used_promocodes.AddAsync(id);
        await _context.SaveChangesAsync();
    }
    
    public async Task<bool> IsPromoUsedAsync(int userId, int promoId)
    {
        return await _context.used_promocodes
            .AnyAsync(x => x.userid == userId && x.promoid == promoId);
    }
    public async Task<UserBalance?> GetUserBalanceAsync(int userId)
    {
        return await _context.user_balance
            .FirstOrDefaultAsync(x => x.user_id == userId);
    }
    public async Task AddUserBalanceAsync(UserBalance balance)
    {
        await _context.user_balance.AddAsync(balance);
    }
    
    public async Task SaveChangesAsync()
    {
         _context.SaveChangesAsync();
    }
}
