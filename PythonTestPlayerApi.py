import requests
import json

BASE_URL = "http://localhost:8080/api/player"

def test_add_player(player_id, nickname):
    url = f"{BASE_URL}"
    payload = {
        "playerId": player_id,
        "nickname": nickname
    }
    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 201:
            print(f"SUCCESS: Player '{nickname}' added successfully.")
        elif response.status_code == 409:
            print(f"SUCCESS: Player with nickname '{nickname}' already exists, and this conflict is expected.")
        else:
            print(f"FAIL: Unexpected status code {response.status_code} while adding player '{nickname}'. Expected status: 201 or 409.")
    except requests.exceptions.RequestException as e:
        print(f"FAIL: Failed to add player '{nickname}'. Exception: {e}")

def test_validate_nickname(nickname):
    url = f"{BASE_URL}/validate/{nickname}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            is_available = response.json()
            if is_available:
                print(f"SUCCESS: Nickname '{nickname}' is available.")
            else:
                print(f"SUCCESS: Nickname '{nickname}' is already taken, as expected.")
        else:
            print(f"FAIL: Unexpected status code {response.status_code} while validating nickname '{nickname}'. Expected status: 200.")
    except requests.exceptions.RequestException as e:
        print(f"FAIL: Failed to validate nickname '{nickname}'. Exception: {e}")

def test_get_player_id_by_nickname(nickname):
    url = f"{BASE_URL}/{nickname}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            player_id = response.json()
            print(f"SUCCESS: Player ID for nickname '{nickname}' is {player_id}.")
        elif response.status_code == 404:
            print(f"SUCCESS: Nickname '{nickname}' was not found, as expected (404 Not Found).")
        else:
            print(f"FAIL: Unexpected status code {response.status_code} while fetching player ID for nickname '{nickname}'. Expected status: 200 or 404.")
    except requests.exceptions.RequestException as e:
        print(f"FAIL: Failed to get player ID for nickname '{nickname}'. Exception: {e}")

if __name__ == "__main__":
    # Agregar jugadores
    test_add_player(1, "player1")
    test_add_player(2, "player2")
    test_add_player(3, "player1")  # Intentar agregar un nickname que ya existe

    # Validar nicknames
    test_validate_nickname("player1")  # Debería estar tomado
    test_validate_nickname("player3")  # Debería estar disponible

    # Obtener PlayerId por Nickname
    test_get_player_id_by_nickname("player1")  # Debería devolver el ID del jugador
    test_get_player_id_by_nickname("unknown_player")  # Debería devolver Not Found
