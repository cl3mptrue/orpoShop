using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Shop.Domain.Entities;
using Shop.Domain.interfaces;
using static System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace Shop.Application.Service;

public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<User>> GetAllAsync() => await _userRepository.GetAllAsync();
    
    public async Task<User?> GetByIdAsync(int id) => await _userRepository.GetByIdAsync(id);

    public async Task<User> RegisterUser(string email, string password, string fio)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser != null) throw new Exception("User already exists.");
        
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
    
    public async Task<string> LoginTask(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null) throw new Exception("User not found");
        if (user.isactive == false) throw new Exception("User is not active");
        var isValid = BCrypt.Net.BCrypt.Verify(password, user.password);
        if (!isValid) throw new Exception("Invalid email or password");
        var userId = user.id;
        return GenerateJwtToken(user);
    }
    

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
            new Claim(ClaimTypes.Email, user.email),
            new Claim(ClaimTypes.Role, "User")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("SOME_SUPER_SECRET_KEY_1234567890"));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
