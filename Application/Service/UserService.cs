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
        user.roleid = 1;
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
    
    public async Task<User> LoginTask(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null) throw new Exception("User not found");
        if (user.isactive == false) throw new Exception("User is not active");
        var isValid = BCrypt.Net.BCrypt.Verify(password, user.password);
        if (!isValid) throw new Exception("Invalid email or password");
        return user;
    }
    

    public async Task<List<PromoCode>> GeneratePromoCodesAsync(int count, decimal amount)
    {
        var promos = new List<PromoCode>();

        for (int i = 0; i < count; i++)
        {
            promos.Add(new PromoCode
            {
                code = GenerateCode(),
                amount = amount,
            });
        }

        await _userRepository.AddPromoCodesAsync(promos);
        return promos;
    }
    public string GenerateCode()
    {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();

        string Part() =>
            new string(Enumerable.Range(0, 4)
                .Select(x => chars[random.Next(chars.Length)])
                .ToArray());

        return $"{Part()}-{Part()}-{Part()}";
    }
    
    
    public async Task<bool> ActivatePromoCodeAsync(int userId, string code)
    {
        var promo = await _userRepository.GetPromoByCodeAsync(code);

        if (promo == null)
            throw new Exception("Promocode not found");

        var alreadyUsed = await _userRepository.IsPromoUsedAsync(userId, promo.id);

        if (alreadyUsed)
            throw new Exception("Already used");

        await _userRepository.UsePromocodesAsync(new UsedPromocodes
        {
            userid = userId,
            promoid = promo.id
        });
        
        var balance = await _userRepository.GetUserBalanceAsync(userId);

        if (balance == null)
        {
            balance = new UserBalance
            {
                user_id = userId,
                bonus_balance = promo.amount
            };

            await _userRepository.AddUserBalanceAsync(balance);
        }
        else
        {
            balance.bonus_balance += promo.amount;
        }

        await _userRepository.SaveChangesAsync();
        return true;
    }
}
