
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as morgan from 'morgan';
import * as i18n from 'i18n';
import { RoutesHandler } from './api/routes.handler';

export class App {
    protected app: express.Application;
    protected routesHandler: RoutesHandler;
    protected port: string


    constructor(port: string) {
        this.port = port;
        this.app = express();
        this.routesHandler = new RoutesHandler(this.app);

        this.initi18n();
        this.useMiddlewares();
        this.mountRoutes();
    }

    private initi18n(): void {
        i18n.configure({
            // setup some locales - other locales default to en silently
            locales: ['en', 'es-ES', 'fr', 'es', 'pt', 'de'],
            // sets a custom cookie name to parse locale settings from
            cookie: 'language-cookie',
            // where to store json files - defaults to './locales'
            directory: __dirname + '/locales'
        });
    }

    private useMiddlewares(): void {
        this.app.use(morgan('dev'));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        this.app.use(bodyParser.json({ type: 'application/json-patch' }));
        this.app.use(bodyParser.json());
        this.app.use(methodOverride());

        this.app.use(i18n.init);
        this.app.use(this.i18nSetLocaleMiddleware);
    }

    private i18nSetLocaleMiddleware(req, res, next) {
        if (req.cookies != undefined && req.cookies['language-cookie'] != undefined) {
            res.setLocale(req.cookies['language-cookie']);
        }
        next();
    }

    private async mountRoutes() {
        try {
            await this.routesHandler.registerRoutes();
        } catch (error) {
            console.log('Unexpected error occurred in mountRoutes()', error);
        }
    }

    public Run() {
        this.app.listen(this.port, () => {
            console.log(i18n.__("API REST running in") + ` http://localhost:${this.port}`)
        })
    }
}
