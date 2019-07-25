import React from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { Input, Button, Form, message } from 'antd'
import './style/login.less'

const frames = {
    LOGIN_STATE: 'LOGIN_STATE',      // 登陆
    REGISTER_STATE: 'REGISTER_STATE' // 注册
}

axios.defaults.withCredentials = true;
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            frame: frames['LOGIN_STATE']
        }
    }

    toggleFrameState = () => {
        this.setState(({ frame }) => {
            const nextFrame = frame === frames['LOGIN_STATE']
                ? frames['REGISTER_STATE'] : frames['LOGIN_STATE'];
            return {
                frame: nextFrame
            }
        })
    }

    handleLink = ({ account, nickname }) => {
        window.localStorage.setItem('account', account);
        window.localStorage.setItem('nickname', nickname);
        this.props.history.push({ pathname: '/chat' });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { account, password, nickname } = values;

                if (this.state.frame === frames['LOGIN_STATE']) {
                    axios.post('/api/login', {
                        account,
                        password
                    }).then((payload) => {
                        const { data } = payload;
                        const { type, nickname, account } = data;
                        // debugger;
                        switch (type) {
                            case 0:
                                message.success('登陆成功', () => {
                                    this.handleLink({ nickname, account });
                                })
                                break;
                            case 1:
                                message.error('登陆失败，账号不存在')
                                break;
                            case 2:
                                message.error('登陆失败，密码错误')
                                break;
                            default:
                                break;
                        }
                    });
                } else {
                    axios.post('/api/register', {
                        account,
                        password,
                        nickname
                    }).then((payload) => {
                        const { data } = payload;
                        const { success } = data;
                        if (success) {
                            message.success('注册成功')
                        } else {
                            message.error('账号或昵称已存在，注册失败')
                        }
                    });
                }
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">
                <div className='login-wrapper'>
                    <div className='logo' />
                    {this.state.frame === frames['REGISTER_STATE']
                        && <Form.Item>
                            {getFieldDecorator('nickname', {
                                rules: [{ required: true, message: '昵称不能为空' }],
                            })(
                                <Input
                                    className='input'
                                    size="large"
                                    placeholder="请输入昵称"
                                />
                            )}
                        </Form.Item>
                    }
                    <Form.Item>
                        {getFieldDecorator('account', {
                            rules: [{ required: true, message: '请输入用户名' }],
                        })(
                            <Input
                                className='input'
                                size="large"
                                placeholder="请输入账号"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '请输入密码!' }],
                        })(
                            <Input
                                className='input'
                                size="large"
                                placeholder="请输入密码"
                            />
                        )}
                    </Form.Item>
                    <Button className='login-button' type="primary" htmlType="submit">
                        {this.state.frame === frames['REGISTER_STATE']
                            ? '注册'
                            : '登陆'
                        }
                    </Button>
                    <p className='tip' onClick={this.toggleFrameState}>
                        {this.state.frame === frames['REGISTER_STATE']
                            ? '已注册，去登陆？'
                            : '注册账号'
                        }
                    </p>
                </div>
            </Form>)
    }
}
const wrapperLogin = withRouter(Login);
export default Form.create({ name: 'login' })(wrapperLogin);
