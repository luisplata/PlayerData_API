using Microsoft.EntityFrameworkCore;
using Moq;
using PlayerApi.Controllers;
using PlayerApi.Data;
using PlayerApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Mvc;

namespace PlayerApi.Tests
{
    public class PlayerControllerTests
    {
        private PlayerContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<PlayerContext>()
                .UseInMemoryDatabase(databaseName: "PlayerTestDb")
                .Options;
            return new PlayerContext(options);
        }

        [Fact]
        public async Task ValidateNickname_ShouldReturnTrue_WhenNicknameIsAvailable()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var controller = new PlayerController(context);

            // Act
            var result = await controller.ValidateNickname("player1");

            // Assert
            Assert.True(result.Value);
        }

        [Fact]
        public async Task ValidateNickname_ShouldReturnFalse_WhenNicknameIsTaken()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            context.Players.Add(new Player { PlayerId = 1, Nickname = "player1" });
            await context.SaveChangesAsync();
            var controller = new PlayerController(context);

            // Act
            var result = await controller.ValidateNickname("player1");

            // Assert
            Assert.False(result.Value);
        }

        [Fact]
        public async Task GetPlayerIdByNickname_ShouldReturnPlayerId_WhenNicknameExists()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            context.Players.Add(new Player { PlayerId = 1, Nickname = "player1" });
            await context.SaveChangesAsync();
            var controller = new PlayerController(context);

            // Act
            var result = await controller.GetPlayerIdByNickname("player1") as ActionResult<int>;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            Assert.NotNull(okResult);
            Assert.Equal(1, okResult.Value);
        }

        [Fact]
        public async Task GetPlayerIdByNickname_ShouldReturnNotFound_WhenNicknameDoesNotExist()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var controller = new PlayerController(context);

            // Act
            var result = await controller.GetPlayerIdByNickname("player1");

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task AddPlayer_ShouldReturnCreatedAtAction_WhenPlayerIsAdded()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var controller = new PlayerController(context);
            var newPlayer = new Player { PlayerId = 2, Nickname = "player2" };

            // Act
            var result = await controller.AddPlayer(newPlayer) as ActionResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CreatedAtActionResult>(result);
        }

        [Fact]
        public async Task AddPlayer_ShouldReturnConflict_WhenNicknameExists()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            context.Players.Add(new Player { PlayerId = 1, Nickname = "player1" });
            await context.SaveChangesAsync();
            var controller = new PlayerController(context);
            var newPlayer = new Player { PlayerId = 2, Nickname = "player1" };

            // Act
            var result = await controller.AddPlayer(newPlayer);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<ConflictObjectResult>(result);
        }
    }
}