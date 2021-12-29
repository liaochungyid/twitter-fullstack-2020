const socket = io()

const notiNoti = document.querySelector('#notiNoti')
const publicNoti = document.querySelector('#pubChatNoti')
const privateNoti = document.querySelector('#priChatNoti')

const loginUserId = Number(notiNoti.dataset.loginUser)

if (notiNoti) {
  socket.on('connect', () => {
    socket.emit('connectLogin', loginUserId)
  })

  socket.once('getPreviousNoti', data => {
    notiDisplayDot(publicNoti, data.getPublicNoti)
    notiDisplayCount(notiNoti, data.getNotiNoti)
    notiDisplayCount(privateNoti, data.getPrivateNoti)
  })

  socket.on('updatePublicNoti', data => {
    notiDisplayDot(publicNoti, data)
  })

  socket.on('updatePrivateNoti', data => {
    notiDisplayCount(privateNoti, Number(privateNoti.firstElementChild.innerText) + data)
  })
}

// 顯示或移除 綠點提示 (是否有人在公開聊天室)
function notiDisplayDot (node, boolean) {
  if (boolean) {
    if (!node.classList.contains('dot-noti-sm')) {
      node.classList.add('dot-noti-sm')
    }
  } else {
    node.classList.remove('dot-noti-sm')
  }
}

// 顯示或移除 數量提示
function notiDisplayCount (node, length) {
  // or 0 資料庫可能crash
  const unreadCount = length | 0
  if (unreadCount === 0) {
    node.innerHTML = '<span></span>'
  } else if (unreadCount > 99) {
    node.innerHTML = "<span class='noti'>99</span>"
  } else {
    node.innerHTML = `<span class='noti'>${unreadCount}</span>`
  }
}
