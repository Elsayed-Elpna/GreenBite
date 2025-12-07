# GREENBITE Backend

Backend for the GreenBite project built with:

- Django 6.0
- Django REST Framework
- djangorestframework-simplejwt (JWT auth)
- python-dotenv (env variables)

---

## 1. Requirements

- Python 3.11+ (preferably the same version used in the project)
- pip
- Git

Python packages are listed in `requirements.txt`, including:

# GreenBite — Backend

Welcome to GreenBite's backend! This repository contains the Django REST API that powers the GreenBite application.

Overview

- A Django 6 application exposing REST endpoints (Django REST Framework).
- JWT authentication via `djangorestframework-simplejwt`.
- Environment config with `python-dotenv`.

Quick status

- Framework: Django 6
- API: Django REST Framework
- Auth: Simple JWT

Prerequisites

- Python 3.11+
- `pip` (or `pip3`)
- `git`

Install dependencies

1. Clone the repo and enter it:

```bash
git clone <https://github.com/ran-ibra/GreenBite-backend>
cd GreenBite-backend
```

2. Create and activate a virtual environment (recommended):

Linux / macOS:

```bash
python -m venv .venv
source .venv/bin/activate
```

Windows (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

Configuration

1. Create a `.env` file in the project root (same folder as `manage.py`). Add the minimum variables:

```env
SECRET_KEY=replace-with-your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1 localhost
```

2. `project/settings.py` is configured to read from `.env` via `python-dotenv`.

Database & initial setup

1. Apply migrations:

```bash
python manage.py migrate
```

2. Create a superuser (admin):

```bash
python manage.py createsuperuser
```

Run the development server

```bash
python manage.py runserver
```

Recommended next steps

- Add real `SECRET_KEY` and set `DEBUG=False` for production.
- Configure `ALLOWED_HOSTS` and CORS as needed.
- Set up a production-ready database (Postgres) and static/media storage.

Project layout (important files)

- `manage.py` — Django CLI entrypoint
- `project/` — Django project settings, URLs, WSGI/ASGI
- `requirements.txt` — pinned Python dependencies

Repository structure

```
GREENBITE-BACKEND/
│
├── .venv/               ✔ virtual environment (ignored)
├── project/             ✔ main Django project folder
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── __init__.py
│
├── .env                 ✔ your secrets file (ignored)
├── .env.example         ✔ good practice for team members
├── .gitignore           ✔ correct
├── db.sqlite3           ✔ local dev database
├── manage.py
├── README.md
└── requirements.txt
```

**Environment file (`.env`)**

This project uses a `.env` file (read by `python-dotenv`) to store environment-specific configuration and secrets. Do NOT commit your real `.env` to the repository. Instead keep a `.env.example` with placeholder values and instructions.

Example `.env` (do not commit the real file):

```env
SECRET_KEY='django-insecure-...'
DEBUG=True
DATABASE_USER=root
DATABASE_PASS=1234
ALLOWED_HOSTS="127.0.0.1 localhost"
```

- **`SECRET_KEY`**: A long, unpredictable string used by Django for cryptographic signing. Keep this secret — if leaked, rotate it immediately and invalidate sessions/tokens.
- **`DEBUG`**: `True` in development (shows detailed error pages). Always set to `False` in production.
- **`DATABASE_USER` / `DATABASE_PASS`**: Credentials for your database. Do not store production credentials in a file tracked by git.
- **`ALLOWED_HOSTS`**: A space-separated list (or quoted string) of hostnames/IPs Django will serve. For local development use `127.0.0.1 localhost`.

Team guidance for `.env`:

- Add `.env` to your local machine only. Never `git add` or commit it.
- Create a `.env.example` file with placeholder values and add it to git. Example values help onboard new developers.
- Use environment-specific secrets management (Vault, GitHub Secrets, environment variables on CI/CD) for production.
- If you accidentally commit secrets, rotate them immediately (new `SECRET_KEY`, DB password, API keys) and remove the commit from history.

> Enjoy building GreenBite! 🥗
