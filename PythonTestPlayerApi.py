# Este script en Python utiliza la librería 'requests' para realizar pruebas básicas a la API
# que has desarrollado. Estas pruebas validan algunas operaciones esenciales como agregar un
# jugador, validar un nickname y obtener un playerId.

import requests
import json

BASE_URL = "http://localhost:8080/api/players"

def test_add_player(player_id, nickname):
    url = f"{BASE_URL}"
    payload = {
        "PlayerId": player_id,
        "Nickname": nickname
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    if response.status_code == 201:
        print(f"SUCCESS: Player '{nickname}' added successfully.")
    elif response.status_code == 409:
        print(f"FAIL: Player with nickname '{nickname}' already exists (Conflict).")
    else:
        print(f"ERROR: Unexpected status code {response.status_code} while adding player '{nickname}'.")

def test_validate_nickname(nickname):
    url = f"{BASE_URL}/validate/{nickname}"
    response = requests.get(url)
    if response.status_code == 200:
        is_available = response.json()
        if is_available:
            print(f"SUCCESS: Nickname '{nickname}' is available.")
        else:
            print(f"FAIL: Nickname '{nickname}' is already taken.")
    else:
        print(f"ERROR: Unexpected status code {response.status_code} while validating nickname '{nickname}'.")

def test_get_player_id_by_nickname(nickname):
    url = f"{BASE_URL}/{nickname}"
    response = requests.get(url)
    if response.status_code == 200:
        player_id = response.json()
        print(f"SUCCESS: Player ID for nickname '{nickname}' is {player_id}.")
    elif response.status_code == 404:
        print(f"FAIL: Nickname '{nickname}' not found (Not Found).")
    else:
        print(f"ERROR: Unexpected status code {response.status_code} while fetching player ID for nickname '{nickname}'.")

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
