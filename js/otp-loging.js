
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

const receivedOtp =document.getElementById("received_otp");
receivedOtp.innerHTML = params.otp + params.pass;