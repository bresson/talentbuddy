var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    conn = require('./db'),
    bcrypt = require('bcrypt'),
    fixtures = require('./fixtures');

// mentor solution
function verify(username, password, done) {
    var User = conn.model('User')

    User.findOne({
        id: username
    }, function(err, user) {
        if (err) {
            return done(err)
        }
        if (!user) {
            return done(null, false, {
                message: 'Incorrect username.'
            })
        }

        bcrypt.compare(password, user.password, function(err, matched) {
          if ( err ) {
            console.log('wrong password')
            return done(null, false, {
                message: 'Incorrect username.'
            });
          }
          matched ? done(null, user)
                  : done(null, false, {message: 'Incorrect password'})
        })
        // if (user.password !== password) {
        //     return done(null, false, {
        //         message: 'Incorrect password.'
        //     })
        // }
      
    })
}
passport.use(new LocalStrategy(verify))

// my solution 
// passport.use(new LocalStrategy(
//   function (username, password, done) {
//    console.log('using passport use')

//     conn.model('User').findOne({ id: username}, function(err, user) {

//         if (err) {
//           return done(null, false)
//         } 

//         if (!user) {
//           return done(null, false, { message: 'Incorrect username.' })
//         }

//         if (user.password !== password) {
//           return done(null, false, { message: 'Incorrect password.' });
//         }

//         return done(null, user)
//     });


// for (var i = 0; i < fixtures.users.length; i++) {
//  if ( fixtures.users[i].id === username) {
//    if ( fixtures.users[i].password === password ) {
//      // pass
//      return done(null, fixtures.users[i])
//    }
//  // bad password
//    return done(null, false, {message: 'Incorrect password.'})
//  }
// }
// // bad username
// return done(null, false, {message: 'Incorrect username.'})
//   }

// ));



passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {

    // mentor version
    conn.model('User').findOne({
        id: id
    }, done)

    //tutsplus version - doesn't work here findById
    // var User = conn.model('User');
    // User.findById(id, function(err, user) {
    //   done(err, user);
    // });

    // my version works but mentor's is better
    // var userId = id, 
    //  User = conn.model('User');

    //  User.findOne({id: userId}, function(err, user) {
    //    if (err) {
    //      console.log('err');
    //      return done(null, false)
    //    }
    //    console.log(user)
    //    return done(null, user);
    //  });

});

module.exports = passport;