const routes = require('../routes');

module.exports = api = (app) => {
    // API RUOTES
    app.use('/api/v1/user', routes.user);
    app.use('/api/v1/tests', routes.test);
    app.use('/api/v1/groups', routes.group);
    app.use('/api/v1/question', routes.question);
    app.use('/api/v1/gallery', routes.gallery);
    app.use('/api/v1/registration', routes.registration);
    app.use('/api/v1/image', routes.image);
    app.use('/api/v1/review', routes.review);
    app.use('/api/v1/contact', routes.contact);
    
    // VIEW RUOTES
    app.use('/', routes.view);
    app.use('/admin', routes.adminView);
};
