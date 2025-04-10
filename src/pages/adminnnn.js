import "../styles/admin.css";

function admin() {
  // Toggle the visibility of a dropdown menu
  const toggleDropdown = (dropdown, menu, isOpen) => {
    dropdown.classList.toggle("open", isOpen);
    menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
  };
  // Close all open dropdowns
  //   const closeAllDropdowns = () => {
  //     document
  //       .querySelectorAll(".dropdown-container.open")
  //       .forEach((openDropdown) => {
  //         toggleDropdown(
  //           openDropdown,
  //           openDropdown.querySelector(".dropdown-menu"),
  //           false
  //         );
  //       });
  //   };
  // Attach click event to all dropdown toggles
  //   document.querySelectorAll(".dropdown-toggle").forEach((dropdownToggle) => {
  //     dropdownToggle.addEventListener("click", (e) => {
  //       e.preventDefault();
  //       const dropdown = dropdownToggle.closest(".dropdown-container");
  //       const menu = dropdown.querySelector(".dropdown-menu");
  //       const isOpen = dropdown.classList.contains("open");
  //       closeAllDropdowns(); // Close all open dropdowns
  //       toggleDropdown(dropdown, menu, !isOpen); // Toggle current dropdown visibility
  //     });
  //   });
  // Attach click event to sidebar toggle buttons
  //   document
  //     .querySelectorAll(".sidebar-toggler, .sidebar-menu-button")
  //     .forEach((button) => {
  //       button.addEventListener("click", () => {
  //         closeAllDropdowns(); // Close all open dropdowns
  //         document.querySelector(".sidebar").classList.toggle("collapsed"); // Toggle collapsed className on sidebar
  //       });
  //     });
  // Collapse sidebar by default on small screens
  //   if (window.innerWidth <= 1024)
  //     document.querySelector(".sidebar").classList.add("collapsed");

  return (
    <>
      {/* <!-- Mobile Sidebar Menu Button --> */}
      <button className="sidebar-menu-button">
        <span className="material-symbols-rounded">menu</span>
      </button>
      <aside className="sidebar">
        {/* <!-- Sidebar Header --> */}
        <header className="sidebar-header">
          <a href="#" className="header-logo">
            <img src="logo.png" alt="CodingNepal" />
          </a>
          <button className="sidebar-toggler">
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
        </header>
        <nav className="sidebar-nav">
          {/* <!-- Primary Top Nav --> */}
          <ul className="nav-list primary-nav">
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">dashboard</span>
                <span className="nav-label">Dashboard</span>
              </a>
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Dashboard</a>
                </li>
              </ul>
            </li>
            {/* <!-- Dropdown --> */}
            <li className="nav-item dropdown-container">
              <a href="#" className="nav-link dropdown-toggle">
                <span className="material-symbols-rounded">calendar_today</span>
                <span className="nav-label">Services</span>
                <span className="dropdown-icon material-symbols-rounded">
                  keyboard_arrow_down
                </span>
              </a>
              {/* <!-- Dropdown Menu --> */}
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Services</a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link dropdown-link">
                    IT Consulting
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link dropdown-link">
                    Cloud Solutions
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link dropdown-link">
                    Mobile Apps
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">notifications</span>
                <span className="nav-label">Notifications</span>
              </a>
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Notifications</a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">local_library</span>
                <span className="nav-label">Resources</span>
              </a>
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Resources</a>
                </li>
              </ul>
            </li>
            {/* <!-- Dropdown --> */}
            <li className="nav-item dropdown-container">
              <a href="#" className="nav-link dropdown-toggle">
                <span className="material-symbols-rounded">star</span>
                <span className="nav-label">Bookmarks</span>
                <span className="dropdown-icon material-symbols-rounded">
                  keyboard_arrow_down
                </span>
              </a>
              {/* <!-- Dropdown Menu --> */}
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Bookmarks</a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link dropdown-link">
                    Saved Tutorials
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link dropdown-link">
                    Favorite Blogs
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link dropdown-link">
                    Resource Guides
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">extension</span>
                <span className="nav-label">Extensions</span>
              </a>
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Extensions</a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">settings</span>
                <span className="nav-label">Settings</span>
              </a>
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Settings</a>
                </li>
              </ul>
            </li>
          </ul>
          {/* <!-- Secondary Bottom Nav --> */}
          <ul className="nav-list secondary-nav">
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">help</span>
                <span className="nav-label">Support</span>
              </a>
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Support</a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">logout</span>
                <span className="nav-label">Sign Out</span>
              </a>
              <ul className="dropdown-menu">
                <li className="nav-item">
                  <a className="nav-link dropdown-title">Sign Out</a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default admin;
