# Devpulse

 Built with Node.js, Express, and PostgreSQL (Neon).

🔗 **Live URL:** https://devpulse-main.vercel.app/

---

## Features

- User authentication with JWT (register, login, logout)
- Role-based access control (contributor & maintainer)
- Create, read, update, and delete issues
- Filter issues by type and status
- Sort issues by newest or oldest
- Secure password hashing with bcrypt
- Cookie-based token management

## API Endpoints

### Auth Routes — `/api/auth`



### Issue Routes — `/api/issues`



### Query Parameters for `GET /api/issues`

| Parameter | Values | Description |
|---|---|---|
| `sort` | `newest`, `oldest` | Sort order (default: newest) |
| `type` | `bug`, `feature_request` | Filter by issue type |
| `status` | `open`, `in_progress`, `resolved` | Filter by status |

---





## Author

**Syed Anwarul Haque Piash**
GitHub:https://github.com/Syed-Anwarul-Haque-Piash/Devpulse/tree/main