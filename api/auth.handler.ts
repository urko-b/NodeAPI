import { Application } from 'express';

export class AuthHandler {
  protected app: Application;

  /**
   *
   */
  constructor(app: Application) {
    this.app = app;
  }

  public auth() {
    this.app.get('/auth', async (req, res) => {
      const secret: string = req.header('secret');
      if (secret === undefined) {
        res.status(401).send();
      }

      // Check in secret collection if it exists

      // if exists
    });
  }

  public logIn() {
    this.app.get('/login', async (req, res) => {
      const secret: string = req.header('secret');
      if (secret === undefined) {
        res.status(401).send();
      }
      // Check if collaborator exists and return it's id

    });
  }
}
