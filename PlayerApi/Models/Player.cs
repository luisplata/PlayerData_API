namespace PlayerApi.Models
{
    public class Player
    {
        public int PlayerId { get; set; }
        public string Nickname { get; set; } = string.Empty;

        // Constructor que garantiza que Nickname siempre esté inicializado.
        public Player(string nickname)
        {
            Nickname = nickname;
        }

        public Player() { }
    }
}