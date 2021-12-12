const socket = io()

const notiNoti = document.querySelector('#noti-noti')
const pubChatNoti = document.querySelector('#pub-chat-noti')
const PriChatNoti = document.querySelector('#pri-chat-noti')

const userloginId = notiNoti.dataset.userlogin
// console.log(userloginId)
socket.on('connect', () => {
  socket.emit('userLogin', userloginId)
})

socket.on('notiNoti', (data) => {

  const unreadCount = data.observeds.length | 0
  // console.log(data)
  if (unreadCount === 0) {
    notiNoti.innerHTML = ''
    notiNoti.classList.remove('dot-noti')
    notiNoti.classList.remove('plus')
  } else if (unreadCount > 9) {
    notiNoti.innerHTML = `<span>9<span>`
    notiNoti.classList.add('dot-noti')
    notiNoti.classList.add('plus')
  } else {
    notiNoti.innerHTML = `<span>${unreadCount}<span>`
    notiNoti.classList.add('dot-noti')
  }

})

socket.on('pubChatNoti', (data) => {

  // 不知道資料庫怎操作，有人在線就亮燈
  const unreadCount = data.length | 0
  // console.log(data)
  if (unreadCount === 0) {
    pubChatNoti.classList.remove('dot-noti-sm')
  } else {
    pubChatNoti.classList.add('dot-noti-sm')
  }

})

socket.on('PriChatNoti', (data) => {

  // 不知道資料庫怎操作
  const unreadCount = data.observeds.length | 0
  // console.log(data)
  if (unreadCount === 0) {
    PriChatNoti.innerHTML = ''
    PriChatNoti.classList.remove('dot-noti')
    PriChatNoti.classList.remove('plus')
  } else if (unreadCount > 9) {
    PriChatNoti.innerHTML = `<span>9<span>`
    PriChatNoti.classList.add('dot-noti')
    PriChatNoti.classList.add('plus')
  } else {
    PriChatNoti.innerHTML = `<span>${unreadCount}<span>`
    PriChatNoti.classList.add('dot-noti')
  }

})