const body = document.querySelector('body')
const modal = document.querySelectorAll('.modal')
const modalReply = document.querySelector('#modal-reply')
const modalConfirm = document.querySelector('#modal-confirm-del')

const tweetsPostForm = document.querySelector('#tweets-post-form')
const tweetsPostFormTextarea = document.querySelector(
  '#tweets-post-form-textarea'
)
const modalPostForm = document.querySelector('#modal-post-form')
const modalPostFormTextarea = document.querySelector(
  '#modal-post-form-textarea'
)
const inputs = document.querySelectorAll('input,textarea')

const chatTextarea = document.querySelector('#textareaAutogrow')

const notis = document.querySelector('#notis')

// // 全畫面監聽器
body.addEventListener('click', async (event) => {
  const target = event.target

  if (target.classList.contains('close') || target.classList.contains('mask')) {
    // 點擊X icon關閉，另可點擊modal對話框以外地方關閉
    Array.from(modal).forEach((el) => {
      el.classList = 'modal d-none'
    })
  } else if (target.classList.contains('commenting')) {
    // 如果按下個別"回覆"icon，開啟 replying modal
    // axios here to get tweet info
    let tweetId = target.dataset.tweetid
    if (!tweetId) {
      tweetId = target.parentElement.dataset.tweetid
    }

    const response = await axios.get(
      `${window.location.origin}/api/tweets/${tweetId}`
    )
    const { tweet, loginUser } = response.data

    const modalHtml = `
    <div class="mask">
      <div class="dialog">
        <div class="dialog-header">
          <a class="close"><i class='X-orange close'></i></a>
        </div>
        <div class="replyarea">

          <div class="tweet">
            <a>
              <img class="thumbnail" src="${tweet.User.avatar}" alt="">
            </a>
            <div class="tweetcontent">
              <a class="tweetuser">
                <span class="name ellipsis">${tweet.User.name}</span>
                <span class="at-name ellipsis">${tweet.User.account}</span>
                <span class="timer ellipsis">${tweet.createdAt}</span>
              </a>
              <span class="tweetdescription">
              ${tweet.description}
              </span>
              <span class="replyto">回覆給
                <span class="at-name">@${tweet.User.account}</span>
              </span>
            </div>

          </div>
        </div>

        <div class="postarea">
          <a>
            <img class="thumbnail" src="${loginUser.avatar}" alt="">
          </a>
          <form action="/tweets/${tweet.id}/replies" method="post" id="modal-reply-form" novalidate>
            <input type="hidden" name="userId" value="${loginUser.id}">
            <textarea name="comment" maxlength="140" cols="48" rows="2" placeholder="推你的回覆"
              id="modal-reply-form-textarea" required></textarea>
            <div class="foot">
              <span class="d-none">內容不可空白</span>
              <button type="summit" class="btn-fill">回覆</button>
            </div>
          </form>
        </div>

      </div>
    </div>
    `
    modalReply.innerHTML = modalHtml

    modalReply.classList.remove('d-none')

    const modalReplyForm = document.querySelector('#modal-reply-form')
    const modalReplyFormTextarea = document.querySelector(
      '#modal-reply-form-textarea'
    )

    validityEmpty(modalReplyForm, modalReplyFormTextarea)
  } else if (target.classList.contains('back-arror')) {
    history.back()
  } else if (target.classList.contains('confirm-del')) {
    const tweetId = target.dataset.tweetid

    modalConfirm.innerHTML = `
    <div class="mask">
      <div class="dialog sm">
        <div class="warning-title">
          <div class="warning-msg">
            <h2 class="text">你刪除推文 !</h2>
            <h4 class="text">此操作不可回復</h4>
          </div>
          <i class="warning"></i>
        </div>
        <div class="buttons">
          <button class="btn-outline sm close">取消</button>
          <form action="/admin/tweets/${tweetId}?_method=DELETE" method="POST">
            <button type="submit" class="btn-fill sm">確認刪除</button>
          </form>
        </div>
      </div>
    </div>
    `

    modalConfirm.classList.remove('d-none')
  }
})

if (tweetsPostForm) {
  validityEmpty(tweetsPostForm, tweetsPostFormTextarea)
}

if (modalPostForm) {
  validityEmpty(modalPostForm, modalPostFormTextarea)
}

if (inputs) {
  inputs.forEach((el) => {
    el.addEventListener('focus', function onInputFocus(event) {
      el.parentElement.classList.add('focus')
    })
    el.addEventListener('blur', function onInputBlur(event) {
      el.parentElement.classList.remove('focus')
    })
    el.addEventListener('invalid', onInputInvalid)

    el.addEventListener('keyup', onInputKeyup)
  })
}

