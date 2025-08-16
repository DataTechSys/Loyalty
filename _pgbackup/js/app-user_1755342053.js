document.addEventListener("DOMContentLoaded", function () {
  const userChipWrap = document.querySelector(".userchip-wrap");

  // Example: this user object should come from your backend/session
  const user = {
    name: "Ali Ahmed",
    email: "ali@example.com",
    photo: "" // leave blank to test dummy fallback
  };

  // Dummy photo fallback
  const avatarSrc = user.photo && user.photo.trim() !== "" 
    ? user.photo 
    : "assets/images/default-avatar.png"; // put a default photo in this path

  // Build dropdown
  userChipWrap.innerHTML = `
    <div class="dropdown">
      <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle" 
         id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
        <img src="${avatarSrc}" alt="avatar" class="rounded-circle me-2" width="32" height="32">
        <span class="d-none d-sm-inline fw-semibold">${user.name}</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
        <li><a class="dropdown-item" href="profile.html">Profile</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#">Logout</a></li>
      </ul>
    </div>
  `;
});