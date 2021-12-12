// const socket = io()

const send = document.querySelector('#send')
const onlineUserId = send.dataset.loginuserid

const streamMsgDiv = document.querySelector('.stream-message')

const findNewPriChat = document.querySelector('#findNewPriChat')
const modalFindChatUser = document.querySelector('#modal-findChatUser')
const findchatUsercard = document.querySelector('.dialog.findchat')
const onlineUser = document.querySelector('#onlineUser')

let roomid

// 開啟新聊天室 選單 OK
findNewPriChat.addEventListener('click', async function onFindNewPriChat(event) {
  modalFindChatUser.classList.remove('d-none')

  const response = await axios.get(
    `${window.location.origin}/api/chatusers/${onlineUserId}`
  )

  let html = ``

  response.data.forEach(item => {
    html += `
            <a class="usercard" data-receiverid="${item.id}" data-receivername="${item.name}" data-receiveraccount="${item.account}">
              <div class="imgs">
                <img class="thumbnail-card" src="${item.avatar}" alt="${item.name} avatar">
                <img class="img-card" src="${item.cover}" alt="{${item.name} cover">
              </div>
              <div class="texts">
                <div class="name">${item.name}</div>
                <div class="account">@${item.account}</div>
              </div>
            </a>
          `

  })

  findchatUsercard.innerHTML = html
})

  // 點擊usercard 設定room到send OK
  ;[findchatUsercard, onlineUser].forEach(el => {
    el.addEventListener('click', function onUsercardClick(event) {
      let target = event.target

      if (!(target.classList.contains('dialog') || target.classList.contains('users'))) {
        // 點到dialog/users 內部，但不是本身時
        while (!target.dataset.receiverid) {
          // 如果沒有 receiverid 的 dataset 往父元素找
          target = target.parentElement
        }


        const opId = target.dataset.receiverid

        // 生成roomid 放進send
        roomid = onlineUserId < opId ? onlineUserId + '=' + opId : opId + '=' + onlineUserId

        send.dataset.roomid = roomid

        // 請求歷史資料
        socket.emit('connectUserPriRoom', {
          onlineUserId,
          roomid,
          opId
        })

        // 將receivername receiveraccount 放進對話框上方名稱
        document.querySelector('#who-name').innerText = target.dataset.receivername
        document.querySelector('#who-at-name').innerText = target.dataset.receiveraccount

        // 關閉modal
        modalFindChatUser.classList.add('d-none')


        socket.once('getPriPreMsg', (data) => {
          let unread = true
          data.priMsg.forEach((item) => {
            if (item.unread && unread) {
              streamMsgDiv.innerHTML += `
      <div class="noti-message unread">
        <span class="content unread">未讀訊息</span>
      </div>
      `
              unread = false
            }
            if (Number(onlineUserId) === Number(item.senderId)) {
              streamMsgDiv.innerHTML += `
      <div class="self-message">
        <span class="content">${slashNtoBr(item.text)}</span>
        <span class="time">${item.createdAt}</span>
      </div>
      `
            } else {
              streamMsgDiv.innerHTML += `
      <div class="other-message">
        <img src="${data.opUser.avatar}">
        <div class="content">
          <span class="name">${data.opUser.name}</span>
          <span class="content">${slashNtoBr(item.text)}</span>
          <span class="time">${item.createdAt}</span>
        </div>
      </div>
      `
            }
          })
          scrollDownToBottom()
        })
      }
    })
  })

// 連線發出自己Id OK
socket.on('connect', () => {
  socket.emit('connectUserPri', onlineUserId)
})

// 接收user (左列聊天過的使用者紀錄)
socket.on(`pri users for ${onlineUserId}`, (data) => {
  data.forEach(item => {
    if (Number(item.id) !== Number(onlineUserId)) {
      // 不顯示自己的card
      onlineUser.innerHTML += `
      <a class="usercard" data-receiverid="${item.id}" data-receivername="${item.name}" data-receiveraccount="${item.account}">
        <img src="${item.avatar}">
        <div class="userfile">
          <div class="who">
            <div class="nameplace">
              <span class="name">${item.name}</span>
              <span class="at-name">@${item.account}</span>
            </div>
            <div class="lastcall">
              ??啥時間
            </div>
          </div>
          <div class="whoMessage">
            <span class="message ellipsis">${item.introduction}</span>
          </div>
        </div>
      </a>
      `
    }
  })
})

// 發出訊息
send.addEventListener('click', function onSendClick(event) {
  event.preventDefault()

  const target = event.target.parentElement.previousElementSibling

  if (!isEmpty(target)) {
    socket.emit('createPriMsg', {
      roomid: roomid,
      senderId: Number(onlineUserId),
      text: target.value
    })
    target.value = ''
  }
})

// 接收訊息
socket.on('getNewPriMsg', (data) => {
  let div = document.createElement('div')

  msg = data.newMessage
  rec = data.receiver

  if (Number(onlineUserId) === Number(msg.senderId)) {
    div.classList.add('self-message')
    div.innerHTML = `
          <span class="content">${slashNtoBr(msg.text)}</span>
          <span class="time">${msg.createdAt}</span>
        `
    streamMsgDiv.append(div)
    scrollDownToBottom()
  } else {
    div.classList.add('other-message')
    div.innerHTML = `
        <img src="${rec.avatar}">
        <div class="content">
          <span class="content">${slashNtoBr(msg.text)}</span>
          <span class="time">${msg.createdAt}</span>
        </div>
        `
    streamMsgDiv.append(div)
  }
  scrollDownToBottom()
})