import requests
import json

BASE_URL = "http://localhost:80/api/player"
PLAYER_KEY = "your_player_key"  # Debe coincidir con el del backend
PLAYER_ID = "test_player_1"
NICKNAME = "testnick123"

def add_player():
    url = f"{BASE_URL}/"
    payload = {
        "playerId": PLAYER_ID,
        "nickname": NICKNAME,
        "key": PLAYER_KEY
    }
    response = requests.post(url, json=payload)
    print("Add Player:", response.status_code, response.json())
    return response

def login():
    url = f"{BASE_URL}/login"
    payload = {
        "playerId": PLAYER_ID
    }
    response = requests.post(url, json=payload)
    print("Login:", response.status_code, response.json())
    if response.status_code == 200:
        return response.json()["token"]
    return None

def validate_nickname(token):
    url = f"{BASE_URL}/validate/{NICKNAME}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    print("Validate Nickname:", response.status_code, response.json())

def get_player_id_by_nickname(token):
    url = f"{BASE_URL}/{NICKNAME}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    print("Get Player ID by Nickname:", response.status_code, response.json())

def get_player_by_id(token):
    url = f"{BASE_URL}/id/{PLAYER_ID}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    print("Get Player by ID:", response.status_code, response.json())

def update_player_nickname(token, new_nickname):
    url = f"{BASE_URL}/nickname/{PLAYER_ID}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {"nickname": new_nickname}
    response = requests.put(url, headers=headers, json=payload)
    print("Update Nickname:", response.status_code, response.json())

if __name__ == "__main__":
    # 1. Agregar jugador (solo la primera vez, luego puede dar error si ya existe)
    add_player()
    # 2. Login para obtener token JWT
    token = login()
    if token:
        # 3. Validar nickname
        validate_nickname(token)
        # 4. Obtener playerId por nickname
        get_player_id_by_nickname(token)
        # 5. Obtener jugador por ID
        get_player_by_id(token)
        # 6. Actualizar nickname
        update_player_nickname(token, "nuevo_nick_test")
    else:
        print("No se pudo obtener token JWT.")