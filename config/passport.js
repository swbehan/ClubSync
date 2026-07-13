import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import usersCollection from "../db/users-db.js";

// Whenever you want to use passport you have to create a strategy
const strategy = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      const user = await usersCollection.findUserByEmail(email);

      // user was not found and returned with a null vaild indicating the user does not exisit
      if (!user) {
        return done(null, false, { message: "User or password incorrect" });
      }

      // user was found but the password provided was incorrect
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return done(null, false, { message: "User or password incorrect" });
      }

      // user was found and matched an email in db and password was vaild.
      // We return the full Mongo document with thepasswordHash included since passport
      // only stores the _id in the session via serializeUser function, and the routes
      // build a clean copy without passwordHash before sending it to the client.
      return done(null, user);
    } catch (error) {
      // there was an error with the login attempt
      done(error);
    }
  }
);

passport.use(strategy);

// this is what we want to store in the session so we want to ensure that we are serializing it
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// how to retrieve a user from a session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersCollection.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
