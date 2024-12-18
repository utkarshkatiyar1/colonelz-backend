
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Colonelz Project',
        },
    },
    // apis: ['./routes/**/*.js'],

    apis: ['./routes/usersRoutes/users.route.js', './routes/adminRoutes/adminroutes.js', './routes/orgRoutes/org.routes.js', './routes/orgRoutes/bill.routes.js'], // Path to the API route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

export default setupSwaggerDocs;
