const popular = document.querySelector('.popular')
const more = document.querySelector('.more')

let PopsOffset = 0

// 一進入頁面及索取資料 (offset = 0)
const span = document.createElement('span')
span.innerText = 'Popular'
popular.append(span)
getPops(PopsOffset, popular)

// 按下more，取的資料append底部
more.addEventListener('click', async (event) => {
  PopsOffset += 1
  await getPops(PopsOffset, popular)
})

async function getPops (offset, node) {
  try {
    const response = await window.axios.get(
      `${window.location.origin}/api/pops/${offset}`
    )
    return renderPops(response.data, node)
  } catch (err) {
    console.error(err)
  }
}

function renderPops (pops, node) {
  if (pops.length) {
    pops.forEach((element) => {
      const div = document.createElement('div')
      div.classList.add('wrap')

      div.innerHTML = `
        <a href="/users/${element.id}/tweets"><img class="thumbnail" src="${element.avatar}"
            alt="${element.name} avatar">
          <span>
            <span class="name">${element.name}</span>
            <span class="at-name ellipsis">@${element.account}</span>
          </span>
        </a>
        <button type="button" class="${element.isFollowing ? 'btn-fill' : 'btn-outline'} sm btn-followship" data-user-id="${element.id}" >${element.isFollowing ? '正在跟隨' : '跟隨'}</button>
      `

      node.append(div)
    })
  }

  if (pops.length < 5) {
    more.innerText = '沒有更多使用者'
    more.attributes.disabled = 'disabled'
  }
}
