def test_dashboard_stats(client, auth_header, db, business, test_user):
    response = client.get("/api/dashboard/stats", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert "total_sales_today" in data
    assert "total_transactions_today" in data
    assert "total_products" in data
    assert "low_stock_count" in data
    assert "total_customers" in data
    assert "sales_by_payment_method" in data
    assert "recent_sales" in data
    assert "top_products" in data
    assert data["total_sales_today"] == 0.0
    assert data["total_products"] == 0


def test_dashboard_stats_with_data(client, auth_header, db, business, test_user):
    from app.models import Category, Product, Customer

    cat = Category(name="Test Cat", business_id=business.id)
    db.add(cat)
    db.commit()

    for p in [
        Product(name="Product A", sku="P001", price=10.0, stock_quantity=5,
                min_stock_level=10, business_id=business.id, category_id=cat.id),
        Product(name="Product B", sku="P002", price=20.0, stock_quantity=3,
                min_stock_level=5, business_id=business.id, category_id=cat.id),
        Product(name="Product C", sku="P003", price=30.0, stock_quantity=100,
                min_stock_level=10, business_id=business.id, category_id=cat.id),
    ]:
        db.add(p)
    db.add(Customer(name="John Doe", email="john@test.com", business_id=business.id))
    db.commit()

    response = client.get("/api/dashboard/stats", headers=auth_header)
    data = response.json()
    assert data["total_products"] == 3
    assert data["low_stock_count"] == 2
    assert data["total_customers"] == 1


def test_dashboard_requires_auth(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 403
