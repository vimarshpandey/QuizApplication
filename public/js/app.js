const urlParams = new URLSearchParams(window.location.search);
const isDuplicate = urlParams.get('duplicate');

if (isDuplicate && isDuplicate === 'true') {
    alert('You have already taken the quiz!');
    window.location.href = '/';
}