using Shop.Domain.Entities;
using Shop.Domain.interfaces;

namespace Shop.Application.Service;

public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<User>> GetAllAsync() => await _userRepository.GetAllAsync();

    public async Task<User> RegisterUser(string email, string password, string fio)
    {
        var user = new User(email, password, fio);
        await _userRepository.RegisterUser(user);
        return user;
    }

    public async Task DeleteUser(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new Exception("User not found");

        user.Deactivate();
        _userRepository.UpdateAsync(user);
    }

    public async Task ActivateUser(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new Exception("User not found");

        user.Activate();
        _userRepository.UpdateAsync(user);
    }
  
}
