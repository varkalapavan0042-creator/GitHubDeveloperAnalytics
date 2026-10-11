
const form = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const dashboard = document.getElementById("dashboard");
const welcome = document.getElementById("welcome");
const statusMessage = document.getElementById("statusMessage");
const repositoriesContainer = document.getElementById("repositories");
const languageLegend = document.getElementById("languageLegend");

let languageChart = null;
let requestNumber = 0;

function showStatus(message, type = "loading") {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    statusMessage.hidden = !message;
}

function clearDashboard() {
    dashboard.hidden = true;
    welcome.hidden = false;
    repositoriesContainer.replaceChildren();
    languageLegend.replaceChildren();

    if (languageChart) {
        languageChart.destroy();
        languageChart = null;
    }

    document.getElementById("avatar").removeAttribute("src");
    document.getElementById("profileName").textContent = "";
    document.getElementById("profileUsername").textContent = "";
    document.getElementById("profileUsername").removeAttribute("href");
    document.getElementById("profileLink").removeAttribute("href");
    document.getElementById("profileBio").textContent = "";
    document.getElementById("chartEmpty").hidden = true;

    [
        "publicRepos", "totalStars", "totalForks", "followers",
        "following", "repoCount", "totalSize", "languageCount"
    ].forEach(id => {
        document.getElementById(id).textContent = "0";
    });

    document.getElementById("repoBadge").textContent = "0 repositories";
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text ?? "";
    return element;
}

function renderProfile(profile) {
    document.getElementById("avatar").src = profile.avatar;
    document.getElementById("profileName").textContent =
        profile.name || profile.username;

    const usernameLink = document.getElementById("profileUsername");
    usernameLink.textContent = `@${profile.username}`;
    usernameLink.href = profile.profile_url;

    document.getElementById("profileLink").href = profile.profile_url;
    document.getElementById("profileBio").textContent =
        profile.bio || "No bio provided.";

    document.getElementById("publicRepos").textContent =
        formatNumber(profile.public_repos);
    document.getElementById("followers").textContent =
        formatNumber(profile.followers);
    document.getElementById("following").textContent =
        formatNumber(profile.following);
}

function renderChart(languages) {
    const entries = Object.entries(languages || {})
        .sort((a, b) => b[1] - a[1]);

    const canvas = document.getElementById("languageChart");
    const chartEmpty = document.getElementById("chartEmpty");

    languageLegend.replaceChildren();

    if (languageChart) {
        languageChart.destroy();
        languageChart = null;
    }

    if (!entries.length) {
        canvas.hidden = true;
        chartEmpty.hidden = false;
        return;
    }

    canvas.hidden = false;
    chartEmpty.hidden = true;

    const colors = [
        "#60a5fa", "#a78bfa", "#22d3ee", "#34d399",
        "#fbbf24", "#fb7185", "#818cf8", "#f97316",
        "#2dd4bf", "#c084fc"
    ];

    languageChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: entries.map(item => item[0]),
            datasets: [{
                data: entries.map(item => item[1]),
                backgroundColor: entries.map(
                    (_, index) => colors[index % colors.length]
                ),
                borderColor: "#111a2e",
                borderWidth: 4,
                hoverOffset: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: "68%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context =>
                            ` ${context.label}: ${context.raw} repositories`
                    }
                }
            }
        }
    });

    const total = entries.reduce((sum, item) => sum + item[1], 0);

    entries.forEach(([language, count], index) => {
        const item = document.createElement("div");
        item.className = "legend-item";

        const dot = document.createElement("span");
        dot.className = "legend-dot";
        dot.style.backgroundColor = colors[index % colors.length];

        const name = createTextElement("span", "legend-name", language);
        const amount = createTextElement(
            "strong",
            "legend-value",
            `${count} (${Math.round(count / total * 100)}%)`
        );

        item.append(dot, name, amount);
        languageLegend.appendChild(item);
    });
}

function renderRepositories(repositories) {
    repositoriesContainer.replaceChildren();

    if (!repositories.length) {
        repositoriesContainer.appendChild(
            createTextElement(
                "p",
                "no-repositories",
                "No public repositories found."
            )
        );
        return;
    }

    repositories.forEach(repo => {
        const card = document.createElement("article");
        card.className = "repository-card panel";

        const title = document.createElement("a");
        title.className = "repo-title";
        title.href = repo.url;
        title.target = "_blank";
        title.rel = "noopener noreferrer";
        title.textContent = repo.name;

        const description = createTextElement(
            "p",
            "repo-description",
            repo.description || "No description provided."
        );

        const meta = document.createElement("div");
        meta.className = "repo-meta";

        if (repo.language) {
            meta.appendChild(
                createTextElement("span", "language-tag", repo.language)
            );
        }

        meta.appendChild(createTextElement(
            "span", "", `★ ${formatNumber(repo.stars)}`
        ));
        meta.appendChild(createTextElement(
            "span", "", `⑂ ${formatNumber(repo.forks)}`
        ));

        const updated = createTextElement(
            "p",
            "repo-updated",
            repo.updated_at
                ? `Updated ${new Date(repo.updated_at).toLocaleDateString()}`
                : ""
        );

        card.append(title, description, meta, updated);
        repositoriesContainer.appendChild(card);
    });
}

async function analyzeUser(username) {
    const currentRequest = ++requestNumber;

    clearDashboard();
    showStatus("Analyzing GitHub profile...", "loading");
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    try {
        const profileResponse = await fetch(
            `/api/github/${encodeURIComponent(username)}`
        );

        const profile = await profileResponse.json();

        if (currentRequest !== requestNumber) return;

        if (!profileResponse.ok) {
            throw new Error(profile.error || "Could not load profile.");
        }

        const reposResponse = await fetch(
            `/api/github/${encodeURIComponent(username)}/repos`
        );

        const repoData = await reposResponse.json();

        if (currentRequest !== requestNumber) return;

        if (!reposResponse.ok) {
            throw new Error(repoData.error || "Could not load repositories.");
        }

        renderProfile(profile);

        const repositories = repoData.repositories || [];
        const analytics = repoData.analytics || {};

        document.getElementById("totalStars").textContent =
            formatNumber(analytics.total_stars);
        document.getElementById("totalForks").textContent =
            formatNumber(analytics.total_forks);
        document.getElementById("repoCount").textContent =
            formatNumber(repositories.length);
        document.getElementById("totalSize").textContent =
            `${formatNumber(analytics.total_size)} KB`;
        document.getElementById("languageCount").textContent =
            Object.keys(analytics.languages || {}).length;
        document.getElementById("repoBadge").textContent =
            `${repositories.length} repositories`;

        renderChart(analytics.languages);
        renderRepositories(repositories);

        welcome.hidden = true;
        dashboard.hidden = false;
        showStatus(
            `Analysis complete for @${profile.username}.`,
            "success"
        );
    } catch (error) {
        if (currentRequest !== requestNumber) return;

        clearDashboard();
        showStatus(error.message || "Something went wrong.", "error");
    } finally {
        if (currentRequest === requestNumber) {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "Analyze profile ↗";
        }
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        clearDashboard();
        showStatus("Please enter a GitHub username.", "error");
        return;
    }

    analyzeUser(username);
});

// Intentionally do not run a search when the page opens.
clearDashboard();
showStatus("");
