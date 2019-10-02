const User = require('../models/User');
const ResetPasswordToken = require('../models/ResetPasswordToken');
const send_email = require('../helpers/send_passwordreset_email');
const crypto = require('crypto');

module.exports = (req, res) => {
  const host = req.get('host');
  let errors = [];
  const email = req.body.email;
  const secret = email + Date.now();
  const hash =  crypto.createHmac('sha256', secret)
                     .update('I love cupcakes')
                     .digest('hex');
  return User.findOne({ where: { email: email }})
    .then(user => {
      if (!user) {
        errors.push({ msg: 'That email is not registered' });
        res.render('forgot', {
          errors,
          email
        });
      }
      if(user){
          return ResetPasswordToken.findOne({ where: { userId: user.id }})
          .then(foundToken=>{
            if(!foundToken){
              const foundToken = new ResetPasswordToken({
                userId: user.id,
                token: hash,
                expiresAt: Date.now() + 10 * 60 * 60 * 1000 // 10 hour
              });
              foundToken.save();
              send_email(user.email, host, hash);
              errors.push({ msg: 'Password reset link is sent to your account' });
              res.render('forgot', {
                errors,
                email
              });
            }
            if(foundToken){
              foundToken.update({
                token: hash,
                expiresAt: Date.now() + 10 * 60 * 60 * 1000 // 10 hour
              });
              send_email(user.email, host, hash);
              errors.push({ msg: 'Password reset link is sent to your account'});
              res.render('forgot', {
                errors,
                email
              });
            }
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
}
