clearInterval(autoHack)

let autoHack = setInterval(() => {
  if (
    document.querySelector('#terminal-input-text-box') &&
    document.querySelector('#terminal-input-header') &&
    !document.querySelector('#terminal-input-header').textContent.includes('home')
  ) {
    document.querySelector('#terminal-input-text-box').value = 'hack'
    const ke = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode: 13,
    })
    document.body.dispatchEvent(ke)
  }
}, 100)
