// ---------- Navigation ----------
const page = document.body.dataset.page;
document.querySelectorAll('nav a').forEach(function (link) {
  if (link.dataset.p === page) link.classList.add('active');
});
const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
menuBtn.addEventListener('click', function () {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});

// ---------- Academic planner ----------
const taskForm = document.getElementById('task-form');
if (taskForm) {
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const errorBox = document.getElementById('task-error');
  const countBox = document.getElementById('task-count');
  const emptyBox = document.getElementById('task-empty');
  let tasks = [];
  try { tasks = JSON.parse(localStorage.getItem('tasks')) || []; } catch (e) { tasks = []; }

  function save() {
    try { localStorage.setItem('tasks', JSON.stringify(tasks)); } catch (e) {}
  }

  function render() {
    list.innerHTML = '';
    tasks.forEach(function (task, index) {
      const li = document.createElement('li');
      if (task.done) li.classList.add('done');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = task.done;
      box.style.width = 'auto';
      box.setAttribute('aria-label', 'Mark "' + task.text + '" as completed');
      box.addEventListener('change', function () { toggleTask(index); });
      const label = document.createElement('span');
      label.textContent = task.text;
      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = 'Delete';
      del.addEventListener('click', function () { deleteTask(index); });
      li.append(box, label, del);
      list.appendChild(li);
    });
    const done = tasks.filter(function (t) { return t.done; }).length;
    countBox.textContent = tasks.length ? done + ' of ' + tasks.length + ' tasks completed' : '';
    emptyBox.style.display = tasks.length ? 'none' : 'block';
  }

  function addTask(text) { tasks.push({ text: text, done: false }); save(); render(); }
  function toggleTask(i) { tasks[i].done = !tasks[i].done; save(); render(); }
  function deleteTask(i) { tasks.splice(i, 1); save(); render(); }

  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (text === '') { errorBox.textContent = 'Enter a task before adding it.'; return; }
    errorBox.textContent = '';
    addTask(text);
    input.value = '';
    input.focus();
  });
  render();
}

// ---------- Contact form validation ----------
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const digitsOnly = /^[0-9]+$/;

  function setError(id, msg) {
    document.getElementById(id + '-error').textContent = msg;
    document.getElementById(id).classList.toggle('invalid', msg !== '');
    return msg === '';
  }

  function validate() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();
    let ok = true;
    ok = setError('name', name === '' ? 'Enter your name.' : '') && ok;
    ok = setError('email', email === '' ? 'Enter your email address.'
      : !emailPattern.test(email) ? 'Enter a valid email, like name@example.com.' : '') && ok;
    ok = setError('phone', phone === '' ? 'Enter your phone number.'
      : !digitsOnly.test(phone) ? 'Use digits only, with no spaces or symbols.' : '') && ok;
    ok = setError('message', message === '' ? 'Enter a message.' : '') && ok;
    return ok;
  }

  
contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const success = document.getElementById('form-success');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    success.textContent = '';

    // Validate the form before sending
    if (!validate()) {
        return;
    }

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            success.textContent =
                'Message sent successfully. Thank you for getting in touch.';

            contactForm.reset();
        } else if (result.errors) {
            success.textContent = result.errors
                .map(error => error.message)
                .join(' ');
        } else {
            success.textContent =
                'Your message could not be sent. Please try again.';
        }

    } catch (error) {
        success.textContent =
            'Network error. Please check your connection and try again.';

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});
}

/* DESIGN GALLERY LIGHTBOX */

(() => {
    const images = document.querySelectorAll(
        ".design-gallery .gallery-item > img"
    );

    if (!images.length || typeof HTMLDialogElement === "undefined") {
        return;
    }

    const dialog = document.createElement("dialog");
    dialog.className = "image-lightbox";
    dialog.setAttribute("aria-label", "Enlarged design preview");

    const enlargedImage = document.createElement("img");

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "image-lightbox-close";
    closeButton.textContent = "Close preview";

    dialog.append(closeButton, enlargedImage);
    document.body.appendChild(dialog);

    function openPreview(image) {
        enlargedImage.src = image.currentSrc || image.src;
        enlargedImage.alt = image.alt;

        dialog.showModal();
        closeButton.focus();
    }

    images.forEach(image => {
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute(
            "aria-label",
            `Enlarge ${image.alt || "design"}`
        );

        image.addEventListener("click", () => {
            openPreview(image);
        });

        image.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPreview(image);
            }
        });
    });

    closeButton.addEventListener("click", () => {
        dialog.close();
    });

    dialog.addEventListener("click", event => {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    dialog.addEventListener("close", () => {
        enlargedImage.removeAttribute("src");
    });
})();
