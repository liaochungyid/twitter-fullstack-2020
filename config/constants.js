module.exports = {
  maxTweetLength: 140,
  maxNameLength: 50,
  maxAccountLength: 30,
  minAccountLength: 4,
  minPasswordLength: 4,
  tweetsPerPage: 25,
  popularPerPage: 5,
  maxIntroductionLength: 160,
  privateData: [
    'email',
    'password',
    'role',
    'activeTime',
    'createdAt',
    'updatedAt'
  ],
  allTime: '2000-01-01 00:00:00',
  notiMinSize: 10 // 通知功能最少顯示項目數量
}
