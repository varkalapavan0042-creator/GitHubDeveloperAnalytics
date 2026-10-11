# GitHub Developer Analytics Dashboard

A web-based dashboard that helps developers explore GitHub profiles, repository activity, programming languages, and project statistics in one place.

## Overview

The GitHub Developer Analytics Dashboard is built with Flask and the GitHub REST API. Users can enter a GitHub username to retrieve profile information, inspect public repositories, and view repository analytics through an interactive dashboard.

## Features

- **GitHub Profile Search** — Look up public GitHub profiles by username.
- **Profile Overview** — View profile information, bio, followers, following, and public repository count.
- **Repository Analytics** — Explore repository names, descriptions, programming languages, stars, forks, and update dates.
- **Programming Language Insights** — Visualize language distribution using charts.
- **Statistics Dashboard** — Review total stars, forks, and repository size.
- **Responsive Interface** — Dark-themed interface designed for desktop and mobile screens.
- **Error Handling** — Display useful feedback for invalid usernames and API request problems.

## Tech Stack

- **Backend:** Python, Flask
- **API:** GitHub REST API
- **Frontend:** HTML5, CSS3, JavaScript
- **Charts:** Chart.js
- **HTTP Requests:** Requests
- **Version Control:** Git and GitHub

## Getting Started

### Prerequisites

- Python 3 installed
- Git installed
- An internet connection to access the GitHub API and Chart.js CDN

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/GitHubDeveloperAnalytics.git
   ```

2. Enter the project directory:

   ```bash
   cd GitHubDeveloperAnalytics
   ```

3. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

4. Activate the environment on Windows:

   ```bash
   venv\Scripts\activate
   ```

5. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

6. Start the Flask application:

   ```bash  
   python app.py
   ```

7. Open the dashboard in your browser:

   http://127.0.0.1:5000/

### Usage

1. Open the dashboard.
2. Enter a public GitHub username.
3. Click **Analyze**.
4. Explore the profile details, repository cards, statistics, and charts.

## Project Structure

```text
GitHubDeveloperAnalytics/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── js/
        └── script.js
```

## Future Improvements

- Add repository language breakdowns and additional visualizations.
- Include repository sorting and filtering.
- Add historical activity insights.
- Improve API rate-limit feedback and caching.
- Deploy the application online.

## Author

**Varkala Pavan Kumar**

- GitHub: https://github.com/varkalapavan0042-creator
- LeetCode: https://leetcode.com/u/Pavan_Dark/

## License

A license has not yet been selected for this project.

# GitHubDeveloperAnalytics
A Flask web dashboard that analyzes GitHub profiles, repositories, programming languages, stars, and forks.79263d57a005a285c0d1321d632beda0ba958f02
