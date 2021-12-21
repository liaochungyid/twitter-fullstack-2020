const send = document.querySelector('#send')
const onlineUserId = send.dataset.loginuserid

const streamMsgDiv = document.querySelector('.stream-message')

const onlineUser = document.querySelector('#onlineUser')
const onlineUserCount = document.querySelector('#onlineUserCount')

// 發出訊息
send.addEventListener('click', function onSendClick(event) {
  event.preventDefault()

  const target = event.target.parentElement.previousElementSibling

  if (!isEmpty(target)) {
    socket.emit('createMessage', {
      UserId: onlineUserId,
      text: target.value
    })
    target.value = ''
  }
})

// 連線發出自己Id
socket.on('connect', () => {
  socket.emit('connectUser', onlineUserId)
})

// 接收上線通知
socket.on('notifySignin', (user) => {
  let div = document.createElement('div')
  div.classList.add('noti-message')
  div.innerHTML = `<span class="content">${user.name} 上線</span>`
  streamMsgDiv.append(div)
  scrollDownToBottom()
})

// 接收離線通知
socket.on('notifySignout', (user) => {
  let div = document.createElement('div')
  div.classList.add('noti-message')
  div.innerHTML = `<span class="content">${user.name} 下線</span>`
  streamMsgDiv.append(div)
  scrollDownToBottom()
})

// 執行一次，歷史訊息
socket.once('getPreviousMessages', (data) => {
  data.forEach((item) => {
    if (Number(onlineUserId) === Number(item.User.id)) {
      streamMsgDiv.innerHTML += `
      <div class="self-message">
        <span class="content">${slashNtoBr(item.text)}</span>
        <span class="time">${item.createdAt}</span>
      </div>
      `
    } else {
      streamMsgDiv.innerHTML += `
      <div class="other-message">
        <img src="${item.User.avatar}">
        <div class="content">
          <span class="content">${slashNtoBr(item.text)}</span>
          <span class="time">${item.createdAt}</span>
        </div>
      </div>
      `
    }
  })
  scrollDownToBottom()
})

// 接收訊息
socket.on('getNewMessage', (data) => {
  let div = document.createElement('div')

  if (Number(onlineUserId) === Number(data.User.id)) {
    div.classList.add('self-message')
    div.innerHTML = `
          <span class="content">${slashNtoBr(data.text)}</span>
          <span class="time">${data.createdAt}</span>
        `
    streamMsgDiv.append(div)
    scrollDownToBottom()
  } else {
    div.classList.add('other-message')
    div.innerHTML = `
        <img src="${data.User.avatar}">
        <div class="content">
          <span class="content">${slashNtoBr(data.text)}</span>
          <span class="time">${data.createdAt}</span>
        </div>
        `
    streamMsgDiv.append(div)
  }
  scrollDownToBottom()
})

// 接收上線使用者們
socket.on('getOnlineUser', (data) => {
  let html = ''

  data.onlineUser.forEach(item => {
    html += `
      <div class="usercard">
        <img src="${item.avatar}">
        <div class="userfile">
          <div class="who">
            <div class="nameplace">
              <span class="name">${item.name}</span>
              <span class="at-name">@${item.account}</span>
            </div>
            <div class="lastcall">
            </div>
          </div>
        </div>
      </div>
      `
  })

  onlineUser.innerHTML = html
  onlineUserCount.innerText = data.onlineUserCount
})