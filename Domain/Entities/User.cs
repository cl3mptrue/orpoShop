using System.Text.RegularExpressions;

namespace Shop.Domain.Entities;

public class User
{
    public int id { get; set; }
    public string email { get; set; }
    public string password { get; set; }
    public string fio { get; set; }
    public bool isactive { get; set; }

    public User(string email, string password, string fio, bool isactive = true)
    {
        var pattern = (@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{12,}$");
        var isValid = Regex.IsMatch(password, pattern);
        if (string.IsNullOrEmpty(email))
            throw new ArgumentException("Email cannot be null or empty.", nameof(email));
        if (string.IsNullOrEmpty(password) || !isValid)
            throw new ArgumentException("Password impolite.", nameof(password));
        if (string.IsNullOrEmpty(fio))
            throw new ArgumentException("First name cannot be null or empty.", nameof(fio));

        this.email = email;
        this.password = BCrypt.Net.BCrypt.HashPassword(password);
        this.fio = fio;
        this.isactive = isactive;
    }
    private User() { }

    public void Activate() => isactive = true;
    public void Deactivate() => isactive = false;
}
