const socket = io()

const send = document.querySelector('#send')

const onlineUserId = send.dataset.loginuserid

const streamMsgDiv = document.querySelector('.stream-message')

// 從這裡開始

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

socket.on('connect', () => {
  socket.emit('connectUser', onlineUserId)
})

socket.on('notifySignin', (user) => {
  let div = document.createElement('div')
  div.classList.add('noti-message')
  div.innerHTML = `<span class="content">${user.name} 上線</span>`
  streamMsgDiv.append(div)
})

socket.on('notifySignout', (user) => {
  let div = document.createElement('div')
  div.classList.add('noti-message')
  div.innerHTML = `<span class="content">${user.name} 下線</span>`
  streamMsgDiv.append(div)
})

socket.on('getPreviousMessages', (data) => {
  data.forEach((item) => {
    if (Number(onlineUserId) === Number(item.User.id)) {
      streamMsgDiv.innerHTML += `
      <div class="self-message">
        <span class="content">${item.text}</span>
        <span class="time">${item.createdAt}</span>
      </div>
      `
    } else {
      streamMsgDiv.innerHTML += `
      <div class="other-message">
        <img src="${item.User.avatar}">
        <div class="content">
          <span class="name">${item.User.name}</span>
          <span class="content">${item.text}</span>
          <span class="time">${item.createdAt}</span>
        </div>
      </div>
      `
    }
  })
})

socket.on('getNewMessage', (data) => {
  let div = document.createElement('div')

  if (Number(onlineUserId) === Number(data.User.id)) {
    div.classList.add('self-message')
    div.innerHTML = `
          <span class="content">${data.text}</span>
          <span class="time">${data.createdAt}</span>
        `
    streamMsgDiv.append(div)
  } else {
    div.classList.add('other-message')
    div.innerHTML = `
        <img src="${data.User.avatar}">
        <div class="content">
          <span class="name">${data.User.id}</span>
          <span class="content">${data.text}</span>
          <span class="time">${data.createdAt}</span>
        </div>
        `
    streamMsgDiv.append(div)
  }
  // 滾動螢幕
})
