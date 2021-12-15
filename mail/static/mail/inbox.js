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
    } else if (`${mailbox}` === 'archive') {
      EmailHeader.innerHTML =
      `<h5 class="col-3">From</h5>
      <h5 class="col-6">Subject</h5>
      <h5 class="col-3">Date/Time</h5>`
      document.querySelector('#emails-view').appendChild(EmailHeader);
    }

    // Display emails
    emails.forEach(email => {
      
      // Assign variables
      const sender = email.sender;
      const subject = email.subject;
      const timestamp = email.timestamp;
      const recipients = email.recipients;
      const read = email.read;
      const archived = email.archived;

      // Create new div
      let EmailListItem = document.createElement('div');
      EmailListItem.id = email.id;
      if (read == true) {
        EmailListItem.classList = 'email-list-item row background-white';
      }
      else {
        EmailListItem.classList = 'email-list-item row background-grey';
      }

      // Load inbox
      if (`${mailbox}` === 'inbox') {
        EmailListItem.innerHTML = 
        `<p class="col-3">${sender}</p>
        <p class="col-6">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
        <p class="col-3">${timestamp}</p>`
        document.querySelector('#emails-view').appendChild(EmailListItem);

      // Load sent
      } else if (`${mailbox}` === 'sent') {
        EmailListItem.innerHTML = 
        `<p class="col-3 overflow">${recipients}</p>
        <p class="col-6">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
        <p class="col-3">${timestamp}</p>`
        document.querySelector('#emails-view').appendChild(EmailListItem);

      // Load archive
      } else if (`${mailbox}` === 'archive') {
        EmailListItem.innerHTML = 
          `<p class="col-3">${sender}</p>
          <p class="col-6">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
          <p class="col-3">${timestamp}</p>`
          document.querySelector('#emails-view').appendChild(EmailListItem);
      }

      // Open email when clicked
      EmailListItem.addEventListener('click', () => read_email(`${EmailListItem.id}`));
    });
  })

  // Catch errors
  .catch(error => {
    console.log('Error:', error);
  });
  return false;
}

function archive(email_id) {
  
  fetch(`/emails/${email_id}`)

  .then(response => response.json())
  .then(email => {

    // Assign variables
    const archived = email.archived;
    
    // Change archive status
    if (archived == false) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
          })
        })
        .then(
          // View Inbox
          load_mailbox('inbox')
        )
    } else if (archived == true) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
          })
      })
      .then(
        // View Inbox
        load_mailbox('inbox')
      )
    }
  })

  // Catch errors
  .catch(error => {
    console.log('Error:', error);
  });
  return false;

  
}

function read_email(email_id) {
  fetch(`/emails/${email_id}`)

  .then(response => response.json())
  .then(email => {

    // Assign variables
    const read = email.read;

    // If email was unread, send read udpdate to API
    if (read == false) {
      fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
        })
      })
    }
      
    // View Email
    view_email(`${email_id}`)
    
  })

  .catch(error => {
    console.log('Error:', error);
  });

  return false;
}

function reply(email_id) {
  
  fetch(`/emails/${email_id}`)

  .then(response => response.json())
  .then(email => {

    // Assign variables
    const sender = email.sender;
    const subject = email.subject;
    const timestamp = email.timestamp;
    const body = email.body;
    
    const re_body = 'On ' + timestamp + ' ' + sender + ' wrote: \n';
    
    // Load compose email page
    compose_email();

    // Replace field values
    document.querySelector('#compose-recipients').value = sender;
    document.querySelector('#compose-subject').value = subject.slice(0,4) === "Re: " ? subject : "Re: " + subject;
    document.querySelector('#compose-body').value = re_body + body;
  
  })

  .catch(error => {
    console.log('Error:', error);
  });
  return false;
}

function view_email(email_id) {

  // Show single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';

  // Clear any previous queries
  document.querySelector('#single-email-view').innerHTML='';

  // Load email
  fetch(`/emails/${email_id}`)

  .then(response => response.json())
  .then(email => {

    // Assign variables
    const id = email.id
    const sender = email.sender;
    const subject = email.subject;
    const timestamp = email.timestamp;
    const recipients = email.recipients;
    const body = email.body;
    const archived = email.archived;

    if (archived == true) {
      // Display Email
      let SingleEmail = document.createElement('div');
      SingleEmail.id = email.id;
      SingleEmail.innerHTML = 
          `<btn id="reply" type="button" class="btn btn-primary btn-sm col-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reply-fill" viewBox="0 0 16 16">
              <path d="M5.921 11.9 1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z"/>
            </svg>
            Reply
          </btn>
          <btn id="archive" type="button" class="btn btn-secondary btn-sm col-1" style="margin: 12px;">Unarchive</btn>
          <br>
          <h3>${subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
          <br>
          <p>From: ${sender}<p>
          <p>To: ${recipients}</p>
          <p>${timestamp}</p>
          <br>
          <p>${body}</p>`
      document.querySelector('#single-email-view').appendChild(SingleEmail);
      
    } else if (archived == false) {
      // Display Email
      let SingleEmail = document.createElement('div');
      SingleEmail.id = email.id;
      SingleEmail.innerHTML = 
          `<btn id="reply" type="button" class="btn btn-primary btn-sm col-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reply-fill" viewBox="0 0 16 16">
              <path d="M5.921 11.9 1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z"/>
            </svg>
            Reply
          </btn>
          <btn id="archive" type="button" class="btn btn-outline-secondary btn-sm col-1" style="margin: 12px;">Archive</btn>
          <br>
          <h3>${subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
          <br>
          <p>From: ${sender}<p>
          <p>To: ${recipients}</p>
          <p>${timestamp}</p>
          <br>
          <p>${body}</p>`
      document.querySelector('#single-email-view').appendChild(SingleEmail);
    }
    document.querySelector('#archive').addEventListener('click', () => archive(`${email.id}`));
    document.querySelector('#reply').addEventListener('click', () => reply(`${email.id}`));
    
  })

  .catch(error => {
    console.log('Error:', error);
  });
  return false;
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