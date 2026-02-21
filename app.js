// ========================================
// తొలిపరిచయం(The Story Book) — Application Logic
// Written by Dasari Srikanth
// ========================================

(function () {
    "use strict";

    // --- Storage Keys ---
    const STORAGE_KEYS = {
        STORIES: "oye-stories-data",
        THEME: "oye-stories-theme",
        LIKES: "oye-stories-likes",
        BOOKMARKS: "oye-stories-bookmarks",
        AUTH: "oye-stories-auth",
        LOGO_IMG: "oye-stories-logo-img",
        WRITER_IMG: "oye-stories-writer-img",
        WRITER_NAME: "oye-stories-writer-name",
        WRITER_DESC: "oye-stories-writer-desc",
        ABOUT_WRITER: "oye-stories-about-writer",
    };

    const ADMIN_PASSWORD = "oye@admin2024";

    // --- Load Stories from localStorage or defaults ---
    function loadStories() {
        const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge any new default stories that don't exist in saved data
                const savedIds = new Set(parsed.map(s => s.id));
                const newDefaults = DEFAULT_STORIES.filter(s => !savedIds.has(s.id));
                if (newDefaults.length > 0) {
                    const merged = [...parsed, ...newDefaults];
                    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(merged));
                    return merged;
                }
                return parsed;
            } catch (e) {
                return [...DEFAULT_STORIES];
            }
        }
        return [...DEFAULT_STORIES];
    }

    function saveStories() {
        localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(STORIES));
    }

    let STORIES = loadStories();

    // --- DOM Elements ---
    const views = {
        library: document.getElementById("library"),
        reader: document.getElementById("reader"),
        adminLogin: document.getElementById("adminLogin"),
        adminDashboard: document.getElementById("adminDashboard"),
        storyForm: document.getElementById("storyForm"),
        aboutAuthor: document.getElementById("aboutAuthor"),
        contact: document.getElementById("contact"),
    };

    const el = {
        storiesGrid: document.getElementById("storiesGrid"),
        searchInput: document.getElementById("searchInput"),
        categoryPills: document.getElementById("categoryPills"),
        themeToggle: document.getElementById("themeToggle"),
        themeIcon: document.querySelector(".theme-icon"),
        adminLink: document.getElementById("adminLink"),
        logoHome: document.getElementById("logoHome"),

        // Reader
        backBtn: document.getElementById("backBtn"),
        readerTitle: document.getElementById("readerTitle"),
        storyCoverTitle: document.getElementById("storyCoverTitle"),
        storyCoverAuthor: document.getElementById("storyCoverAuthor"),
        storyCoverCategory: document.getElementById("storyCoverCategory"),
        storyContent: document.getElementById("storyContent"),
        progressBar: document.getElementById("progressBar"),
        pageIndicator: document.getElementById("pageIndicator"),
        prevPageBtn: document.getElementById("prevPage"),
        nextPageBtn: document.getElementById("nextPage"),
        fontUpBtn: document.getElementById("fontUp"),
        fontDownBtn: document.getElementById("fontDown"),
        likeBtn: document.getElementById("likeBtn"),
        bookmarkBtn: document.getElementById("bookmarkBtn"),
        likeIcon: document.querySelector(".like-icon"),
        bookmarkIcon: document.querySelector(".bookmark-icon"),
        particlesContainer: document.getElementById("particles"),

        // Admin Login
        loginForm: document.getElementById("loginForm"),
        adminPassword: document.getElementById("adminPassword"),
        loginError: document.getElementById("loginError"),
        adminBackBtn: document.getElementById("adminBackBtn"),

        // Admin Dashboard
        dashBackBtn: document.getElementById("dashBackBtn"),
        addStoryBtn: document.getElementById("addStoryBtn"),
        logoutBtn: document.getElementById("logoutBtn"),
        dashboardStats: document.getElementById("dashboardStats"),
        storiesTableBody: document.getElementById("storiesTableBody"),

        // Story Form
        formBackBtn: document.getElementById("formBackBtn"),
        formTitle: document.getElementById("formTitle"),
        storyFormEl: document.getElementById("storyFormEl"),
        storyId: document.getElementById("storyId"),
        storyTitleInput: document.getElementById("storyTitleInput"),
        storyCategoryInput: document.getElementById("storyCategoryInput"),
        storyAuthorInput: document.getElementById("storyAuthorInput"),
        storyReadTime: document.getElementById("storyReadTime"),
        storyEmoji: document.getElementById("storyEmoji"),
        storyGradient: document.getElementById("storyGradient"),
        storyExcerpt: document.getElementById("storyExcerpt"),
        storyContentInput: document.getElementById("storyContentInput"),
        cancelFormBtn: document.getElementById("cancelFormBtn"),

        // Toast
        toastContainer: document.getElementById("toastContainer"),

        // Settings - Profile Pictures
        logoUpload: document.getElementById("logoUpload"),
        writerUpload: document.getElementById("writerUpload"),
        resetLogo: document.getElementById("resetLogo"),
        resetWriter: document.getElementById("resetWriter"),
        logoPreview: document.getElementById("logoPreview"),
        writerPreview: document.getElementById("writerPreview"),
        saveWriterInfo: document.getElementById("saveWriterInfo"),
        writerNameSetting: document.getElementById("writerNameSetting"),
        writerDescSetting: document.getElementById("writerDescSetting"),

        // Settings - About Writer
        aboutWriterSetting: document.getElementById("aboutWriterSetting"),
        saveAboutWriter: document.getElementById("saveAboutWriter"),
        aboutWriterContent: document.getElementById("aboutWriterContent"),

        // Homepage elements
        homeLogo: document.querySelector("#logoHome .logo-img"),
        homeWriterAvatar: document.querySelector(".writer-avatar"),
        homeWriterName: document.querySelector(".writer-name"),
        homeWriterDesc: document.querySelector(".writer-desc"),

        // Navigation
        navHamburger: document.getElementById("navHamburger"),
        navMenu: document.getElementById("navMenu"),
        navOverlay: document.getElementById("navOverlay"),
        navLinks: document.querySelectorAll(".nav-link"),

        // Contact Form
        contactForm: document.getElementById("contactForm"),

        // Back buttons on new pages
        pageBackBtns: document.querySelectorAll(".page-back-btn"),

        // About hero elements (for dynamic updates)
        aboutHeroAvatar: document.getElementById("aboutHeroAvatar"),
        aboutHeroName: document.getElementById("aboutHeroName"),
    };

    // --- State ---
    let currentCategory = "all";
    let currentStory = null;
    let currentPage = 0;
    let paragraphsPerPage = 4;
    let pages = [];
    let fontSize = 1.15;
    let likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || "[]");
    let bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || "[]");

    // ===== INITIALIZE =====
    function init() {
        loadTheme();
        createParticles();
        renderStories(STORIES);
        bindEvents();
        loadSavedSettings();
        // Restore admin mode if already authenticated
        if (isAuthenticated()) {
            document.body.classList.add("admin-mode");
        }
    }

    function showView(viewName) {
        Object.values(views).forEach((v) => v.classList.remove("active"));
        views[viewName].classList.add("active");
        window.scrollTo(0, 0);
        // Update nav active state
        if (el.navLinks) {
            el.navLinks.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("data-nav") === viewName);
            });
        }
    }

    // ===== THEME =====
    function loadTheme() {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME);
        if (saved === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
            el.themeIcon.textContent = "☀️";
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            document.documentElement.removeAttribute("data-theme");
            el.themeIcon.textContent = "🌙";
            localStorage.setItem(STORAGE_KEYS.THEME, "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            el.themeIcon.textContent = "☀️";
            localStorage.setItem(STORAGE_KEYS.THEME, "dark");
        }
    }

    // ===== PARTICLES =====
    function createParticles() {
        for (let i = 0; i < 18; i++) {
            const particle = document.createElement("div");
            particle.classList.add("particle");
            const size = Math.random() * 8 + 4;
            particle.style.width = size + "px";
            particle.style.height = size + "px";
            particle.style.left = Math.random() * 100 + "%";
            particle.style.animationDuration = Math.random() * 15 + 10 + "s";
            particle.style.animationDelay = Math.random() * 10 + "s";
            el.particlesContainer.appendChild(particle);
        }
    }

    // ===== TOAST NOTIFICATIONS =====
    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.classList.add("toast", type);
        toast.textContent = message;
        el.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = "toastOut 0.4s ease forwards";
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ===== RENDER STORIES (HOME GRID) =====
    function renderStories(stories) {
        if (stories.length === 0) {
            el.storiesGrid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">📚</div>
          <p>కథలు కనుగొనబడలేదు. వేరే పదాలతో వెతకండి.</p>
          <p style="margin-top:8px;font-size:0.85rem">No stories found. Try a different search.</p>
        </div>`;
            return;
        }

        el.storiesGrid.innerHTML = stories
            .map((story, index) => {
                const isLiked = likes.includes(story.id);
                const likeCount = isLiked ? 1 : 0;
                return `
      <div class="story-card" data-id="${story.id}" style="animation-delay: ${index * 0.08}s">
        <div class="card-cover">
          <div class="card-cover-bg" style="background: ${story.gradient}">
            ${story.emoji}
          </div>
          <div class="card-cover-overlay"></div>
          <span class="card-badge">${CATEGORY_NAMES[story.category] || story.category}</span>
          ${isLiked ? `<span class="card-likes">❤️ Liked</span>` : ""}
          <button class="card-admin-edit" data-edit-id="${story.id}" onclick="event.stopPropagation(); window.__editStoryFromCard(${story.id})">✏️ Edit</button>
        </div>
        <div class="card-body">
          <h3>${story.title}</h3>
          <div class="card-author">✍️ ${story.author}</div>
          <p class="card-excerpt">${story.excerpt}</p>
        </div>
        <div class="card-footer">
          <span class="card-meta">📖 ${story.readTime} read</span>
          <button class="card-read-btn">చదవండి →</button>
        </div>
      </div>`;
            })
            .join("");

        // Stagger animation
        document.querySelectorAll(".story-card").forEach((card, i) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            setTimeout(() => {
                card.style.transition = "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, i * 80 + 50);
        });

        // Bind card clicks
        document.querySelectorAll(".story-card").forEach((card) => {
            card.addEventListener("click", () => {
                const id = parseInt(card.getAttribute("data-id"));
                openStory(id);
            });
        });
    }

    // ===== FILTER STORIES =====
    function filterStories() {
        const query = el.searchInput.value.toLowerCase().trim();
        let filtered = STORIES;

        if (currentCategory !== "all") {
            filtered = filtered.filter((s) => s.category === currentCategory);
        }

        if (query) {
            filtered = filtered.filter(
                (s) =>
                    s.title.toLowerCase().includes(query) ||
                    s.author.toLowerCase().includes(query) ||
                    s.excerpt.toLowerCase().includes(query) ||
                    s.category.toLowerCase().includes(query)
            );
        }

        renderStories(filtered);
    }

    // ===== OPEN STORY (READER) =====
    function openStory(id) {
        currentStory = STORIES.find((s) => s.id === id);
        if (!currentStory) return;

        // Set cover
        el.readerTitle.textContent = currentStory.title;
        el.storyCoverTitle.textContent = currentStory.title;
        el.storyCoverAuthor.textContent = "✍️ " + currentStory.author;
        el.storyCoverCategory.textContent = CATEGORY_NAMES[currentStory.category] || currentStory.category;

        // Update like/bookmark buttons
        updateLikeBtn();
        updateBookmarkBtn();

        // Paginate content
        paginateContent();
        currentPage = 0;
        renderPage();

        showView("reader");
    }

    function paginateContent() {
        const content = currentStory.content;
        pages = [];
        for (let i = 0; i < content.length; i += paragraphsPerPage) {
            pages.push(content.slice(i, i + paragraphsPerPage));
        }
    }

    function renderPage() {
        const page = pages[currentPage];
        el.storyContent.innerHTML = page
            .map((p) => {
                if (p.startsWith("<div")) return p;
                return `<p>${p}</p>`;
            })
            .join("");

        // Update controls
        const total = pages.length;
        el.pageIndicator.textContent = `Page ${currentPage + 1} of ${total}`;
        el.prevPageBtn.disabled = currentPage === 0;
        el.nextPageBtn.disabled = currentPage === total - 1;

        // Progress
        const progress = ((currentPage + 1) / total) * 100;
        el.progressBar.style.width = progress + "%";

        // Animate content in
        el.storyContent.style.opacity = "0";
        el.storyContent.style.transform = "translateY(10px)";
        requestAnimationFrame(() => {
            el.storyContent.style.transition = "all 0.4s ease";
            el.storyContent.style.opacity = "1";
            el.storyContent.style.transform = "translateY(0)";
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // ===== FONT SIZE =====
    function changeFontSize(delta) {
        fontSize = Math.max(0.9, Math.min(1.8, fontSize + delta));
        document.documentElement.style.setProperty("--reading-size", fontSize + "rem");
    }

    // ===== LIKES =====
    function toggleLike() {
        if (!currentStory) return;
        const idx = likes.indexOf(currentStory.id);
        if (idx >= 0) {
            likes.splice(idx, 1);
            showToast("Like తీసేశారు", "info");
        } else {
            likes.push(currentStory.id);
            showToast("❤️ కథ Like చేశారు!", "success");
        }
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
        updateLikeBtn();
    }

    function updateLikeBtn() {
        if (!currentStory) return;
        const isLiked = likes.includes(currentStory.id);
        el.likeIcon.textContent = isLiked ? "❤️" : "🤍";
        if (isLiked) {
            el.likeBtn.classList.add("liked");
        } else {
            el.likeBtn.classList.remove("liked");
        }
    }

    // ===== BOOKMARKS =====
    function toggleBookmark() {
        if (!currentStory) return;
        const idx = bookmarks.indexOf(currentStory.id);
        if (idx >= 0) {
            bookmarks.splice(idx, 1);
            showToast("Bookmark తీసేశారు", "info");
        } else {
            bookmarks.push(currentStory.id);
            showToast("🔖 కథ Bookmark చేశారు!", "success");
        }
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        updateBookmarkBtn();
    }

    function updateBookmarkBtn() {
        if (!currentStory) return;
        const isBookmarked = bookmarks.includes(currentStory.id);
        el.bookmarkIcon.textContent = isBookmarked ? "📌" : "🔖";
        if (isBookmarked) {
            el.bookmarkBtn.classList.add("bookmarked");
        } else {
            el.bookmarkBtn.classList.remove("bookmarked");
        }
    }

    // ===== ADMIN LOGIN =====
    function handleLogin(e) {
        e.preventDefault();
        const password = el.adminPassword.value;
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem(STORAGE_KEYS.AUTH, "true");
            document.body.classList.add("admin-mode");
            el.loginError.style.display = "none";
            el.adminPassword.value = "";
            showToast("✅ Login Successful!", "success");
            showAdminDashboard();
        } else {
            el.loginError.style.display = "block";
            el.adminPassword.value = "";
        }
    }

    function isAuthenticated() {
        return sessionStorage.getItem(STORAGE_KEYS.AUTH) === "true";
    }

    function logout() {
        sessionStorage.removeItem(STORAGE_KEYS.AUTH);
        document.body.classList.remove("admin-mode");
        showToast("🚪 Logged out successfully", "info");
        showView("library");
        renderStories(STORIES);
    }

    // ===== ADMIN DASHBOARD =====
    function showAdminDashboard() {
        renderDashboardStats();
        renderStoriesTable();
        showView("adminDashboard");
    }

    function renderDashboardStats() {
        const categories = {};
        STORIES.forEach((s) => {
            categories[s.category] = (categories[s.category] || 0) + 1;
        });

        el.dashboardStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-number">${STORIES.length}</div>
        <div class="stat-label">Total Stories</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📂</div>
        <div class="stat-number">${Object.keys(categories).length}</div>
        <div class="stat-label">Categories</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❤️</div>
        <div class="stat-number">${likes.length}</div>
        <div class="stat-label">Total Likes</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔖</div>
        <div class="stat-number">${bookmarks.length}</div>
        <div class="stat-label">Bookmarks</div>
      </div>
    `;
    }

    function renderStoriesTable() {
        el.storiesTableBody.innerHTML = STORIES.map(
            (story) => `
      <tr>
        <td>${story.id}</td>
        <td>${story.emoji} ${story.title}</td>
        <td>${CATEGORY_NAMES[story.category] || story.category}</td>
        <td>${story.author}</td>
        <td class="actions-cell">
          <button class="btn-edit" onclick="window.__editStory(${story.id})">✏️ Edit</button>
          <button class="btn-danger" onclick="window.__deleteStory(${story.id})">🗑️ Delete</button>
        </td>
      </tr>`
        ).join("");
    }

    // ===== ADD / EDIT STORY =====
    function showAddForm() {
        el.formTitle.textContent = "➕ Add New Story";
        el.storyId.value = "";
        el.storyTitleInput.value = "";
        el.storyCategoryInput.value = "";
        el.storyAuthorInput.value = "Dasari Srikanth";
        el.storyReadTime.value = "5 min";
        el.storyEmoji.value = "📖";
        el.storyGradient.selectedIndex = 0;
        el.storyExcerpt.value = "";
        el.storyContentInput.value = "";
        showView("storyForm");
    }

    function showEditForm(id) {
        const story = STORIES.find((s) => s.id === id);
        if (!story) return;

        el.formTitle.textContent = "✏️ Edit Story";
        el.storyId.value = story.id;
        el.storyTitleInput.value = story.title;
        el.storyCategoryInput.value = story.category;
        el.storyAuthorInput.value = story.author;
        el.storyReadTime.value = story.readTime;
        el.storyEmoji.value = story.emoji;
        el.storyExcerpt.value = story.excerpt;
        el.storyContentInput.value = story.content.join("\n\n");

        // Try to match gradient
        const options = el.storyGradient.options;
        let matched = false;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === story.gradient) {
                el.storyGradient.selectedIndex = i;
                matched = true;
                break;
            }
        }
        if (!matched) el.storyGradient.selectedIndex = 0;

        showView("storyForm");
    }

    function handleStorySubmit(e) {
        e.preventDefault();

        const id = el.storyId.value;
        const title = el.storyTitleInput.value.trim();
        const category = el.storyCategoryInput.value;
        const author = el.storyAuthorInput.value.trim() || "Dasari Srikanth";
        const readTime = el.storyReadTime.value.trim() || "5 min";
        const emoji = el.storyEmoji.value.trim() || "📖";
        const gradient = el.storyGradient.value;
        const excerpt = el.storyExcerpt.value.trim();
        const contentRaw = el.storyContentInput.value.trim();
        const content = contentRaw.split(/\n\s*\n/).filter((p) => p.trim());

        if (!title || !category || !excerpt || content.length === 0) {
            showToast("❌ Please fill all required fields!", "error");
            return;
        }

        if (id) {
            // Edit existing
            const idx = STORIES.findIndex((s) => s.id === parseInt(id));
            if (idx >= 0) {
                STORIES[idx] = {
                    ...STORIES[idx],
                    title,
                    category,
                    author,
                    readTime,
                    emoji,
                    gradient,
                    excerpt,
                    content,
                };
                showToast("✅ Story updated successfully!", "success");
            }
        } else {
            // Add new
            const newId = STORIES.length > 0 ? Math.max(...STORIES.map((s) => s.id)) + 1 : 1;
            STORIES.push({
                id: newId,
                title,
                category,
                author,
                readTime,
                emoji,
                gradient,
                excerpt,
                content,
            });
            showToast("✅ New story added successfully!", "success");
        }

        saveStories();
        showAdminDashboard();
    }

    // ===== DELETE STORY =====
    function deleteStory(id) {
        // Create confirm dialog
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.innerHTML = `
      <div class="confirm-dialog">
        <h3>🗑️ Delete Story</h3>
        <p>Are you sure you want to delete this story? This action cannot be undone.</p>
        <div class="confirm-actions">
          <button class="btn-secondary" id="cancelDelete">Cancel</button>
          <button class="btn-danger" id="confirmDelete">Delete</button>
        </div>
      </div>
    `;
        document.body.appendChild(overlay);

        document.getElementById("cancelDelete").addEventListener("click", () => {
            overlay.remove();
        });

        document.getElementById("confirmDelete").addEventListener("click", () => {
            STORIES = STORIES.filter((s) => s.id !== id);
            saveStories();
            overlay.remove();
            showToast("🗑️ Story deleted successfully!", "success");
            showAdminDashboard();
        });
    }

    // Expose admin functions to global scope for table buttons
    window.__editStory = function (id) {
        showEditForm(id);
    };
    window.__deleteStory = function (id) {
        deleteStory(id);
    };

    // Edit story from card (admin only)
    window.__editStoryFromCard = function (id) {
        if (!isAuthenticated()) {
            showView("adminLogin");
            return;
        }
        showEditForm(id);
    };

    // ===== EVENTS =====
    function bindEvents() {
        // Theme
        el.themeToggle.addEventListener("click", toggleTheme);

        // Search
        el.searchInput.addEventListener("input", filterStories);

        // Category pills
        el.categoryPills.addEventListener("click", (e) => {
            if (e.target.classList.contains("pill")) {
                document.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
                e.target.classList.add("active");
                currentCategory = e.target.getAttribute("data-category");
                filterStories();
            }
        });

        // Logo - go home
        el.logoHome.addEventListener("click", () => {
            showView("library");
        });

        // Reader navigation
        el.backBtn.addEventListener("click", () => {
            showView("library");
            renderStories(STORIES);
        });

        el.prevPageBtn.addEventListener("click", () => {
            if (currentPage > 0) {
                currentPage--;
                renderPage();
            }
        });

        el.nextPageBtn.addEventListener("click", () => {
            if (currentPage < pages.length - 1) {
                currentPage++;
                renderPage();
            }
        });

        el.fontUpBtn.addEventListener("click", () => changeFontSize(0.1));
        el.fontDownBtn.addEventListener("click", () => changeFontSize(-0.1));

        // Like & Bookmark
        el.likeBtn.addEventListener("click", toggleLike);
        el.bookmarkBtn.addEventListener("click", toggleBookmark);

        // Admin link
        el.adminLink.addEventListener("click", () => {
            if (isAuthenticated()) {
                showAdminDashboard();
            } else {
                showView("adminLogin");
            }
        });

        // Admin login
        el.loginForm.addEventListener("submit", handleLogin);
        el.adminBackBtn.addEventListener("click", () => showView("library"));

        // Dashboard
        el.dashBackBtn.addEventListener("click", () => {
            showView("library");
            renderStories(STORIES);
        });
        el.addStoryBtn.addEventListener("click", showAddForm);
        el.logoutBtn.addEventListener("click", logout);

        // Story form
        el.storyFormEl.addEventListener("submit", handleStorySubmit);
        el.formBackBtn.addEventListener("click", () => showAdminDashboard());
        el.cancelFormBtn.addEventListener("click", () => showAdminDashboard());

        // Settings - Logo Upload
        el.logoUpload.addEventListener("change", (e) => {
            handleImageUpload(e.target, el.logoPreview, STORAGE_KEYS.LOGO_IMG, el.homeLogo);
        });

        // Settings - Writer Photo Upload
        el.writerUpload.addEventListener("change", (e) => {
            handleImageUpload(e.target, el.writerPreview, STORAGE_KEYS.WRITER_IMG, el.homeWriterAvatar);
        });

        // Settings - Reset Logo
        el.resetLogo.addEventListener("click", () => {
            resetImage(STORAGE_KEYS.LOGO_IMG, el.logoPreview, "logo.png", el.homeLogo);
        });

        // Settings - Reset Writer
        el.resetWriter.addEventListener("click", () => {
            resetImage(STORAGE_KEYS.WRITER_IMG, el.writerPreview, "writer.png", el.homeWriterAvatar);
        });

        // Settings - Save Writer Info
        el.saveWriterInfo.addEventListener("click", saveWriterInfoHandler);

        // Settings - Save About Writer
        el.saveAboutWriter.addEventListener("click", saveAboutWriterHandler);

        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
            if (!views.reader.classList.contains("active")) return;
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                if (currentPage > 0) {
                    currentPage--;
                    renderPage();
                }
            } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                if (currentPage < pages.length - 1) {
                    currentPage++;
                    renderPage();
                }
            } else if (e.key === "Escape") {
                el.backBtn.click();
            }
        });

        // ===== NAVIGATION MENU =====
        el.navHamburger.addEventListener("click", toggleNav);
        el.navOverlay.addEventListener("click", closeNav);

        el.navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                const target = link.getAttribute("data-nav");
                showView(target);
                if (target === "library") renderStories(STORIES);
                closeNav();
            });
        });

        // Back buttons on About Author and Contact pages
        el.pageBackBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-goback") || "library";
                showView(target);
                if (target === "library") renderStories(STORIES);
            });
        });

        // ===== CONTACT FORM =====
        if (el.contactForm) {
            el.contactForm.addEventListener("submit", handleContactSubmit);
        }
    }

    // ===== SETTINGS: IMAGE UPLOAD =====
    function handleImageUpload(inputEl, previewEl, storageKey, homeEl) {
        const file = inputEl.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("❌ Please select an image file!", "error");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast("❌ Image must be under 2MB!", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;
            previewEl.src = base64;
            if (homeEl) homeEl.src = base64;
            try {
                localStorage.setItem(storageKey, base64);
                showToast("✅ Image saved successfully!", "success");
            } catch (err) {
                showToast("❌ Image too large for storage!", "error");
            }
        };
        reader.readAsDataURL(file);
    }

    function resetImage(storageKey, previewEl, defaultSrc, homeEl) {
        localStorage.removeItem(storageKey);
        previewEl.src = defaultSrc;
        if (homeEl) homeEl.src = defaultSrc;
        showToast("🔄 Reset to default!", "info");
    }

    // ===== SETTINGS: WRITER INFO =====
    function saveWriterInfoHandler() {
        const name = el.writerNameSetting.value.trim();
        const desc = el.writerDescSetting.value.trim();
        if (!name) {
            showToast("❌ Writer name cannot be empty!", "error");
            return;
        }
        localStorage.setItem(STORAGE_KEYS.WRITER_NAME, name);
        localStorage.setItem(STORAGE_KEYS.WRITER_DESC, desc);
        el.homeWriterName.textContent = name;
        el.homeWriterDesc.textContent = desc;
        showToast("✅ Writer info saved!", "success");
    }

    // ===== SETTINGS: ABOUT WRITER =====
    function saveAboutWriterHandler() {
        const content = el.aboutWriterSetting.value.trim();
        if (!content) {
            showToast("❌ About writer content cannot be empty!", "error");
            return;
        }
        localStorage.setItem(STORAGE_KEYS.ABOUT_WRITER, content);
        el.aboutWriterContent.innerHTML = content;
        showToast("✅ About Writer updated!", "success");
    }

    // ===== LOAD SAVED SETTINGS =====
    function loadSavedSettings() {
        // Load saved logo
        const savedLogo = localStorage.getItem(STORAGE_KEYS.LOGO_IMG);
        if (savedLogo) {
            el.homeLogo.src = savedLogo;
            if (el.logoPreview) el.logoPreview.src = savedLogo;
            // Also update nav logo
            const navLogoImg = document.querySelector(".nav-logo-img");
            if (navLogoImg) navLogoImg.src = savedLogo;
        }

        // Load saved writer image
        const savedWriter = localStorage.getItem(STORAGE_KEYS.WRITER_IMG);
        if (savedWriter) {
            el.homeWriterAvatar.src = savedWriter;
            if (el.writerPreview) el.writerPreview.src = savedWriter;
            if (el.aboutHeroAvatar) el.aboutHeroAvatar.src = savedWriter;
        }

        // Load saved writer name/desc
        const savedName = localStorage.getItem(STORAGE_KEYS.WRITER_NAME);
        const savedDesc = localStorage.getItem(STORAGE_KEYS.WRITER_DESC);
        if (savedName) {
            el.homeWriterName.textContent = savedName;
            if (el.writerNameSetting) el.writerNameSetting.value = savedName;
            if (el.aboutHeroName) el.aboutHeroName.textContent = savedName;
        }
        if (savedDesc) {
            el.homeWriterDesc.textContent = savedDesc;
            if (el.writerDescSetting) el.writerDescSetting.value = savedDesc;
        }

        // Load saved about writer content
        const savedAbout = localStorage.getItem(STORAGE_KEYS.ABOUT_WRITER);
        if (savedAbout) {
            el.aboutWriterContent.innerHTML = savedAbout;
            if (el.aboutWriterSetting) el.aboutWriterSetting.value = savedAbout;
        }
    }

    // ===== NAVIGATION HELPERS =====
    function toggleNav() {
        const isOpen = el.navMenu.classList.contains("open");
        if (isOpen) {
            closeNav();
        } else {
            el.navMenu.classList.add("open");
            el.navOverlay.classList.add("open");
            el.navHamburger.classList.add("open");
        }
    }

    function closeNav() {
        el.navMenu.classList.remove("open");
        el.navOverlay.classList.remove("open");
        el.navHamburger.classList.remove("open");
    }

    // ===== CONTACT FORM HANDLER =====
    function handleContactSubmit(e) {
        e.preventDefault();
        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        if (!name || !email || !subject || !message) {
            showToast("❌ Please fill all fields!", "error");
            return;
        }

        // Save to localStorage
        const contacts = JSON.parse(localStorage.getItem("storybook-contacts") || "[]");
        contacts.push({ name, email, subject, message, date: new Date().toISOString() });
        localStorage.setItem("storybook-contacts", JSON.stringify(contacts));

        showToast("✅ మీ సందేశం పంపబడింది! Message sent successfully!", "success");
        el.contactForm.reset();
    }

    // ===== BOOT =====
    init();
})();
