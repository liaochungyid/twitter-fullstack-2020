const socket = io()

const send = document.querySelector('#send')
const onlineUserId = send.dataset.loginuserid

const streamMsgDiv = document.querySelector('.stream-message')

const findNewPriChat = document.querySelector('#findNewPriChat')
const modalFindChatUser = document.querySelector('#modal-findChatUser')
const findchatUsercard = document.querySelector('.dialog.findchat')

const onlineUser = document.querySelector('#onlineUser')

// 開啟新聊天室 選單
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

  // 點擊usercard 開啟新room
  ;[findchatUsercard, onlineUser].forEach(el => {
    el.addEventListener('click', function onUsercardClick(event) {
      let target = event.target

      if (!(target.classList.contains('dialog') || target.classList.contains('users'))) {
        // 點到dialog/user 內部，但不是本身時
        while (!target.dataset.receiverid) {
          // 如果沒有 receiverid 的 dataset 往父元素找
          target = target.parentElement
        }


        const opId = target.dataset.receiverid

        // 生成roomid 放進send
        const roomid = onlineUserId < opId ? onlineUserId + '=' + opId : opId + '=' + onlineUserId

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
      }
    })
  })


// 發出訊息
send.addEventListener('click', function onSendClick(event) {
  event.preventDefault()

  const target = event.target.parentElement.previousElementSibling

  if (!isEmpty(target)) {
    socket.to(roomid).emit('createMessage', {
      UserId: onlineUserId,
      text: target.value
    })
    target.value = ''
  }
})

// 連線發出自己Id
socket.on('connect', () => {
  socket.emit('connectUserPri', onlineUserId)
})

socket.on(`pri users for ${onlineUserId}`, (data) => {
  data.forEach(item => {
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
  })
})

socket.once('getPriPreMsg', (data) => {
  data.priMsg.forEach((item) => {
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

// 接收上線通知
// socket.on('notifySignin', (user) => {
//   let div = document.createElement('div')
//   div.classList.add('noti-message')
//   div.innerHTML = `<span class="content">${user.name} 上線</span>`
//   streamMsgDiv.append(div)
//   scrollDownToBottom()
// })

// 接收離線通知
// socket.on('notifySignout', (user) => {
//   let div = document.createElement('div')
//   div.classList.add('noti-message')
//   div.innerHTML = `<span class="content">${user.name} 下線</span>`
//   streamMsgDiv.append(div)
//   scrollDownToBottom()
// })

// 執行一次，歷史訊息
// socket.once('getPreviousMessages', (data) => {
//   data.forEach((item) => {
//     if (Number(onlineUserId) === Number(item.User.id)) {
//       streamMsgDiv.innerHTML += `
//       <div class="self-message">
//         <span class="content">${slashNtoBr(item.text)}</span>
//         <span class="time">${item.createdAt}</span>
//       </div>
//       `
//     } else {
//       streamMsgDiv.innerHTML += `
//       <div class="other-message">
//         <img src="${item.User.avatar}">
//         <div class="content">
//           <span class="name">${item.User.name}</span>
//           <span class="content">${slashNtoBr(item.text)}</span>
//           <span class="time">${item.createdAt}</span>
//         </div>
//       </div>
//       `
//     }
//   })
//   scrollDownToBottom()
// })

// 接收訊息
// socket.on('getNewMessage', (data) => {
//   let div = document.createElement('div')

//   if (Number(onlineUserId) === Number(data.User.id)) {
//     div.classList.add('self-message')
//     div.innerHTML = `
//           <span class="content">${slashNtoBr(data.text)}</span>
//           <span class="time">${data.createdAt}</span>
//         `
//     streamMsgDiv.append(div)
//     scrollDownToBottom()
//   } else {
//     div.classList.add('other-message')
//     div.innerHTML = `
//         <img src="${data.User.avatar}">
//         <div class="content">
//           <span class="name">${data.User.id}</span>
//           <span class="content">${slashNtoBr(data.text)}</span>
//           <span class="time">${data.createdAt}</span>
//         </div>
//         `
//     streamMsgDiv.append(div)
//   }
//   scrollDownToBottom()
// })

// 接收上線使用者們
// socket.on('getOnlineUserPri', (data) => {
//   let html = ''

//   data.onlineUser.forEach(item => {
//     html += `
//       <a class="usercard" data-receiverid="${item.id}" data-receivername="${item.name}" data-receiveraccount="${item.account}">
//         <img src="${item.avatar}">
//         <div class="userfile">
//           <div class="who">
//             <div class="nameplace">
//               <span class="name">${item.name}</span>
//               <span class="at-name">@${item.account}</span>
//             </div>
//             <div class="lastcall">
//               5秒前
//             </div>
//           </div>
//           <div class="whoMessage">
//             <span
//               class="message ellipsis">還沒有最新一筆聊天紀錄，如果沒有就pass 空白!</span>
//           </div>
//         </div>
//       </a>
//       `
//   })

//   onlineUser.innerHTML = html
// })