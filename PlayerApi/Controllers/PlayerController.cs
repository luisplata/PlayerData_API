using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlayerApi.Data;
using PlayerApi.Models;

namespace PlayerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayerController : ControllerBase
    {
        private readonly PlayerContext _context;

        public PlayerController(PlayerContext context)
        {
            _context = context;
        }

        [HttpGet("validate/{nickname}")]
        public async Task<ActionResult<bool>> ValidateNickname(string nickname)
        {
            var exists = await _context.Players.AnyAsync(p => p.Nickname == nickname);
            return !exists; // True si no existe, indicando que está disponible.
        }

        [HttpGet("{nickname}")]
        public async Task<ActionResult<int>> GetPlayerIdByNickname(string nickname)
        {
            var player = await _context.Players.FirstOrDefaultAsync(p => p.Nickname == nickname);
            if (player == null) return NotFound();
            return player.PlayerId;
        }

        [HttpPost]
        public async Task<ActionResult> AddPlayer([FromBody] Player player)
        {
            if (await _context.Players.AnyAsync(p => p.Nickname == player.Nickname))
            {
                return Conflict("Nickname already exists");
            }

            _context.Players.Add(player);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlayerIdByNickname), new { nickname = player.Nickname }, player);
        }
    }
}
