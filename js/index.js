const radios = document.querySelectorAll('input[name=content]');
radios.forEach(item => {
  item.onclick = () => {
    const iframe = document.getElementById('content');
    console.log(item.id)
    const newSrc = `./table-of-contents/${item.id}.html`;
    iframe.src = newSrc;
  }
});
