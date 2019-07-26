const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const mysql = require('mysql2/promise');
const app = new Koa();
const Server = require('socket.io');
const router = new Router();

const loginController = require('./controller/login.js');
const chatController = require('./controller/chat.js');

// session控制
app.keys = ['some secret'];
const CONFIG = {
    key: 'koa:sess',   //cookie key (default is koa:sess)
    maxAge: 86400000,  // cookie的过期时间 maxAge in ms (default is 1 days)
    overwrite: true,  //是否可以overwrite    (默认default true)
    httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
    signed: true,   //签名默认true
    rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false,  //(boolean) renew session when session is nearly expired,
};
app.use(session(CONFIG, app));


// 初始化数据库连接
app.context.db = mysql.createPool({
    host: '127.0.0.1',
    user: '##数据库用户名',
    password: '##你的数据库密码',
    database: '##你的数据库名称',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 解析request的body
app.use(bodyParser());

// 路由控制
router.post('/api/login', loginController.handleLogin);
router.post('/api/register', loginController.handleRegister);
router.get('/api/chat_record', loginController.handleChatRecord);
router.get('/api/session', loginController.handleSession);

app.use(router.routes())
    .use(router.allowedMethods());

const io = require('socket.io')({
    transports: ['websocket', 'polling'] // 强行约定优先级
});
// 分发Socket请求

const db = app.context.db;
io.on('connection', (socket) => {
    socket.on('join-room', (data,cb) => chatController.handleJoinRoom(socket, data,cb));
    socket.on('send-message', (data,cb) => chatController.handleMessage(socket,data,cb,db));
    socket.on('disconnecting', () => { chatController.handleOffline(socket) });
})
io.listen(4000);
app.listen(3000);
