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

        private PlayerContext InitializeInMemoryDbContext()
        {
            var context = GetInMemoryDbContext();
            context.Database.EnsureDeleted(); // Asegurarse de limpiar la base de datos antes de cada prueba
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public async Task ValidateNickname_ShouldReturnTrue_WhenNicknameIsAvailable()
        {
            // Arrange
            var context = InitializeInMemoryDbContext();
            var controller = new PlayerController(context);

            // Act
            var result = await controller.ValidateNickname("player1");

            // Assert
            Assert.True(result.Value, "Expected nickname 'player1' to be available, but it was not.");
        }

        [Fact]
        public async Task ValidateNickname_ShouldReturnFalse_WhenNicknameIsTaken()
        {
            // Arrange
            var context = InitializeInMemoryDbContext();
            context.Players.Add(new Player { PlayerId = 1, Nickname = "player1" });
            await context.SaveChangesAsync();
            var controller = new PlayerController(context);

            // Act
            var result = await controller.ValidateNickname("player1");

            // Assert
            Assert.False(result.Value, "Expected nickname 'player1' to be taken, but it was available.");
        }

        [Fact]
        public async Task GetPlayerIdByNickname_ShouldReturnPlayerId_WhenNicknameExists()
        {
            // Arrange
            var context = InitializeInMemoryDbContext();
            context.Players.Add(new Player { PlayerId = 1, Nickname = "player1" });
            await context.SaveChangesAsync();
            var controller = new PlayerController(context);

            // Act
            var result = await controller.GetPlayerIdByNickname("player1");

            // Debugging Log
            if (result == null)
            {
                throw new System.Exception("The result was null. It seems the PlayerController did not return a response.");
            }
            else if (result.Result == null)
            {
                throw new System.Exception("The result.Result was null. It seems the action result was not created properly.");
            }

            // Assert
            Assert.NotNull(result);
            var okResult = result.Result as OkObjectResult;
            Assert.NotNull(okResult);
            Assert.IsType<int>(okResult.Value);
            Assert.Equal(1, okResult.Value);
        }

        [Fact]
        public async Task GetPlayerIdByNickname_ShouldReturnNotFound_WhenNicknameDoesNotExist()
        {
            // Arrange
            var context = InitializeInMemoryDbContext();
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
            var context = InitializeInMemoryDbContext();
            var controller = new PlayerController(context);
            var newPlayer = new Player { PlayerId = 2, Nickname = "player2" };

            // Act
            var result = await controller.AddPlayer(newPlayer) as ActionResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CreatedAtActionResult>(result);
            var createdAtResult = result as CreatedAtActionResult;
            Assert.Equal(nameof(controller.GetPlayerIdByNickname), createdAtResult?.ActionName);
        }

        [Fact]
        public async Task AddPlayer_ShouldReturnConflict_WhenNicknameExists()
        {
            // Arrange
            var context = InitializeInMemoryDbContext();
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