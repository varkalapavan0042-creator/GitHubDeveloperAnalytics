
import os
from flask import Flask, jsonify, render_template
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
    static_url_path="/static"
)

@app.route("/check-static")
def check_static():
    css_path = os.path.join(BASE_DIR, "static", "style.css")
    return {
        "app_file": __file__,
        "static_folder": app.static_folder,
        "css_path": css_path,
        "css_exists": os.path.isfile(css_path)
    }


GITHUB_API = "https://api.github.com"


def github_get(path, params=None):
    """Request data from the GitHub API."""
    try:
        response = requests.get(
            f"{GITHUB_API}/{path}",
            params=params,
            headers={"Accept": "application/vnd.github+json"},
            timeout=15
        )
        return response, None
    except requests.RequestException:
        return None, "Could not connect to GitHub. Check your internet connection."


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/github/<username>")
def github_profile(username):
    response, error = github_get(f"users/{username}")

    if error:
        return jsonify({"error": error}), 502

    if response.status_code == 404:
        return jsonify({"error": "GitHub user not found."}), 404

    if response.status_code == 403:
        return jsonify({
            "error": "GitHub API rate limit reached. Please try again later."
        }), 429

    if response.status_code != 200:
        return jsonify({"error": "GitHub could not return this profile."}), 502

    data = response.json()

    return jsonify({
        "username": data.get("login"),
        "name": data.get("name"),
        "bio": data.get("bio"),
        "public_repos": data.get("public_repos", 0),
        "followers": data.get("followers", 0),
        "following": data.get("following", 0),
        "avatar": data.get("avatar_url"),
        "profile_url": data.get("html_url")
    })


@app.route("/api/github/<username>/repos")
def github_repositories(username):
    result = []
    total_stars = 0
    total_forks = 0
    total_size = 0
    languages = {}
    page = 1

    while True:
        response, error = github_get(
            f"users/{username}/repos",
            {
                "per_page": 100,
                "page": page,
                "sort": "updated",
                "type": "owner"
            }
        )

        if error:
            return jsonify({"error": error}), 502

        if response.status_code == 404:
            return jsonify({"error": "GitHub user not found."}), 404

        if response.status_code == 403:
            return jsonify({
                "error": "GitHub API rate limit reached. Please try again later."
            }), 429

        if response.status_code != 200:
            return jsonify({"error": "Could not fetch repositories."}), 502

        repos = response.json()

        for repo in repos:
            language = repo.get("language")

            if language:
                languages[language] = languages.get(language, 0) + 1

            stars = repo.get("stargazers_count", 0)
            forks = repo.get("forks_count", 0)
            size = repo.get("size", 0)

            total_stars += stars
            total_forks += forks
            total_size += size

            result.append({
                "name": repo.get("name"),
                "description": repo.get("description"),
                "language": language,
                "stars": stars,
                "forks": forks,
                "size": size,
                "updated_at": repo.get("updated_at"),
                "url": repo.get("html_url")
            })

        if len(repos) < 100:
            break

        page += 1

    return jsonify({
        "repositories": result,
        "analytics": {
            "total_repositories": len(result),
            "total_stars": total_stars,
            "total_forks": total_forks,
            "total_size": total_size,
            "languages": languages
        }
    })


if __name__ == "__main__":
    print("Dashboard file:", os.path.abspath(__file__))
    print("Static folder:", app.static_folder)
    print("CSS exists:", os.path.isfile(
        os.path.join(app.static_folder, "style.css")
    ))
    print("JavaScript exists:", os.path.isfile(
        os.path.join(app.static_folder, "js", "script.js")
    ))
    app.run(debug=True)
