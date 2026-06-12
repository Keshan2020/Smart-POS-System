def test_login_success(client, test_user):
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "admin"
    assert data["user"]["email"] == "admin@test.com"


def test_login_invalid_password(client, test_user):
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "wrongpassword",
    })
    assert response.status_code == 401
    assert "Invalid username or password" in response.text


def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={
        "username": "nonexistent",
        "password": "password",
    })
    assert response.status_code == 401


def test_register_success(client, db):
    response = client.post("/api/auth/register", json={
        "email": "newuser@test.com",
        "username": "newuser",
        "password": "password123",
        "full_name": "New User",
        "role": "cashier",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "newuser"


def test_register_duplicate_username(client, test_user):
    response = client.post("/api/auth/register", json={
        "email": "another@test.com",
        "username": "admin",
        "password": "password123",
    })
    assert response.status_code == 400
    assert "already exists" in response.text


def test_register_duplicate_email(client, test_user):
    response = client.post("/api/auth/register", json={
        "email": "admin@test.com",
        "username": "another",
        "password": "password123",
    })
    assert response.status_code == 400


def test_get_me(client, auth_header, test_user):
    response = client.get("/api/auth/me", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email


def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 403


def test_change_password(client, auth_header, test_user, db):
    response = client.post("/api/auth/change-password", headers=auth_header, json={
        "current_password": "admin123",
        "new_password": "newpass456",
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully"

    login_resp = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "newpass456",
    })
    assert login_resp.status_code == 200


def test_change_password_wrong_current(client, auth_header, test_user):
    response = client.post("/api/auth/change-password", headers=auth_header, json={
        "current_password": "wrongpassword",
        "new_password": "newpass456",
    })
    assert response.status_code == 400
    assert "Current password is incorrect" in response.text


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_test_endpoint(client):
    response = client.get("/api/test")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Backend Connected Successfully" in data["message"]
