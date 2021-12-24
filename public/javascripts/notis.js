const notis = document.querySelector('#notis')

const userId = document.querySelector('input[name="userId"]').value

// 取得歷史通知
getNotis(userId, notis)

function getNotis(userId, node) {
  new Promise((resolve,reject) => {
    axios.get(`${location.origin}/api/news/${userId}`)
      .then(response => {
        if (response.status !== 200) {
          reject(new Error('unable to get notifications'))
        }
        resolve(renderNotis(response.data, node))
      })
  })
}

function renderNotis(notis, node) {
  // 無資料時
  if (!notis.length) { return null }

  let html = ``
  
  notis.forEach(element => {    
    if (element.type === '未讀的追蹤者推文') {
      html += `
      <a href="/tweets/${element.TweetId}" class="noti">
        <div class="noti-title">
          <img class="thumbnail" src="${element.User.avatar}" alt="${element.User.name} avatar">

            <div class="noti-msg">
              ${element.User.name} 有新的推文通知
            </div>
        </div>

        <div class="content">
          ${element.Tweet.description}
        </div>
      </a>
      `
    } else if (element.type === '未讀的被讚事件') {
      html += `
      <a href="/tweets/${element.TweetId}" class="noti">
        <div class="noti-title">
          <img class="thumbnail" src="${element.User.avatar}" alt="${element.User.name} avatar">

          <div class="noti-msg">
            ${element.User.name} 喜歡妳的貼文
          </div>
        </div>
      </a>
      `
    }
  })

  node.innerHTML = html
}
