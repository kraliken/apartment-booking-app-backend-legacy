const jwt = require('jsonwebtoken');
const { User } = require('../models')

function authenticate (req, res, next) {

  const authHeader = req.headers.authorization;

    if (authHeader) {
        
      const token = authHeader.split(' ')[1];

      jwt.verify(token, process.env.SECRET_OR_PRIVATEKEY, async (err, user) => {
        // console.log(user);

        if (err) {
          // console.log(err);
          return res.sendStatus(403)
        }

        const searchUserInDb = await User.findOne({googleId: user.googleId})

        if(searchUserInDb){
          
          res.locals.user = user
          
          next()

        } else {

          return res.sendStatus(404)
        }

      });

    } else {

      return res.sendStatus(401)

    }
};

module.exports = authenticate