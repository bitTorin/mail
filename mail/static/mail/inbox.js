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
      `<h5 class="col-2">From</h5>
      <h5 class="col-5">Subject</h5>
      <h5 class="col-3">Date/Time</h5>
      <h5 class="col-1"></h5>`
      document.querySelector('#emails-view').appendChild(EmailHeader);
    } else if (`${mailbox}` === 'sent') {
      EmailHeader.innerHTML =
      `<h5 class="col-3">To</h5>
      <h5 class="col-6">Subject</h5>
      <h5 class="col-3">Date/Time</h5>`
      document.querySelector('#emails-view').appendChild(EmailHeader);
    } else if (`${mailbox}` === 'archive') {
      EmailHeader.innerHTML =
      `<h5 class="col-2">From</h5>
      <h5 class="col-5">Subject</h5>
      <h5 class="col-3">Date/Time</h5>
      <h5 class="col-1"></h5>`
      document.querySelector('#emails-view').appendChild(EmailHeader);
    }

    // Display emails
    emails.forEach(email => {
      const sender = email.sender;
      const subject = email.subject;
      const timestamp = email.timestamp;
      const recipients = email.recipients;
      const read = email.read;
      const archived = email.archived;

      let EmailListItem = document.createElement('div');
      EmailListItem.id = email.id;
      if (read == true) {
        EmailListItem.classList = 'email-list-item row background-white';
      }
      else {
        EmailListItem.classList = 'email-list-item row background-grey';
      }

      // let btn = document.createElement('button')
      // if (archived == true) {
      //   btn.textContent = 'Unarchive'
      // } else if (archived == false) {
      //   btn.textContent = 'Archive'
      // }

      if (`${mailbox}` === 'inbox') {
        EmailListItem.innerHTML = 
        `<p class="col-2">${sender}</p>
        <p class="col-5">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
        <p class="col-3">${timestamp}</p>
        <btn id="btn" type="button" class="btn btn-outline-secondary btn-sm col-1" style="margin: 12px;">Archive</btn>`
        document.querySelector('#emails-view').appendChild(EmailListItem);

        // if (archived == false) {
        //   EmailListItem.innerHTML = 
        //   `<p class="col-2">${sender}</p>
        //   <p class="col-5">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
        //   <p class="col-3">${timestamp}</p>
        //   <btn id="archive" type="button" class="btn btn-outline-secondary btn-sm col-1" style="margin: 12px;">Archive</btn>`
        //   document.querySelector('#emails-view').appendChild(EmailListItem);
        // }
        // else if (archived == true) {
        //   EmailListItem.innerHTML = 
        //   `<p class="col-2">${sender}</p>
        //   <p class="col-5">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
        //   <p class="col-3">${timestamp}</p>
        //   <btn id="archive" type="button" class="btn btn-secondary btn-sm col-1" style="margin: 12px;">Unarchive</btn>`
        //   document.querySelector('#emails-view').appendChild(EmailListItem);
        // }
      } else if (`${mailbox}` === 'sent') {
        EmailListItem.innerHTML = 
        `<p class="col-3 overflow">${recipients}</p>
        <p class="col-6">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
        <p class="col-3">${timestamp}</p>`
        document.querySelector('#emails-view').appendChild(EmailListItem);
      } else if (`${mailbox}` === 'archive') {
        EmailListItem.innerHTML = 
          `<p class="col-2">${sender}</p>
          <p class="col-5">${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
          <p class="col-3">${timestamp}</p>
          <btn id="btn" type="button" class="btn btn-secondary btn-sm col-1" style="margin: 12px;">Unarchive</btn>`
          document.querySelector('#emails-view').appendChild(EmailListItem);
      }
      EmailListItem.addEventListener('click', () => read_email(`${EmailListItem.id}`));
      document.querySelector('#btn').addEventListener('click', () => archive(`${EmailListItem.id}, ${archived}`));
    });
  })

  .catch(error => {
    console.log('Error:', error);
  });
  return false;
}

function archive(email_id, status) {
  
  if (status == false) {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
        })
      })
  }

  else if (status == true) {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
        })
    })
  } 

  // View Email
  load_mailbox('inbox')

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

    // Display Email
    let SingleEmail = document.createElement('div');
    SingleEmail.id = email.id;
    SingleEmail.innerHTML = 
        `<h3>${subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
        <br>
        <p>From: ${sender}<p>
        <p>To: ${recipients}</p>
        <p>${timestamp}</p>
        <br>
        <p>${body}</p>`
    document.querySelector('#single-email-view').appendChild(SingleEmail);
    
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