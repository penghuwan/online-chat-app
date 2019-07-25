import React from 'react';
import { withRouter } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import 'antd/dist/antd.css';
import './style/chat.less';
import { Input, Button, message, Form, Row, Col } from 'antd';

const { Search } = Input;
// socket束的名称
const DEFAULT_ROOM = 'DEFAULT_ROOM'
// 三种类型的聊天文本
const MY_WORD = 'MY_WORD'; // 自己输入的文本
const OTHER_WORD = 'OTHER_WORD'; //自己输出的文本
const NOTICE = 'NOTICE'; // 提示
const OFFLINE_NOTICE = 'OFFLINE_NOTICE'; // 下线提示
const PLAIN_TEXT = 'PLAIN_TEXT' // 普通文本（灰）

axios.defaults.withCredentials = true;

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.nickname = window.localStorage.getItem('nickname');
        this.state = {
            chats: [],
            mems: []
        }
    }

    componentDidMount() {
        const { history } = this.props;
        const account = window.localStorage.getItem('account');
        axios.get(`/api/session?account=${account}`).then(({ data: { success } }) => {
            if (!success) {
                message.error('尚未登录，请先登录!', () => {
                    history.push({ pathname: '/login' })
                })
            } else {
                this.fetchChatRecord();
                this.initSocket();
            }
        })
    }

    fetchChatRecord = () => {
        axios.get('/api/chat_record').then(({ data }) => {
            const records = data.map(item => {
                if (item.nickname === this.nickname) {
                    return { ...item, type: MY_WORD }
                } else {
                    return { ...item, type: OTHER_WORD }
                }
            });
            records.push({ 
                type: PLAIN_TEXT,
                text: '以上为历史记录'
            })
            this.setState({
                chats: records
            })
        })
    }

    // 初始化Socket.io
    initSocket = () => {
        this.socket = io('localhost:4000', {
            transports: ['websocket', 'polling']
        });
        this.joinRoomWithIo();
        this.observeOtherLeave();
        this.observeOtherJoin();
        this.observeOtherMessage();
    }

    scrollToBottom = () => {
        let ele = document.getElementsByClassName('content')[0];
        ele.scrollTop = ele.scrollHeight;
    }

    // 处理自己加入聊天室逻辑
    joinRoomWithIo = () => {
        this.socket.emit('join-room', { newMem: this.nickname }, (mems) => {
            this.setState({
                mems: [...mems]
            })
        });
    }

    // 处理其他用户离开聊天室的逻辑
    observeOtherLeave = () => {
        this.socket.on('other-leave-room', ({ mem }) => {
            this.setState(({ chats, mems }) => {
                return {
                    chats: [...chats, {
                        type: OFFLINE_NOTICE,
                        nickname: mem
                    }],
                    mems: mems.filter(item => item !== mem)
                }
            })
        })
    }

    // 处理他人加入聊天室逻辑
    observeOtherJoin = () => {
        this.socket.on('other-join-room', ({ newMem }) => {
            this.setState(({ chats, mems }) => {
                return {
                    chats: [...chats, {
                        type: NOTICE,
                        nickname: newMem
                    }],
                    mems: [...mems, newMem]
                }
            })
        })
    }

    //处理发送信息逻辑
    sendMessageWithIo = () => {
        this.props.form.validateFields((err, values) => {
            if (!err && values.message) {
                this.socket.emit('send-message', {
                    nickname: this.nickname,
                    word: values.message
                }, () => {
                    this.setState(({ chats }) => {
                        return {
                            chats: [...chats, {
                                type: MY_WORD,
                                nickname: this.nickname,
                                word: values.message
                            }]
                        }
                    }, this.scrollToBottom)
                });
            }
        });
    }

    // 处理他人发送信息的逻辑
    observeOtherMessage = () => {
        this.socket.on('other-send-message', ({ nickname, word }) => {
            this.setState(({ chats }) => {
                return {
                    chats: [...chats, {
                        type: OTHER_WORD,
                        nickname,
                        word
                    }]
                }
            }, this.scrollToBottom)
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form className="chat-form">
                <div className='wrapper'>
                    <div className='chat-wrapper'>
                        <div className='header'>
                            <div className='icon' />
                            <span className='title'>聊天室</span>
                        </div>
                        <div className='content'>
                            <div className='visual-area'>
                                {this.state.chats.map((item, i) => {
                                    switch (item.type) {
                                        case NOTICE:
                                            return (
                                                <div className='notice-wrapper' key={i}>
                                                    <span className='welcome-notice'>{item.nickname}欢迎加入本群</span>
                                                </div>)
                                            break;
                                        case OFFLINE_NOTICE:
                                            return (
                                                <div className='notice-wrapper' key={i}>
                                                    <span className='welcome-notice'>{item.nickname}离开了聊天室</span>
                                                </div>)
                                            break;
                                        case MY_WORD:
                                            return (
                                                <div className='message-wrapper' key={i}>
                                                    <div className='avatar avatar-right'><p>{String(item.nickname).charAt(0)}</p></div>
                                                    <div className='message message-right'>{item.word}</div>
                                                </div>)
                                            break;
                                        case OTHER_WORD:
                                            return (
                                                <div className='message-wrapper' key={i}>
                                                    <div className='avatar avatar-left'><p>{String(item.nickname).charAt(0)}</p></div>
                                                    <div className='message message-left'>{item.word}</div>
                                                </div>)
                                            break;
                                        case PLAIN_TEXT:
                                            return (
                                                <div className='message-wrapper' key={i}>
                                                    <span className='history'>{item.text}</span>
                                                </div>)
                                            break;
                                        default:
                                            break;
                                    }
                                })}
                            </div>
                        </div>
                        <div className='footer'>
                            <Row>
                                <Col span={15}>
                                    <Form.Item>
                                        {getFieldDecorator('message')(
                                            <Search
                                                className='message-input'
                                                placeholder="聊点什么吧"
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Button
                                        ghost
                                        onClick={this.sendMessageWithIo}
                                        className='button'
                                    >
                                        发送
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div className='member-wrapper'>
                        {this.state.mems.filter(item => !!item).map((memNick, i) => {
                            return <div className='member' key={i}><span>{memNick}</span></div>
                        })}
                    </div>
                </div>
            </Form>)
    }
}

export default Form.create({ name: 'chat' })(withRouter(Chat));