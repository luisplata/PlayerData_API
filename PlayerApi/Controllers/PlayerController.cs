using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlayerApi.Data;
using PlayerApi.Models;
using Microsoft.Extensions.Logging;

namespace PlayerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayerController : ControllerBase
    {
        private readonly PlayerContext _context;
        private readonly ILogger<PlayerController> _logger;

        public PlayerController(PlayerContext context, ILogger<PlayerController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("validate/{nickname}")]
        public async Task<ActionResult<bool>> ValidateNickname(string nickname)
        {
            _logger.LogInformation("Validating nickname: {Nickname}", nickname);
            var exists = await _context.Players.AnyAsync(p => p.Nickname == nickname);
            return !exists; // True si no existe, indicando que está disponible.
        }

        [HttpGet("{nickname}")]
        public async Task<ActionResult<int>> GetPlayerIdByNickname(string nickname)
        {
            _logger.LogInformation("Getting player ID for nickname: {Nickname}", nickname);
            var player = await _context.Players.FirstOrDefaultAsync(p => p.Nickname == nickname);
            if (player == null)
            {
                _logger.LogWarning("Nickname not found: {Nickname}", nickname);
                return NotFound();
            }
            return Ok(player.PlayerId);
        }

        [HttpPost]
        public async Task<ActionResult> AddPlayer([FromBody] Player player)
        {
            _logger.LogInformation("Adding player with nickname: {Nickname}", player.Nickname);
            if (await _context.Players.AnyAsync(p => p.Nickname == player.Nickname))
            {
                _logger.LogWarning("Nickname already exists: {Nickname}", player.Nickname);
                return Conflict("Nickname already exists");
            }

            _context.Players.Add(player);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Player added successfully: {Nickname}", player.Nickname);
            return CreatedAtAction(nameof(GetPlayerIdByNickname), new { nickname = player.Nickname }, player);
        }
    }
}
