namespace Shop.Domain.Entities;

public class UserBalance
{
    public int id { get; set; }

    public int user_id { get; set; }
    public User User { get; set; } = null!;

    public decimal total_deposited { get; set; } = 0; 
    public static decimal bonus_balance { get; set; } = 0;  
}