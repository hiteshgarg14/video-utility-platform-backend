import { RequestHandler } from 'express';
import { getRepository, Repository } from 'typeorm';
import { validate } from 'class-validator';
import UserModel from '../@models/UserModel';

export default class UserController {
  public repository: Repository<UserModel>;

  constructor() {
    this.repository = getRepository(UserModel);
  }

  public listAll: RequestHandler = async (_, res) => {
    // Get users from database
    const users = await this.repository.find({
      select: ['id', 'username', 'role'], // We dont want to send the passwords on response
    });
    // Send the users object
    res.send(users);
  };

  public getOneById: RequestHandler = async (req, res) => {
    // Get the ID from the url
    const id: number = +req.params.id;

    // Get the user from database
    let user!: UserModel;
    try {
      user = await this.repository.findOneOrFail(id, {
        select: ['id', 'username', 'role'], // We dont want to send the password on response
      });
    } catch (error) {
      res.status(404).json('User not found');
    }

    // Send the user object
    res.send(user);
  };

  public newUser: RequestHandler = async (req, res) => {
    // Get parameters from the body
    const { username, password, role } = req.body;
    const user = new UserModel();
    user.username = username;
    user.password = password;
    user.role = role;

    // Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Hash the password, to securely store on DB
    user.hashPassword();

    // Try to save. If fails, the username is already in use
    try {
      await this.repository.save(user);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }

    // If all ok, send 201 response
    res.status(201).send('User created');
  };

  public editUser: RequestHandler = async (req, res) => {
    // Get the ID from the url
    const id = req.params.id;

    // Get values from the body
    const { username, role } = req.body;

    // Try to find user on database
    let user;
    try {
      user = await this.repository.findOneOrFail(id);
    } catch (error) {
      // If not found, send a 404 response
      res.status(404).send('User not found');
      return;
    }

    // Validate the new values on model
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Try to safe, if fails, that means username already in use
    try {
      await this.repository.save(user);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  public deleteUser: RequestHandler = async (req, res) => {
    // Get the ID from the url
    const id = req.params.id;

    try {
      await this.repository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }
    this.repository.delete(id);

    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}
