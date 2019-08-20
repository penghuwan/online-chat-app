# 项目测试方法

1. 备注：项目使用了localStorage，所以在本地测试项目时，需要使用两种不同的浏览器，例如火狐和Chrome，才能模拟两个不同的聊天用户
2. 启动项目前，请先执行以下建表语句，然后需要在chat/server/index.js中配置数据库连接参数（数据库名，账号密码等）
```sql
CREATE TABLE USER(
    Id INT PRIMARY KEY AUTO_INCREMENT,
    nickname VARCHAR(50) NOT NULL UNIQUE, #昵称
    account VARCHAR(50) NOT NULL UNIQUE, #账号
    password VARCHAR(100) NOT NULL #密码
);

CREATE TABLE chat_record(
    Id INT PRIMARY KEY AUTO_INCREMENT,
    nickname VARCHAR(50), #昵称
    word TEXT NOT NULL,  #聊天语句
    CONSTRAINT fk_nick FOREIGN KEY (nickname) REFERENCES USER  (nickname) #外键约束
);
```
3. 下载项目，在主目录下运行
```
npm install
```
4. 新开终端, 主目录下运行
```
npm run server 
```
5. 在项目中运行 
```
npm start
```
6. 即可调试


# 业务逻辑
### 登陆注册功能
1. 两个页面，/login用于注册登陆，/chat页面用于实现聊天功能
2. 如果尚未登录就进入/chat页面，将跳转回login进行登陆,登陆成功后跳转到chat
3. 登陆完一定时间内，session的保存在一定时间内可以不用重新登陆,
4. 注册时候，查找账号和昵称是否已存在，如果已存在则返回提示注册失败，否则保存账号和密码
5. 登陆时候先查找账号是否存在，如果不存在或者存在账号但密码不匹配，则提示登录失败，否则登陆成功并跳转
### 聊天功能
6. 用户登陆成功进入聊天页面后，将加入默认聊天室，同时聊天室里原有的老用户将收到新用户进入的通知
7. 用户发送消息时，消息将转发广播给所有其他用户
8. 保留最新的对话历史记录5条，用户首次进入能够看到
9. 聊天面板右侧展示聊天群组内的成员列表

# 相关技术
1. 采用Koa框架的中间件技术分离业务逻辑
   + 借助koa-bodyparser解析request.body
   + 借助koa-session处理session相关的逻辑，默认一天内只需登陆一次（session有效期）
   + 借助koa-router处理路由分发，对不同的路由交由不同的Controller处理
2. 采用MySQL数据库存储数据账号密码数据（mysql2,采用promise风格进行CRUD）
3. 前端：React + React-Router4 构建，采用Axios请求服务端数据，因项目简单，未使用Redux等状态管理框架
4. 实时通信：借助Socket.io完成，对高版本浏览器采用WebSocket协议通讯，对低版本浏览器通过AJAX轮询向下兼容
5. 登陆完后通过localStroage存储账号，下次如果直接进入/chat页面则取出账号并向服务端验证Session
6. 通过webpack完成自动化构建，代码打包，less编译，以及通过proxy实现HTTP的跨域转发
7. 通过bcrypt模块对输入密码加密存储，防止意外泄漏或者彩虹表攻击


# 关于下一步的优化
1. session和其他部分即时通信数据通过redis等外部数据库存取，优化速度
