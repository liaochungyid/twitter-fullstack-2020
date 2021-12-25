const body = document.querySelector('body')
const modal = document.querySelectorAll('.modal')
const modalReply = document.querySelector('#modalReply')
const modalConfirm = document.querySelector('#modalConfirmDelete')

const tweetsPostForm = document.querySelector('#tweetsPostForm')
const tweetsPostFormTextarea = document.querySelector('#tweetsPostFormTextarea')
const modalPostForm = document.querySelector('#modalPostForm')
const modalPostFormTextarea = document.querySelector('#modalPostFormTextarea')
const inputs = document.querySelectorAll('input,textarea')
const allButton = document.querySelectorAll('a, button')

const chatTextarea = document.querySelector('#textareaAutoGrow')

// // 全畫面監聽器 (1.關閉modal(all) 2.開啟回覆modal 3.back-arrow返回首頁 4.刪除modal(admin only) 5.小鈴鐺訂閱btn-noti)
body.addEventListener('click', async event => {
  const target = event.target

  // 1.關閉modal(all)
  if (target.classList.contains('close') || target.classList.contains('mask')) {
    // 點擊X icon關閉，另可點擊modal對話框以外地方關閉
    Array.from(modal).forEach(el => {
      el.classList = 'modal d-none'
    })
  } else if (target.classList.contains('commenting')) {
    // 2.開啟回覆modal
    // 如果按下個別"回覆"icon，開啟 replying modal
    // axios here to get tweet info
    let tweetId = target.dataset.tweetId
    if (!tweetId) {
      tweetId = target.parentElement.dataset.tweetId
    }

    const response = await window.axios.get(
      `${window.location.origin}/api/tweets/${tweetId}`
    )
    const { tweet, loginUser } = response.data

    modalReply.innerHTML = `
    <div class="mask">
      <div class="dialog">
        <div class="dialog-header">
          <a class="close"><i class='X-orange close'></i></a>
        </div>
        <div class="reply-area">

          <div class="tweet">
            <a>
              <img class="thumbnail" src="${tweet.User.avatar}" alt="">
            </a>
            <div class="tweet-content">
              <a class="tweet-user">
                <span class="name ellipsis">${tweet.User.name}</span>
                <span class="at-name ellipsis">${tweet.User.account}</span>
                <span class="timer ellipsis">${tweet.createdAt}</span>
              </a>
              <span class="tweet-description">
              ${tweet.description}
              </span>
              <span class="reply-to">回覆給
                <span class="at-name">@${tweet.User.account}</span>
              </span>
            </div>

          </div>
        </div>

        <div class="post-area">
          <a>
            <img class="thumbnail" src="${loginUser.avatar}" alt="">
          </a>
          <form action="/tweets/${tweet.id}/replies" method="post" id="modalReplyForm" novalidate>
            <input type="hidden" name="userId" value="${loginUser.id}">
            <textarea name="comment" maxlength="140" cols="48" rows="2" placeholder="推你的回覆"
              id="modalReplyFormTextarea" required></textarea>
            <div class="foot">
              <span class="d-none">內容不可空白</span>
              <button type="summit" class="btn-fill">回覆</button>
            </div>
          </form>
        </div>

      </div>
    </div>
    `

    modalReply.classList.remove('d-none')

    // 取得modal表單，驗證資料
    const modalReplyForm = document.querySelector('#modalReplyForm')
    const modalReplyFormTextarea = document.querySelector(
      '#modalReplyFormTextarea'
    )

    validityEmpty(modalReplyForm, modalReplyFormTextarea)
  } else if (target.classList.contains('back-arrow')) {
    // 3.back-arrow返回首頁
    window.location.replace('/tweets')
  } else if (target.classList.contains('confirm-del')) {
    // 4.刪除modal(admin only)
    const tweetId = target.dataset.tweetId

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
  } else if (target.classList.contains('btn-noti')) {
    // 5.小鈴鐺訂閱btn-noti  data-user-id="{{user.id}}"
    const userId = target.dataset.userId
    let results

    if (target.classList.contains('active')) {
      results = await window.axios.delete(
        `${window.location.origin}/api/notify/${userId}`
      )
    } else {
      results = await window.axios.post(
        `${window.location.origin}/api/notify/${userId}`
      )
    }

    if (results.data.status === 'success') {
      target.classList.toggle('active')
    }
  } else if (target.classList.contains('like')) {
    toggleLikeButton(target)
  }
})

// 避免連續重複按下按鈕
allButton.forEach(btn => {
  btn.addEventListener('click', function onAnyButtonClick (event) {
    setTimeout(() => {
      event.target.disabled = true
    }, 0)
    setTimeout(() => {
      event.target.disabled = false
    }, 1800)
  })
})

