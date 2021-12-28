const send = document.querySelector('#send')

const streamMsgDiv = document.querySelector('.stream-message')

const findNewPriChat = document.querySelector('#findNewPriChat')
const modalFindChatUser = document.querySelector('#modalFindChatUser')
const findchatUsercard = document.querySelector('.dialog.find-chat')
const onlineUsers = document.querySelector('#onlineUsers')

// 開啟新聊天室 選單
findNewPriChat.addEventListener('click', async function onFindNewPriChatClick(event) {
  modalFindChatUser.classList.remove('d-none')

  const response = await axios.get(
    `${window.location.origin}/api/chatusers/${loginUserId}`
  )
  
  let html = ``

  response.data.forEach(item => {
    if (item.id !== loginUserId) {
      html += `
            <a class="user-card" data-receiver-id="${item.id}" data-receiver-name="${item.name}" data-receiver-account="${item.account}">
              <div class="imgs">
                <img class="thumbnail-card" src="${item.avatar}" alt="${item.name} avatar">
                <img class="img-card" src="${item.cover}" alt="${item.name} cover">
              </div>
              <div class="texts">
                <div class="name">${item.name}</div>
                <div class="account">@${item.account}</div>
              </div>
            </a>
          `
    }
  })

  findchatUsercard.innerHTML = html
})

// 點擊modal usercard 設定room到send
findchatUsercard.addEventListener('click', function onModalcardClick(event) {
  let target = event.target

  if (!target.classList.contains('dialog')) {
    // 點到dialog 內部，但不是本身時
    while (!target.dataset.receiverId) {
      // 如果沒有 receiver-id 的 dataset 往父元素找
      target = target.parentElement
    }

    // 關閉modal
    modalFindChatUser.classList.add('d-none')

    addRoomAndGetMsg(loginUserId, target, send, streamMsgDiv)
  }
})

// 點擊users usercard 設定room到send
onlineUsers.addEventListener('click', function onUsercardClick(event) {
  let target = event.target

  if (!target.classList.contains('users')) {
    // 點到users 內部，但不是本身時
    while (!target.dataset.receiverId) {
      // 如果沒有 receiver-id 的 dataset 往父元素找
      target = target.parentElement
    }
    
    addRoomAndGetMsg(loginUserId, target, send, streamMsgDiv)
  }
})

// 連線發出自己Id
socket.emit('getConnectedPrivateUser', Number(loginUserId))

// 接收user (左列聊天過的使用者紀錄)
socket.once(`getConnectedPrivateUser${loginUserId}`, (data) => {
  data.forEach(item => {
    if (Number(item.id) !== Number(loginUserId)) {
      // 不顯示自己的card
      onlineUsers.innerHTML += `
      <a class="user-card" data-receiver-id="${item.id}" data-receiver-name="${item.name}" data-receiver-account="${item.account}">
        <img src="${item.avatar}">
        <div class="user-file">
          <div class="who">
            <div class="name-place">
              <span class="name">${item.name}</span>
              <span class="at-name">@${item.account}</span>
            </div>
            <div class="last-call">
              ${item.createdAt}
            </div>
          </div>
          <div class="whoMessage">
            <span class="message ellipsis">${item.text}</span>
          </div>
        </div>
      </a>
      `
    }
  })
})

// 接收訊息
socket.on('getPrivateMsg', (data) => {
  let div = document.createElement('div')

  const {msg, op} = data
  
  if (Number(loginUserId) === Number(msg.senderId)) {
    div.classList.add('self-message')
    div.innerHTML = `
          <span class="content">${slashNtoBr(msg.text)}</span>
          <span class="time">${msg.createdAt}</span>
        `
  } else {
    div.classList.add('other-message')
    div.innerHTML = `
        <img src="${op.avatar}">
        <div class="content">
          <span class="content">${slashNtoBr(msg.text)}</span>
          <span class="time">${msg.createdAt}</span>
        </div>
        `
    socket.emit('updateReadMsg', [msg.id])
  }
  streamMsgDiv.append(div)
  scrollDownToBottom()
})

// send 按鈕callback
function onSendClick(event) {
  if (event) {
    event.preventDefault()

    const target = event.target.parentElement.previousElementSibling

    if (!isEmpty(target)) {
      socket.emit('createPrivateMsg', {
        senderId: event.target.dataset.loginUserId,
        receiverId: event.target.dataset.receiverId,
        text: target.value
      })
      target.value = ''
    }
  }
}

// user card 按下後 系列操作
async function addRoomAndGetMsg (loginUserId, target, sendNode, streamNode) {

  // 刷新畫面
  streamNode.innerHTML = ''
  const opId = target.dataset.receiverId

  sendNode.dataset.receiverId = opId

  // 連線，將獲得歷史資料
  socket.emit('connectPrivateUser', {
    loginUserId,
    opId
  })

  // 將receiverName receiverAccount 放進對話框上方名稱
  document.querySelector('#whoName').innerText = target.dataset.receiverName
  document.querySelector('#whoAtName').innerText = target.dataset.receiverAccount

  socket.once('getPreviousPrivateMsg', (data) => {
    streamNode.innerHTML = ''
    let unread = true
    let readMsg = []

    data.msg.forEach((item) => {
      if (Number(loginUserId) === Number(item.senderId)) {
        streamNode.innerHTML += `
        <div class="self-message">
          <span class="content">${slashNtoBr(item.text)}</span>
          <span class="time">${item.createdAt}</span>
        </div>
        `
      } else {

        if (item.unread) {
          readMsg.push(item.id)
          if (unread) {
            streamMsgDiv.innerHTML += `
            <div class="noti-message unread">
              <span class="content unread">未讀訊息</span>
            </div>
            `
            unread = false
          }
        }

        streamMsgDiv.innerHTML += `
        <div class="other-message">
          <img src="${data.op.avatar}">
          <div class="content">
            <span class="name">${data.op.name}</span>
            <span class="content">${slashNtoBr(item.text)}</span>
            <span class="time">${item.createdAt}</span>
          </div>
        </div>
        `
      }
    })
    scrollDownToBottom()
    
    socket.emit('updateReadMsg', readMsg)
  })

  // 移除原先，否則會重複綁多個事件監聽在上面
  sendNode.removeEventListener('click', onSendClick)
  // 綁定，發送訊息
  sendNode.addEventListener('click', onSendClick)
}
