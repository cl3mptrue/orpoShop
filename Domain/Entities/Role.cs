using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Shop.Domain.Entities;

[Table("roles")]
public class Role
{
    public int id { get; set; }
    public string name { get; set; } = null!;
    [JsonIgnore]
    public ICollection<User> Users { get; set; } = new List<User>();
}