const socket = io()

const notiNoti = document.querySelector('#notiNoti')
const publicNoti = document.querySelector('#pubChatNoti')
const privateNoti = document.querySelector('#priChatNoti')

const userloginId = notiNoti.dataset.loginUser

if (notiNoti) {
  socket.on('connect', () => {
    socket.emit('connectLogin', userloginId)
  })

  socket.on('getPreviousNoti', data => {
    notiDisplayDot(publicNoti, data.getPublicNoti)
    notiDisplayCount(notiNoti, data.getNotiNoti)
    notiDisplayCount(privateNoti, data.getPrivateNoti)
  })

  socket.on('getPublicNoti', data => {
    notiDisplayDot(publicNoti, data)
  })

  socket.on('getPrivateNoti', data => {
    notiDisplayCount(privateNoti, privateNoti.firstElementChild.innerText + 1)
  })

  socket.on('getNotiNoti', data => {
    notiDisplayCount(notiNoti, notiNoti.firstElementChild.innerText + 1)
  })
}

// 顯示或移除 綠點提示
function notiDisplayDot(node, boolean) {
  if (boolean) {
    if (!node.classList.contains('dot-noti-sm')) {
      node.classList.add('dot-noti-sm')
    }
  } else {
    node.classList.remove('dot-noti-sm')
  }
}

// 顯示或移除 數量提示
function notiDisplayCount(node, length) {
  // or 0 資料庫可能crash
  const unreadCount = length | 0
  if (unreadCount === 0) {
    node.innerHTML = ''
  } else if (unreadCount > 99) {
    node.innerHTML = `<span class='noti'>99</span>`
  } else {
    node.innerHTML = `<span class='noti'>${unreadCount}</span>`
  }
}
