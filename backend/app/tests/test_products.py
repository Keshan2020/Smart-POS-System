def test_list_products_empty(client, auth_header):
    response = client.get("/api/products/", headers=auth_header)
    assert response.status_code == 200
    assert response.json() == []


def test_create_product(client, auth_header, db, business):
    response = client.post("/api/products/", headers=auth_header, json={
        "name": "Test Product",
        "sku": "TST-001",
        "price": 19.99,
        "cost_price": 10.00,
        "stock_quantity": 100,
        "min_stock_level": 10,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"
    assert data["sku"] == "TST-001"
    assert data["price"] == 19.99
    assert data["is_active"] is True
    assert data["business_id"] == business.id
    assert "id" in data


def test_create_product_duplicate_sku(client, auth_header, db, business):
    client.post("/api/products/", headers=auth_header, json={
        "name": "Product One", "sku": "TST-001", "price": 10.0,
    })
    response = client.post("/api/products/", headers=auth_header, json={
        "name": "Product Two", "sku": "TST-001", "price": 20.0,
    })
    assert response.status_code == 400
    assert "SKU already exists" in response.text


def test_get_product(client, auth_header, db, business):
    create_resp = client.post("/api/products/", headers=auth_header, json={
        "name": "Test Product", "sku": "TST-001", "price": 19.99,
    })
    product_id = create_resp.json()["id"]

    response = client.get(f"/api/products/{product_id}", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["name"] == "Test Product"


def test_get_product_not_found(client, auth_header):
    response = client.get("/api/products/999", headers=auth_header)
    assert response.status_code == 404


def test_update_product(client, auth_header, db, business):
    create_resp = client.post("/api/products/", headers=auth_header, json={
        "name": "Old Name", "sku": "TST-001", "price": 10.0, "stock_quantity": 50,
    })
    product_id = create_resp.json()["id"]

    response = client.put(f"/api/products/{product_id}", headers=auth_header, json={
        "name": "Updated Name", "price": 25.0,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["price"] == 25.0
    assert data["sku"] == "TST-001"


def test_delete_product(client, auth_header, db, business):
    create_resp = client.post("/api/products/", headers=auth_header, json={
        "name": "To Delete", "sku": "TST-001", "price": 10.0,
    })
    product_id = create_resp.json()["id"]

    response = client.delete(f"/api/products/{product_id}", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["message"] == "Product deleted successfully"

    get_resp = client.get(f"/api/products/{product_id}", headers=auth_header)
    assert get_resp.status_code == 200
    assert get_resp.json()["is_active"] is False


def test_search_products(client, auth_header, db, business):
    client.post("/api/products/", headers=auth_header, json={
        "name": "Apple iPhone", "sku": "APL-001", "price": 999.0,
    })
    client.post("/api/products/", headers=auth_header, json={
        "name": "Samsung Galaxy", "sku": "SAM-001", "price": 899.0,
    })
    client.post("/api/products/", headers=auth_header, json={
        "name": "Apple MacBook", "sku": "APL-002", "price": 1999.0,
    })

    response = client.get("/api/products/?search=Apple", headers=auth_header)
    data = response.json()
    assert len(data) == 2
    names = [p["name"] for p in data]
    assert "Apple iPhone" in names
    assert "Apple MacBook" in names
    assert "Samsung Galaxy" not in names


def test_products_require_auth(client):
    response = client.get("/api/products/")
    assert response.status_code == 403