if (chatTextarea) {
  chatTextarea.addEventListener('keyup', function onTextareaKeyup(event) {
    const target = event.target
    const keycode = event.keyCode

    let clientheight = target.clientHeight

    if (event.keyCode === 13 && !event.shiftKey) {
      // enter 送出表單，shift+enter不送出(換行)
      document.querySelector("#send").click()
      target.style.height = '30px'
      clientheight = 30
      target.value = ''
    } else if ([8, 46].includes(keycode)) {
      // backspace或del按鍵，重測行高
      target.style.height = '30px'
      clientheight = 30
    }

    let adjustedheight = target.scrollHeight

    if (adjustedheight > clientheight) {
      // 卷軸高度 大於 現在高度，設定表單高度為卷軸高度
      target.style.height = adjustedheight + 'px';
    }
  })
}

if (notis) {
  const response = async function func() {
    return await axios.get(
      `${window.location.origin}/api/news`
    )
  }()

  response.forEach(item => {
    if (item.type === '未讀的追蹤者推文') {
      notis.innHTML += `
      <a href="/tweets/${item.TweetId}" class="noti">
        <div class="noti-title">
          <img class="thumbnail" src="${item.User.avatar}" alt="${item.User.name} avatar">

            <div class="noti-msg">
              ${item.User.name} 有新的推文通知
            </div>
        </div>

        <div class="content">
          ${item.Tweet.description}
        </div>
      </a>
      `
    } else if (item.type === '未讀的被讚事件') {
      notis.innHTML += `
    <a href="/tweets/${item.TweetId}" class="noti">
    <div class="noti-title">
      <img class="thumbnail" src="${item.User.avatar}" alt="${item.User.name} avatar">

      <div class="noti-msg">
        ${item.User.name} 喜歡妳的貼文
      </div>
    </div>
  </a>
   `
    }

  })
}




function isEmpty(nodeElement) {
  // 無文字回傳true，文字長度大於0，回傳false
  return !nodeElement.value.replace(/\s/g, '').length
}

function validityEmpty(form, inputarea) {
  // 驗證inputarea是否為空白
  form.addEventListener('submit', function onFormSubmitted(event) {
    if (!form.checkValidity() || isEmpty(inputarea)) {
      // 停止type=submit預設動作
      event.stopPropagation()
      event.preventDefault()
      //  驗證不通過，顯示alert message (移除d-none class)
      form.lastElementChild.firstElementChild.classList = ''
    }
  })

  inputarea.addEventListener('keyup', function onFormKeyup(event) {
    if (!isEmpty(inputarea)) {
      //  使用者開始輸入，隱藏alert message (加上d-none class)
      form.lastElementChild.firstElementChild.classList = 'd-none'
    }
  })
}

function onInputInvalid(event) {
  // submit 驗證客製功能
  const target = event.target

  if (target.validity.valueMissing) {
    if (target.name === 'account') {
      target.parentElement.setAttribute('err_msg', '帳號不存在！')
    } else {
      target.parentElement.setAttribute('err_msg', '內容不可為空白')
    }
  }

  if (target.validity.typeMismatch) {
    target.parentElement.setAttribute('err_msg', '格式錯誤')
  }

  if (target.validity.tooLong) {
    target.parentElement.setAttribute('err_msg', '字數超出上限！')
  }

  if (target.validity.tooShort) {
    target.parentElement.setAttribute('err_msg', '最少4個英文或數字組合！')
  }

  event.stopPropagation()
  event.preventDefault()
  target.parentElement.classList.add('invalid')
}

function onInputKeyup(event) {
  // 使用者開始輸入，取消invalid樣式
  const target = event.target
  target.parentElement.classList.remove('invalid')

  if (event.target.name === 'account') {
    // 避免非英文數字輸入account
    target.value = target.value.replace(/[\W]/g, '')
  }
}

// 滾動聊天畫面至最下方
function scrollDownToBottom() {
  if (streamMsgDiv.lastElementChild) {
    streamMsgDiv.lastElementChild.scrollIntoView()
  }
}

// string 仿 Array.splice 功能
function stringSplice(str, start, delCount, newSubStr) {
  return str.slice(0, start) + newSubStr + str.slice(start + delCount)
}

// \n換行符號替換<br>
function slashNtoBr(str, delStr = '\n', newStr = '<br>') {
  let result = str

  while (result.indexOf(delStr) !== -1) {
    // 替換單一 delStr
    result = stringSplice(result, result.indexOf(delStr), delStr.length, newStr)
  }

  while (result.indexOf(newStr + newStr) !== -1) {
    // 替換 連續 newStr
    result = stringSplice(result, result.indexOf(newStr + newStr), newStr.length * 2, newStr)
  }

  if (result.indexOf(newStr) === 0) {
    result = result.slice(newStr.length)
  }

  return result
}