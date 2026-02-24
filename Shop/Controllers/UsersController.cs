using System.Security.Claims;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Shop.Application.Service;
using Shop.Domain.Entities;
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
    
    [Authorize(Roles = "admin")]
    [HttpGet("GetAllPromo")]
    public async Task<IActionResult> GetAllPromo()
    {
        var promos = await _service.GetAllAsync();
        return Ok(promos);
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
    
    
    [HttpPost("AuthUser")]
    public async Task<IActionResult> Auth([FromBody] LoginUserRequest request)
    {
        var token = await _service.LoginTask(request.email, request.password);

        return Ok(new { token });
    }
    
    [Authorize(Roles = "admin")]
    [HttpPost("create")]
    public async Task<IActionResult> CreatePromos(CreatePromoRequest request)
    {
        var promos = await _service.GeneratePromoCodesAsync(request.Count, request.Amount);
        return Ok(promos);
    }
    
    [HttpPost("activate")]
    public async Task<IActionResult> ActivatePromo(string code)
    {
        var userId = int.Parse(User.FindFirst("id").Value);

        var result = await _service.ActivatePromoCodeAsync(userId, code);

        if (!result)
            return BadRequest("Invalid promo");

        return Ok("Activated");
    }
}
