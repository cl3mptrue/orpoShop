using Shop.Domain.Entities;

namespace Shop.Domain.interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task RegisterUser(User user);
    Task UpdateAsync(User user);
}
