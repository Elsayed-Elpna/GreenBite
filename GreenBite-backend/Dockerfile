FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
# RUN python manage.py migrate
# commands in management commands 
COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
