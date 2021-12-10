const socket = io()

const send = document.querySelector('#send')

const loginUserId = send.dataset.loginuserid
const loginUserName = send.dataset.loginusername
const loginUserAvatar = send.dataset.loginuseravatar

socket.emit('noti-message-login', {
  loginUserId,
  loginUserName,
  loginUserAvatar
})

const streamMsgDiv = document.querySelector('.stream-message')

send.addEventListener('click', function onSendClick(event) {
  event.preventDefault()

  const target = event.target.parentElement.previousElementSibling

  if (!isEmpty(target)) {
    socket.emit('send pub msg', {
      loginUserId,
      loginUserName,
      loginUserAvatar,
      message: target.value
    })
    target.value = ''
  }
})

socket.on('noti-message-login', (data) => {
  let div = document.createElement('div')
  div.classList.add('noti-message')
  div.innerHTML = `
        <span class="content">${data.loginUserName} 上線</span>
      `
  streamMsgDiv.append(div)
})

socket.on('pub msg', (data) => {
  let div = document.createElement('div')


  if (loginUserId === data.loginUserId) {
    div.classList.add('self-message')
    div.innerHTML = `
        <span class="content">${data.message}</span>
        <span class="time">下午6:01</span>
        `
    streamMsgDiv.append(div)
  } else {
    div.classList.add('other-message')
    div.innerHTML = `
        <img src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png">
        <div class="content">
          <span class="content">${data.message}</span>
          <span class="time">下午6:01</span>
        </div>
        `
    streamMsgDiv.append(div)
  }
})

socket.on('onlineUser', (data) => {
  console.log(data)
})

