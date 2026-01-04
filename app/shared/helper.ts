export function scrollToTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function scrollToBottom() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}