if (tweetsPostForm) {
  // 首頁推文表單，驗證資料
  validityEmpty(tweetsPostForm, tweetsPostFormTextarea)
}

if (modalPostForm) {
  // 左欄推文modal，驗證資料
  validityEmpty(modalPostForm, modalPostFormTextarea)
}

if (inputs) {
  // 任一Input tag，驗證資料
  inputs.forEach(el => {
    el.addEventListener('focus', function onInputFocus (event) {
      el.parentElement.classList.add('focus')
    })
    el.addEventListener('blur', function onInputBlur (event) {
      el.parentElement.classList.remove('focus')
    })
    el.addEventListener('invalid', onInputInvalid)

    el.addEventListener('keyup', onInputKeyup)
  })
}

if (chatTextarea) {
  // 聊天室，驗證與欄高度調整
  chatTextarea.addEventListener('keyup', function onTextareaKeyup (event) {
    const target = event.target
    const keycode = event.keyCode

    let clientHeight = target.clientHeight

    if (event.keyCode === 13 && !event.shiftKey) {
      // enter 送出表單，shift+enter不送出(換行)
      document.querySelector('#send').click()
      target.style.height = '30px'
      clientHeight = 30
      target.value = ''
    } else if ([8, 46].includes(keycode)) {
      // backspace或del按鍵，重測行高
      target.style.height = '30px'
      clientHeight = 30
    }

    const adjustedHeight = target.scrollHeight

    if (adjustedHeight > clientHeight) {
      // 卷軸高度 大於 現在高度，設定表單高度為卷軸高度
      target.style.height = adjustedHeight + 'px'
    }
  })
}

// -------------以下為復用function-------------
function isEmpty (nodeElement) {
  // 無文字回傳true，文字長度大於0，回傳false
  return !nodeElement.value.replace(/\s/g, '').length
}

function validityEmpty (form, inputArea) {
  // 驗證inputArea是否為空白
  form.addEventListener('submit', function onFormSubmitted (event) {
    if (!form.checkValidity() || isEmpty(inputArea)) {
      // 停止type=submit預設動作
      event.stopPropagation()
      event.preventDefault()
      //  驗證不通過，顯示alert message (移除d-none class)
      form.lastElementChild.firstElementChild.classList = ''
    }
  })

  inputArea.addEventListener('keyup', function onFormKeyup (event) {
    if (!isEmpty(inputArea)) {
      //  使用者開始輸入，隱藏alert message (加上d-none class)
      form.lastElementChild.firstElementChild.classList = 'd-none'
    }
  })
}

function onInputInvalid (event) {
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

function onInputKeyup (event) {
  // 使用者開始輸入，取消invalid樣式
  const target = event.target
  target.parentElement.classList.remove('invalid')

  if (event.target.name === 'account') {
    // 避免非英文數字輸入account
    target.value = target.value.replace(/[\W]/g, '')
  }
}

// 滾動聊天畫面至最下方
function scrollDownToBottom () {
  if (streamMsgDiv.lastElementChild) {
    streamMsgDiv.lastElementChild.scrollIntoView()
  }
}

// string 仿 Array.splice 功能
function stringSplice (str, start, delCount, newSubStr) {
  return str.slice(0, start) + newSubStr + str.slice(start + delCount)
}

// \n換行符號替換<br>
function slashNtoBr (str, delStr = '\n', newStr = '<br>') {
  let result = str

  while (result.indexOf(delStr) !== -1) {
    // 替換單一 delStr
    result = stringSplice(result, result.indexOf(delStr), delStr.length, newStr)
  }

  while (result.indexOf(newStr + newStr) !== -1) {
    // 替換 連續 newStr
    result = stringSplice(
      result,
      result.indexOf(newStr + newStr),
      newStr.length * 2,
      newStr
    )
  }

  if (result.indexOf(newStr) === 0) {
    result = result.slice(newStr.length)
  }

  return result
}

async function toggleLikeButton (target) {
  const { tweetId } = target.dataset
  let response
  let likeCount = Number(target.nextElementSibling.innerHTML)

  if (target.classList.contains('active')) {
    response = await window.axios.delete(
      `${window.location.origin}/api/tweets/${tweetId}/likes`,
      { tweetId }
    )
    likeCount -= 1
  } else {
    response = await window.axios.post(
      `${window.location.origin}/api/tweets/${tweetId}/likes`,
      { tweetId }
    )
    likeCount += 1
  }

  if (response.data.status !== 'success') {
    return null
  }

  target.nextElementSibling.innerHTML = likeCount
  target.classList.toggle('active')
}
