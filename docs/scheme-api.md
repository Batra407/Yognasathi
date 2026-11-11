# Read-Only Government Scheme Data API Documentation

This document specifies the RESTful API endpoints exposed by the Next.js application to query official Government of India scheme data stored in PostgreSQL (`Dataset A`).

---

## 1. Global API Rules & Security

- **Read-Only**: All endpoints accept `GET` requests only. `POST`, `PUT`, `PATCH`, and `DELETE` methods are disallowed.
- **Source Integrity**: Returns only real, verified database records originating from official government budget statements. Zero synthetic or fake records are generated.
- **Security Boundaries**: No database connection strings, environment variables, or Prisma internal stack traces are exposed in response bodies.

---

## 2. Endpoints

### 2.1 List Government Schemes

**Endpoint**: `GET /api/schemes`

**Query Parameters**:

| Parameter | Type | Required | Default | Constraint / Range | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `page` | Integer | No | `1` | Min: `1` | Page number for pagination |
| `limit` | Integer | No | `20` | Min: `1`, Max: `100` | Number of items per page |
| `search` | String | No | - | Case-insensitive | Searches official `scheme_name` |
| `department` | String | No | - | Exact ID or partial name | Filters by administering Department ID or name |

**Success Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "b7c169d9-f34b-4616-8a03-975729f96201",
      "schemeNo": 1,
      "schemeName": "Crop Insurance Scheme",
      "departmentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "categoryId": null,
      "actuals20242025Crores": "14473.46",
      "be20252026Crores": "12242.27",
      "re20252026Crores": "12267.00",
      "be20262027Crores": "12200.00",
      "description": null,
      "schemeLevel": null,
      "state": null,
      "eligibilityText": null,
      "benefits": null,
      "applicationProcess": null,
      "officialUrl": null,
      "department": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Department of Agriculture and Farmers Welfare"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 637,
    "totalPages": 32
  }
}
```

---

### 2.2 Get Individual Scheme Details

**Endpoint**: `GET /api/schemes/[id]`

**Path Parameters**:
- `id` (String, Required): UUID of the scheme record in PostgreSQL.

**Success Response (200 OK)**:
```json
{
  "id": "b7c169d9-f34b-4616-8a03-975729f96201",
  "schemeNo": 1,
  "schemeName": "Crop Insurance Scheme",
  "departmentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categoryId": null,
  "actuals20242025Crores": "14473.46",
  "be20252026Crores": "12242.27",
  "re20252026Crores": "12267.00",
  "be20262027Crores": "12200.00",
  "description": null,
  "schemeLevel": null,
  "state": null,
  "eligibilityText": null,
  "benefits": null,
  "applicationProcess": null,
  "officialUrl": null,
  "department": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Department of Agriculture and Farmers Welfare"
  },
  "category": null
}
```

**Error Response (404 Not Found)**:
```json
{
  "error": "Scheme not found"
}
```

---

### 2.3 List Administering Departments

**Endpoint**: `GET /api/departments`

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `search` | String | No | - | Optional case-insensitive filter by department name |

**Success Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Department of Agriculture and Farmers Welfare",
      "createdAt": "2026-09-19T17:04:32.000Z",
      "updatedAt": "2026-09-19T17:04:32.000Z",
      "_count": {
        "schemes": 24
      }
    }
  ],
  "total": 71
}
```
