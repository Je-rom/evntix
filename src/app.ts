import dotenv from 'dotenv';
import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import { taskRouter } from './routes/tasks.router';
import { authRouter } from './auth/auth.router';
import { AppDataSource } from './data-source';
import { AppError } from './shared/utils/response';
import globalErrorHandler from './shared/middleware/errorHandling';
import passport from './auth/googleAuth';
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); //parse json bodies
app.use(cors());

//session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

//initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

//api routes
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/auth', authRouter);

//google oauth routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
  }),
);

app.get('/auth/google/success', (req, res) => {
  res.send('Authentication successful! Welcome to the app.');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Authentication failed. Please try again.');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'google.html'));
});

//handle unregistered routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

//global error-handling middleware
app.use(globalErrorHandler);

//initialize database and start server
AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}. Database has been initialized.`,
      );
    });
  })
  .catch((err) => {
    console.log('Database initialization failed', err);
  });

//req.session.destroy
