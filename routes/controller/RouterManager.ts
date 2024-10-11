export default class RouterManager {
    constructor() { }

    public checkSession = (req, res, next) => {
        if (!req.session.bearer_token) {
            req.session.user_info = null;
        }
        next();
    }

    public isAuthenticated = (req, res, next) => {
        if (!req.session.bearer_token) {
            return res.redirect('/login');
        }
        next();
    }

    public errorHandler = (err, req, res, next) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }

    public renderPage = (page, options = {}) => (req, res) => {
        res.status(200).render(page, {
            user: req.session.user_info,
            ...options
        });
    }
}