const { hash,compare } = require('bcryptjs');
const AppError = require("../utills/AppError");
const sqliteConnaction = require("../database/sqlite")

class UsersController {
  async create(request, response) {
    const {name, email, password} = request.body;

    const database = await sqliteConnaction();
    const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (checkUserExists) {
      throw new AppError("Esse email já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    await database.run("INSERT INTO users (name, email, password) VALUES (?,?,?)", [name, email, hashedPassword]);

    return response.status(201).json();
  }

  async update(request, response) {
    const {name, email, password, old_password} = request.body;
    const {id} = request.params;

    const database = await sqliteConnaction();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    const userWhithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (userWhithUpdatedEmail && userWhithUpdatedEmail.id !== user.id) {
      throw new AppError("Esse email já está em uso.");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if(password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha");
    }

    if(password && old_password){
      const checkOldPassword = await compare(old_password, user.password);

      if(!checkOldPassword){
        throw new AppError("Senha antiga incorreta");
      }

      user.password = await hash(password, 8);

    }

    await database.run(`
    UPDATE users SET
    name =?,
    email =?,
    password =?,
    updated_at = DATETIME('now')
    WHERE id = ?
    `, [user.name, user.email, user.password, id]
    );

    return response.json();
  
  }
}


module.exports = UsersController