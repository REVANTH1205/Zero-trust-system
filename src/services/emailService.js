
import emailjs from '@emailjs/browser';



export function sendOTPEmail(toEmail, otp) {
  const templateParams = {
    to_email: toEmail,
    otp_code: otp,
  };

  return emailjs.send(
   'service_f5lick567',
    'template_c0w75ea',
    templateParams,
    'RW-hXbOHEK7gIkLJK'


 );
}
