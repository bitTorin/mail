document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Print emails
    console.log(emails);

    // Create mailbox header
    let EmailHeader = document.createElement('div');
    EmailHeader.id = 'mailbox-header'
    EmailHeader.classList = 'row'
    if (`${mailbox}` === 'inbox') {
      EmailHeader.innerHTML =
      `<h5 class="col-3">From</h5>
      <h5 class="col-6">Subject</h5>
      <h5 class="col-3">Date/Time</h5>`
      document.querySelector('#emails-view').appendChild(EmailHeader);
    } else if (`${mailbox}` === 'sent') {
      EmailHeader.innerHTML =
      `<h5 class="col-3">To</h5>
      <h5 class="col-6">Subject</h5>
      <h5 class="col-3">Date/Time</h5>`
      document.querySelector('#emails-view').appendChild(EmailHeader);
    }

    // Display emails
    emails.forEach(email => {
      const sender = email.sender;
      const subject = email.subject;
      const timestamp = email.timestamp;
      const recipients = email.recipients;
      let EmailListItem = document.createElement('div');
      EmailListItem.id = email.id;
      EmailListItem.classList = 'email-list-item row overflow';
      if (`${mailbox}` === 'inbox') {
        EmailListItem.innerHTML = 
        `<h5 class="col-3">${sender}</h5>
        <h5 class="col-6">${subject.charAt(0).toUpperCase() + subject.slice(1)}</h5>
        <p class="col-3">${timestamp}</p>`
        document.querySelector('#emails-view').appendChild(EmailListItem);
      } else if (`${mailbox}` === 'sent') {
        EmailListItem.innerHTML = 
        `<h5 class="col-3">${recipients}</h5>
        <h5 class="col-6">${subject.charAt(0).toUpperCase() + subject.slice(1)}</h5>
        <p class="col-3">${timestamp}</p>`
        document.querySelector('#emails-view').appendChild(EmailListItem);
      }
    });
  })

  .catch(error => {
    console.log('Error:', error);
  });
  return false;
}

function view_email() {

  // Show single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';


}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients);

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  
  .then(result => {
    // Print result
    console.log(result);
  })

  // Load sent page
  .then(load_mailbox('sent'))
  
  .catch(error => {
    console.log('Error:', error);
  });

  return false;
};