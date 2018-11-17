const randomstring = require('randomstring');
const TempUser = require('../../models/tempUser');
const Token = require('../../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  async resendToken(req, res, next) {
    let tempUser = await TempUser.findOne({username: req.body.username});
    let oldToken = await Token.findOne({_userId:tempUser.id});
    if(!tempUser) {
      req.flash('error', 'That user does not exist. You have either typed in an invalid username or the account has expired.  If the account is not validated it is removed after 7 days.');
      res.redirect('/auth/token-resend');
      return;
    }
    // If the token still exists but the user requests another token then update the token thats stored.
    if(oldToken) {
      let newToken = randomstring.generate();
      oldToken.token = newToken;
      await oldToken.save();
      const msg = {
        to: tempUser.email,
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
        Token: <strong>${oldToken.token}</strong>
        <br>
        On the following page:
        <a href="http://${req.headers.host}/auth/verify?token=${oldToken.token}">Verify Page</a>
        <br><br>
        Have a plesant day!`,
      };
      sgMail.send(msg);
      req.flash('Success', `A new token has been send to your email account: ${tempUser.email}. Please make sure to check your spam folder if the message does not appear in your inbox.`);
      res.redirect('/solutions');
      return;
    }
    // If the token has expired then create a new token and link it to the temp users id.
    const newToken = new Token({
      _userId: tempUser._id,
      token: randomstring.generate()
    });
    await newToken.save();
    const msg = {
      to: tempUser.email,
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
      Token: <strong>${oldToken.token}</strong>
      <br>
      On the following page:
      <a href="http://${req.headers.host}/auth/verify?token=${oldToken.token}">Verify Page</a>
      <br><br>
      Have a plesant day!`,
    };
    sgMail.send(msg);
    req.flash('Success', `A new token has been send to your email account: ${tempUser.email}. Please make sure to check your spam folder if the message does not appear in your inbox.`);
    res.redirect('/solutions');
    return;
  }
}