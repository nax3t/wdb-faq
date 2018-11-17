const debug = require('debug')('wdb-faq:register');
const randomstring = require('randomstring');

// DB Model Files
const User = require('../../models/user');
const TempUser = require('../../models/tempUser');
const Token = require('../../models/token');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Joi = require('joi');

const registerAdminSchema = Joi.object().keys({
  email: Joi.string()
    .email({
      minDomainAtoms: 2
    })
    .required()
    .error(
      new Error('This is not a valid email address')
    ),
  username: Joi.string()
    .alphanum()
    .min(7)
    .max(30)
    .required()
    .error(
      new Error('Username muse be alphanumeric and be between 7 and 30 characters')
    ),
  adminCode: Joi.string()
    .alphanum()
    .required()
    .error(
      new Error('Admin code is required.')
    ),
  password: Joi.string()
    .regex(/^[-@./#&+\w\s]{8,30}$/)
    .required()
    .error(
      new Error(
        'Password must be alphanumeric and only allows -@./#&+ as special characters'
      )
    ),
  confirmationPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .error(
      new Error('Passwords must match')
    )
});

const registerUserSchema = Joi.object().keys({
  email: Joi.string()
    .email({
      minDomainAtoms: 2
    })
    .required()
    .error(
      new Error('This is not a valid email address')
    ),
  username: Joi.string()
    .alphanum()
    .min(7)
    .max(30)
    .required()
    .error(
      new Error('Username muse be alphanumeric and be between 7 and 30 characters')
    ),
});

// Validation Schema - Password
const passwordSchema = Joi.object().keys({
  username: Joi.string()
    .alphanum()
    .min(7)
    .max(30)
    .required()
    .error(
      new Error('Username muse be alphanumeric and be between 7 and 30 characters')
    ),
  password: Joi.string()
    .regex(/^[-@./#&+\w\s]{8,30}$/)
    .required()
    .error(
      new Error(
        'Password must be alphanumeric and only allows -@./#&+ as special characters'
      )
    ),
  confirmationPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .error(
      new Error('Passwords must match')
    )
});

module.exports = {
  async userRegister(req, res, next) {
    let foundUsers = await User.find({});
    if (!foundUsers || foundUsers === null || !foundUsers.length) {
      const result = await Joi.validate(req.body, registerAdminSchema);
      if (result.error) {
        req.flash('error', result.error.message);
        debug(result.error.message);
        res.redirect('/auth/register');
        return;
      }
      /* 
      Check to see if a registering user is trying to use an email or username that
      is either in the User or the TempUser database. If so, tell the user and redirect back
      to the register page.
      */
      const userEmail = await User.findOne({
        email: req.body.email
      });

      const tempUserEmail = await TempUser.findOne({
        email: req.body.email
      });

      if (userEmail || tempUserEmail) {
        req.flash('error', 'This email address is already in use.');
        debug('This email address is already in use.');
        res.redirect('/auth/register');
        return;
      }

      const userName = await User.findOne({
        username: req.body.username
      });

      const tempUserName = await TempUser.findOne({
        username: req.body.username
      });

      if (userName || tempUserName) {
        req.flash('error', 'This username is already in use.');
        debug('This username is already in use.');
        res.redirect('/auth/register');
        return;
      }

      const newUser = await new User(req.body);
      if (req.body.adminCode !== process.env.ADMIN_CODE) {
        req.flash('error', 'Admin code is incorrect.');
        debug('Admin code is incorrect!');
        res.redirect('/auth/register');
        return;
      }
      newUser.isAdmin = true;
      newUser.isVerified = true;

      delete req.body.confirmationPassword;
      await User.register(newUser, req.body.password);
      req.flash('success', 'Admin registered!');
      debug('Admin Registered!');
      res.redirect('/');
      return;
    }
    /* 
      If an admin user exists then this code will run to create a 
      non-admin user. 
    */
    const result = await Joi.validate(req.body, registerUserSchema);
    if (result.error) {
      req.flash('error', result.error.message);
      debug(result.error.message);
      return res.redirect('/auth/register');
    }

    /* 
      Check to see if a registering user is trying to use an email or username that
      is either in the User or the TempUser database. If so, tell the user and redirect back
      to the register page.
    */
    const userEmail = await User.findOne({
      email: req.body.email
    });

    const tempUserEmail = await TempUser.findOne({
      email: req.body.email
    });

    if (userEmail || tempUserEmail) {
      req.flash('error', 'This email address is already in use.');
      debug('This email address is already in use.');
      res.redirect('/auth/register');
      return;
    }

    const userName = await User.findOne({
      username: req.body.username
    });

    const tempUserName = await TempUser.findOne({
      username: req.body.username
    });

    if (userName || tempUserName) {
      req.flash('error', 'This username is already in use.');
      debug('This username is already in use.');
      res.redirect('/auth/register');
      return;
    }

    /* Register a temp user and send an email to the provided email address
       for validation */
    const newTempUser = await new TempUser(req.body);
    await newTempUser.save();
    debug('User registered as temp user!');
    debug('Creating token to send in an email!')

    const tempUser = await TempUser.findOne({
      username: req.body.username
    });

    // Generate token
    const newToken = new Token({
      _userId: tempUser._id,
      token: randomstring.generate()
    });

    await newToken.save();
    debug('Token created!');
    debug('Sending email to user!');

    const msg = {
      to: req.body.email,
      from: 'noreply@test.com',
      subject: 'Email verification',
      text: `Hello ${req.body.username}, please copy and paste this link into
        your browser to verify your account. `,
      html: `Hi there ${req.body.username},
      <br>
      Thank you for registering
      <br><br>
      Please verify your email by typing in the following token:
      <br>
      Token: <strong>${newToken.token}</strong>
      <br>
      On the following page:
      <a href="http://${req.headers.host}/auth/verify?token=${newToken.token}">Verify Page</a>
      <br><br>
      Have a plesant day!`,
    };
    sgMail.send(msg);
    req.flash('success', 'Account registered, check your email to validate your account. Also make sure to check your spam folder if the message does not appear in your inbox.');
    res.redirect('/solutions');
  },

  // Validate user
  async verifyUser(req, res, next) {
    await Token.findOne({
      token: req.query.token
    }, async (err, foundToken) => {
      debug(foundToken)
      if (err || !foundToken) {
        req.flash('error', 'Token not found! More than likely it has exipred!');
        debug('Token not found! More than likely it has exipred!');
        res.redirect('/auth/token-resend');
        return;
      }
      await TempUser.findOne({
        _id: foundToken._userId
      }, (err, foundUser) => {
        if (err) {
          req.flash('error', 'No user matches that token, recreate a token and try again.');
          debug('No user matches that token, recreate a token and try again.');
          res.redirect('/');
          return;
        }
        debug('Valdating temp user!');
        foundUser.isVerified = true;
        foundUser.save();
        
        debug('Temp user validated, redirecting to password page');
        // This req.flash isnt working ... need to look into this... Maybe because of the way the route is setup ... 
        req.flash('success', 'Account validated, create a password');
        res.render('auth/password', {
          title: 'Password Page'
        });
      });
    });
  },

  async setPassword(req, res, next) {
    const result = await Joi.validate(req.body, passwordSchema);
    if (result.error) {
      debug('error', result.error.message);
      req.flash('error', result.error.message);
      res.redirect('/validate/set-password');
      return;
    }

    let tempUser = await TempUser.findOne({
      username: req.body.username
    });

    if (!tempUser) {
      req.flash('error', 'That user does not exist, you have either typed in the wrong username or it has expired!');
      debug('That user does not exist, you have either typed in the wrong username or it has expired!');
      res.redirect('/auth/pw');
      return;
    }

    if (tempUser.isVerified === false) {
      req.flash('error', 'This user account has not been validated. Check your email and click the link to validate your email!');
      debug('This user account has not been validated. Check your email and click the link to validate your email!');
      res.redirect('/auth/pw');
      return;
    }

    delete req.body.confirmationPassword;
    const newUser = await new User({
      email: tempUser.email,
      username: tempUser.username,
      isVerified: tempUser.isVerified
    });
    await User.register(newUser, req.body.password);
    await tempUser.remove();
    debug('Temp user transfered to User DB');
    req.flash('success', 'Account is now active. Welcome to the site!')
    res.redirect('/solutions');
  }
}