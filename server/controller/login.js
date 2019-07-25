const bcrypt = require('bcrypt');
const saltRounds = 10;

async function handleLogin(ctx, next) {
  const { account, password } = ctx.request.body;
  const [rows] = await ctx.db.query(`SELECT * FROM USER WHERE account = "${account}"`);
  // 账号不存在
  if (rows.length === 0) {
    ctx.body = {
      success: false,
      type: 1,
      nickname: null
    };
    return;
  }

  // 账号存在，密码错误
  const success = await bcrypt.compare(password, rows[0]['password']);
  if (!success) {
    ctx.body = {
      success: false,
      type: 2,
      nickname: null
    };
    return;
  }
  // 登陆成功
  const nickname = rows[0]['nickname'];
  ctx.body = {
    success: true,
    type: 0,
    nickname: nickname,
    account: account
  };
  // 设置session;
  ctx['session'][account] = account;
}

async function handleRegister(ctx, next) {
  const { account, password, nickname } = ctx.request.body;
  const [rows] = await ctx.db.query(`SELECT * FROM USER WHERE account = "${account}" OR nickname = "${nickname}"`);
  if (rows.length > 0) {
    // 注册失败，账号或昵称已存在
    ctx.body = {
      success: false,
      nickname: null
    };
    return;
  }
  let hashPwd = await bcrypt.hash(password, saltRounds);
  await ctx.db.execute('INSERT INTO USER (account, password,nickname) VALUE (?,?,?)', [account, hashPwd, nickname])
  ctx.body = {
    success: true,
    nickname: nickname
  };
}

function handleSession(ctx) {
  const { account } = ctx.query;
  if (ctx.session[account]) {
    ctx.body = {
      success: true
    };
  } else {
    ctx.body = {
      success: false
    };
  }
}

async function handleChatRecord(ctx, next) {
  const [rows] = await ctx.db.query('SELECT * FROM chat_record ORDER BY Id DESC LIMIT 5');
  rows.reverse();
  ctx.body = rows;
}

module.exports = {
  handleLogin,
  handleRegister,
  handleChatRecord,
  handleSession
}