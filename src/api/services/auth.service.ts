import { sql } from "../../db/db";
import type { RUser, User } from "../../types";
import bcrypt from "bcrypt";

class AuthService {
  async createUser(user: { name: string; email: string; password: string; role: string }) {
    const { name, email, role, password } = user;
    
    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (name, email, role, password) 
      VALUES (${name}, ${email}, ${role}, ${passwordHash}) 
      RETURNING id, name, email, role, created_at, updated_at
    `;
    
    return result[0];
  }

  async validateUser(email: string, password: string) {
    const result = await sql`
      SELECT id, name, email, role, password FROM users WHERE email = ${email}
    `;

    if (!result.length) {
      return null;
    }

    const { password: passwordHash, ...user } = result[0] as User;
    const isMatch = await bcrypt.compare(password, passwordHash);
    
    return isMatch ? (user as Omit<User, "password">) : null;
  }

  async getUserById(id: number) {
    const result = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${id}
    `;
    
    return result[0] as RUser & { id: number };
  }
}

export default new AuthService();
