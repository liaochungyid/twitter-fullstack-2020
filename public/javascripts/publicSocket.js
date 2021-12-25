const send = document.querySelector('#send')
const loginUserId = send.dataset.loginUserId

const join = document.querySelector('.join')
const streamMsgDiv = document.querySelector('.stream-message')

const onlineUsers = document.querySelector('#onlineUsers')
const onlineUserCount = document.querySelector('#onlineUserCount')

join.addEventListener('click', function onScreenClick (event) {
  // 點擊加入聊天室
  // 1. 移除screen
  event.preventDefault()
  event.target.parentElement.classList.add('d-none')

  // 2. 加入socket function
  // 2.a 發出訊息
  send.addEventListener('click', function onSendClick (event) {
    event.preventDefault()

    const target = event.target.parentElement.previousElementSibling

    if (!isEmpty(target)) {
      socket.emit('createPublicMsg', {
        UserId: loginUserId,
        text: target.value
      })
      target.value = ''
    }
  })

  // 2.b 連線發出自己Id
  socket.emit('connectPublicUser', loginUserId)

  // 2.c 執行一次，歷史訊息
  socket.once('getPreviousMessages', data => {
    data.forEach(msg => {
      if (Number(loginUserId) === Number(msg.User.id)) {
        streamMsgDiv.innerHTML += `
      <div class="self-message">
        <span class="content">${slashNtoBr(msg.text)}</span>
        <span class="time">${msg.createdAt}</span>
      </div>
      `
      } else {
        streamMsgDiv.innerHTML += `
      <div class="other-message">
        <img src="${msg.User.avatar}">
        <div class="content">
          <span class="content">${slashNtoBr(msg.text)}</span>
          <span class="time">${msg.createdAt}</span>
        </div>
      </div>
      `
      }
    })
    scrollDownToBottom()
  })

  // 2.d 接收已上線使用者
  socket.on('getConnectedPublicUser', data => {
    let html = ''

    data.forEach(user => {
      html += `
      <div class="user-card">
        <img src="${user.avatar}">
        <div class="user-file">
          <div class="who">
            <div class="name-place">
              <span class="name">${user.name}</span>
              <span class="at-name">@${user.account}</span>
            </div>
            <div class="last-call">
            </div>
          </div>
        </div>
      </div>
      `
    })

    onlineUsers.innerHTML = html
    onlineUserCount.innerText = data.length
  })

  // 2.d 接收及時資訊
  socket.on('getPublicMsg', data => {
    try {
      const div = document.createElement('div')

      switch (data.notifyType) {
        case 'signin':
          // 2.d.1 接收上線通知
          div.classList.add('noti-message')
          div.innerHTML = `<span class="content">${data.user.name} 上線</span>`
          streamMsgDiv.append(div)
          scrollDownToBottom()
          break
        case 'signout':
          // 2.d.2 接收離線通知
          div.classList.add('noti-message')
          div.innerHTML = `<span class="content">${data.user.name} 下線</span>`
          streamMsgDiv.append(div)
          scrollDownToBottom()
          break
        case 'message':
          // 2.d.3 接收訊息
          if (Number(loginUserId) === Number(data.user.id)) {
            div.classList.add('self-message')
            div.innerHTML = `
          <span class="content">${slashNtoBr(data.msg.text)}</span>
          <span class="time">${data.msg.createdAt}</span>
          `
            streamMsgDiv.append(div)
            scrollDownToBottom()
          } else {
            div.classList.add('other-message')
            div.innerHTML = `
          <img src="${data.user.avatar}">
          <div class="content">
            <span class="content">${slashNtoBr(data.msg.text)}</span>
            <span class="time">${data.msg.createdAt}</span>
          </div>
          `
            streamMsgDiv.append(div)
          }

          scrollDownToBottom()
      }
    } catch (err) {
      console.log(err)
    }
  })
})
