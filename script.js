const form = document.getElementById('itemForm');
const lostDiv = document.getElementById('lostItems');
const foundDiv = document.getElementById('foundItems');
const loginForm = document.getElementById('loginForm');
const menu = document.getElementById('menu');
const welcomeMsg = document.getElementById('welcomeMsg');

let currentUser = localStorage.getItem("currentUser") || null;
let items = JSON.parse(localStorage.getItem("items")) || [];

// Login
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const studentNumber = document.getElementById('studentNumber').value.trim();
  if (!studentNumber) return;

  currentUser = studentNumber;
  localStorage.setItem("currentUser", currentUser);

  document.getElementById('loginSection').style.display = 'none';
  menu.style.display = 'block';
  welcomeMsg.textContent = `Logged in as Student #${currentUser}`;
  showTab('report');
});

// Logout
function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;

  menu.style.display = 'none';
  document.getElementById('report').style.display = 'none';
  document.getElementById('lost').style.display = 'none';
  document.getElementById('found').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  welcomeMsg.textContent = "";
}

// Founder name toggle
function toggleFounderName() {
  const type = document.getElementById('type').value;
  document.getElementById('founderNameField').style.display = (type === 'found') ? 'block' : 'none';
}

// Timestamp in Namibia (CAT, UTC+2)
function getCATTimestamp() {
  return new Date().toLocaleString('en-GB', {
    timeZone: 'Africa/Windhoek',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Submit item
form.addEventListener('submit', async e => {
  e.preventDefault();

  const dateInput = document.getElementById('date').value;
  if (!dateInput) {
    alert("Please select a date for the item.");
    return;
  }

  const file = document.getElementById('image')?.files[0];
  let imageData = "";
  if (file) {
    imageData = await toBase64(file); // store Base64 string
  }

  const itemType = document.getElementById('type').value;

  const item = {
    id: Date.now().toString(),
    type: itemType,
    name: document.getElementById('name').value.trim(),
    description: document.getElementById('description').value.trim(),
    date: dateInput,
    place: document.getElementById('place').value.trim(),
    contact: document.getElementById('contact').value.trim(),
    founderName: document.getElementById('founderName').value.trim() || "",
    timestamp: getCATTimestamp(),
    owner: currentUser,
    image: imageData
  };

  items.push(item);
  localStorage.setItem("items", JSON.stringify(items));

  // ✅ Show success message
  alert("Successfully uploaded!");

  // ✅ Clear form
  form.reset();
  toggleFounderName();

  // ✅ Redirect to Lost or Found tab immediately
  if (itemType === "lost") {
    showTab("lost");
  } else {
    showTab("found");
  }
});

// Tabs
function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';

  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`btn-${tabId}`);
  if (btn) btn.classList.add('active');

  if (tabId !== 'report') displayItems();
}

// Display items
function displayItems() {
  lostDiv.innerHTML = '';
  foundDiv.innerHTML = '';

  items.forEach((i) => {
    const card = document.createElement('div');
    card.className = 'card';

    const imageBlock = i.image
      ? `<img src="${i.image}" alt="${i.name}" style="max-width:100%;border-radius:6px;">`
      : `<div class="placeholder">No image</div>`;

    const deleteButton = (i.owner === currentUser)
      ? `<button class="delete-btn" onclick="deleteItem('${i.id}')">Delete</button>`
      : "";

    card.innerHTML = `
      ${imageBlock}
      <h3>${i.name || "Unnamed item"}</h3>
      <p><strong>Description:</strong> ${i.description || "-"}</p>
      <p><strong>Date:</strong> ${i.date || "-"}</p>
      <p><strong>Place:</strong> ${i.place || "-"}</p>
      <p><strong>Contact:</strong> ${i.contact || "-"}</p>
      ${i.founderName ? `<p><strong>Founder:</strong> ${i.founderName}</p>` : ""}
      <em>Posted: ${i.timestamp || "-"}</em>
      ${deleteButton}
    `;

    if (i.type === 'lost') lostDiv.appendChild(card);
    else foundDiv.appendChild(card);
  });
}

// Delete item
function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  localStorage.setItem("items", JSON.stringify(items));
  displayItems();
}

// Auto-login resume
if (currentUser) {
  document.getElementById('loginSection').style.display = 'none';
  menu.style.display = 'block';
  welcomeMsg.textContent = `Logged in as Student #${currentUser}`;
  showTab('report');
}

// ✅ Always reload items on startup
displayItems();