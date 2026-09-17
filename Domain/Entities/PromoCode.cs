using Microsoft.EntityFrameworkCore;

namespace Shop.Domain.Entities;


public class PromoCode
{
    public int id { get; set; }

    public string code { get; set; } = null!;

    public decimal amount { get; set; } 

    public DateTime created_at { get; set; } = DateTime.UtcNow;
}