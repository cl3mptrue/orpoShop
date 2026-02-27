using Shop.Domain.Entities;

namespace Shop.Domain.interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
  
    Task RegisterUser(User user);
    Task UpdateAsync(User user);
    Task<PromoCode> GetPromoByCodeAsync(string code);
    Task AddPromoCodesAsync(List<PromoCode> codes);
    Task UsePromocodesAsync(UsedPromocodes codes);
    Task<bool> IsPromoUsedAsync(int userId, int promoId);
    Task<UserBalance?> GetUserBalanceAsync(int userId);
    Task AddUserBalanceAsync(UserBalance balance);
    Task SaveChangesAsync();
}

