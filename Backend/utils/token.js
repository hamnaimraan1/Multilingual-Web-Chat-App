const sendTok = (user, statusCode, res) => {
  const tok = user.getJWTToken();
  const option = {
    expires: new Date(
      Date.now() + process.env.cookieExpire * 24 * 60 * 60 * 1000,

    ),
    httpOnly:true,
  };
  res.status(statusCode).cookie("token",tok,option).json({
    success:true,
    user,
    token: tok,

  })
};
export default sendTok;