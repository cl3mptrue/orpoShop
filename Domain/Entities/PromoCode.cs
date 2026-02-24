namespace Shop.Domain.Entities;

public class PromoCode
{
    public int id { get; set; }

    public string code { get; set; } = null!;

    public decimal amount { get; set; } 

    public bool is_used { get; set; } = false;

    public int? used_by_user_id { get; set; }
    public User? used_by_user { get; set; }

    public DateTime created_at { get; set; } = DateTime.UtcNow;
}