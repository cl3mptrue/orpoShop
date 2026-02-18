using Microsoft.AspNetCore.Mvc;
using Shop.Application.Service;
using Shop.DTOs;

namespace Shop.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : Controller
{
    private readonly UserService _service;

    public UsersController(UserService service)
    {
        _service = service;
    }

    [HttpGet("GetAll")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _service.GetAllAsync();
        return Ok(users);
    }


    [HttpPost("register")]
    public async Task<IActionResult> RegisterUser([FromBody] CreateUserRequest request)
    {
        var user = await _service.RegisterUser(request.email, request.password, request.fio);
        return Ok(new { user.id, user.email, user.fio, user.isactive });
    }

    [HttpPut("{id}/delete")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        await _service.DeleteUser(id);
        return NoContent();
    }

    [HttpPut("{id}/actvate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        await _service.ActivateUser(id);
        return NoContent();
    }
}
