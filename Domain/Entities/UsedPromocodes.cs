using Microsoft.EntityFrameworkCore;

namespace Shop.Domain.Entities;

public class UsedPromocodes
{
    public int userid { get; set; }
    public int promoid { get; set; }
}