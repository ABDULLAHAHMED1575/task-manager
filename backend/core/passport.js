const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../src/models/user');

passport.use(new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:false,
    },async (email,password,done) => {
        try{
            const user = await User.findByEmailWithPassword(email);

            if(!user){
                return done(null, false, {
                    message: 'No user found with that email address'
                });
            }
            const isValidPassword = await User.verifyPassword(password, user.password);

            if(!isValidPassword){
                return done(null, false, { 
                    message: 'Incorrect password' 
                });
            }
            const {password:_, ...userWithoutPassword} = user;
            console.log(`User authenticated: ${user.username} (${user.email})`);
            return done(null, userWithoutPassword);
        }catch(error){
            console.error('Authentication error:', error);
            return done(error);
        }
    }
));

passport.serializeUser((user,done) => {
    console.log(`Serializing user: ${user.id}`);
    done(null, user.id);
});

passport.deserializeUser(async (id,done) => {
    try {
        const user = await User.findById(id);
        if(!user){
            console.log(`User not found during deserialization: ${id}`);
            return done(null, false);
        }
        console.log(`Deserialized user: ${user.username} (${user.id})`);
        done(null, user);
    } catch (error) {
        console.error('Deserialization error:', error);
        done(error);
    }
});

module.exports = passport;