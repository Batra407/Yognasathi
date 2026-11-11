# Official Scheme Information Data Source & API Client Specifications

This document details the second official government data source (**myScheme Service API via API Setu**), its integration specifications, security safeguards, and connection testing architecture.

---

## 1. Source Metadata & Specifications

- **Source Name**: myScheme Service API (via API Setu)
- **Government Publisher**: Ministry of Electronics and Information Technology (MeitY) / Digital India Corporation (DIC) / National Informatics Centre (NIC), Government of India
- **Official Portal**: [https://www.myscheme.gov.in](https://www.myscheme.gov.in)
- **API Setu Directory**: [https://apisetu.gov.in/directory/api/myscheme](https://apisetu.gov.in/directory/api/myscheme)
- **Endpoint URL**: `https://apisetu.gov.in/api/v1/myscheme/schemes`
- **Protocol**: HTTPS / RESTful JSON
- **Authentication**: Custom HTTP Headers:
  - `X-APISETU-CLIENT-ID`: Issued upon API Setu partner registration
  - `X-APISETU-APIKEY`: Issued upon myScheme publisher subscription approval

---

## 2. API Client Architecture

Server-side API client implementation: [`src/lib/government/myscheme-api.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/src/lib/government/myscheme-api.js)

### Security Features
1. **Server-Side Only**: Credentials are read strictly from `process.env` on the server and never exposed in client-side bundles.
2. **Zero Log Exposure**: API keys and Client IDs are filtered out of error logs and response objects.
3. **No Credential Pre-flight**: The client validates environment configuration before initiating network requests. If credentials are missing, it immediately returns:
   > `API credentials are required before real data can be retrieved.`

### Error Code Handling
- **`400 Bad Request / Missing Config`**: Configuration validation failure (missing credentials).
- **`401 / 403 Unauthorized`**: Returns *"API credentials or subscription are not authorized."*
- **`429 Rate Limit Exceeded`**: Returns *"API rate limit exceeded. Please wait before retrying."*
- **`5xx Server Error`**: Returns *"Government API service error."*
- **`408 Request Timeout`**: Aborts after 10 seconds and returns *"Network request timeout."*

---

## 3. Next.js Admin Test Route

Server-side test endpoint: [`src/app/api/admin/myscheme/test/route.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/src/app/api/admin/myscheme/test/route.js)

- **Route**: `GET /api/admin/myscheme/test`
- **Purpose**: Provides administrative connection verification.
- **Safety**: Returns sanitised JSON response without exposing headers or secret keys.

---

## 4. Raw Response Preservation Policy

When valid API Setu credentials are provided and a 200 OK payload is returned:
- Payload is saved untouched to `data/raw/official_scheme_information/myscheme_api_YYYYMMDD_HHmmss.json`.
- Pagination parameters are preserved intact.

---

## 5. Current Connection Status Report

- **API Credentials Available**: **NO** (Waiting for API Setu consumer registration and publisher subscription approval).
- **Connection Test Status**: **Config Validation Active (400)**.
- **Status Message**: `API credentials are required before real data can be retrieved.`
- **Database Import**: **Deferred (0 records imported)**.
- **Mock Data Policy**: **Zero fake data or mock responses generated**.
