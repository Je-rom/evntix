import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { Request } from 'express';
import { userService } from '../service/user.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
    },
    async (
      request: Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void,
    ) => {
      try {
        //find or create the user
        const user = await userService.findOrCreate(
          { googleId: profile.id },
          {
            email: profile.emails?.[0].value,
            firstName: profile.name?.givenName,
            secondName: profile.name?.familyName,
          },
        );
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
