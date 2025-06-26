const db = require("../../core/db");
const bcrypt = require("bcrypt");
const config = require("../../core/config");

class User {
  static get tableName() {
    return "users";
  }

  static async create({ username, email, password }) {
    try {
      const saltRound = parseInt(config.BCRYPT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, saltRound);

      const [user] = await db(this.tableName)
        .insert({
          username: username.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        })
        .returning(["id", "username", "email", "created_at", "updated_at"]);
      return user;
    } catch (error) {
      if (error.code === "23505") {
        if (error.constraint.includes("username")) {
          throw new Error("Username already exists");
        }
        if (error.constraint.includes("email")) {
          throw new Error("Email already exists");
        }
      }
      throw error;
    }
  }

  static async findById(id) {
    return await db(this.tableName)
      .select("id", "username", "email", "created_at", "updated_at")
      .where({ id })
      .first();
  }

  static async findByEmailWithPassword(email) {
    return await db(this.tableName)
      .select("*")
      .where({ email: email.toLowerCase().trim() })
      .first();
  }

  static async findByUsername(username) {
    return await db(this.tableName)
      .select("id", "username", "email", "created_at", "updated_at")
      .where({ username: username.trim() })
      .first();
  }

  static async findByEmail(email) {
    try {
      console.log("Finding user by email:", email);
      const user = await db(this.tableName)
        .select("id", "username", "email", "created_at", "updated_at")
        .where({ email: email.toLowerCase().trim() })
        .first();

      console.log(
        "User found:",
        user ? { id: user.id, username: user.username } : "null"
      );
      return user;
    } catch (error) {
      console.error("Find user by email error:", error);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getTeams(userId) {
    return await db("teams")
      .select("teams.*")
      .join("memberships", "teams.id", "memberships.team_id")
      .where("memberships.user_id", userId)
      .orderBy("teams.created_at", "desc");
  }

  static async getTask(userId, filters = {}) {
    let query = db("tasks")
      .select("tasks.*", "teams.name as team_name")
      .leftJoin("teams", "tasks.team_id", "teams.id")
      .where("tasks.assigned_to", userId);

    if (filters.status) {
      query = query.where("tasks.status", filters.status);
    }

    if (filters.team_id) {
      query = query.where("tasks.team_id", filters.team_id);
    }

    return await query.orderBy("tasks.created_at", "desc");
  }

  static async exists(id) {
    const result = await db(this.tableName).select("id").where({ id }).first();

    return !!result;
  }

  static async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    return await db(this.tableName)
      .select("id", "username", "email")
      .whereIn("id", ids);
  }
}

module.exports = User;
